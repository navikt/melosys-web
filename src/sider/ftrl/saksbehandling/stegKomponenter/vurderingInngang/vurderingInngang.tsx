import { useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../../../hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";
import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Utils from "../../../../../utils";
import LabelMedHjelpetekst from "../../../../../felleskomponenter/labelMedHjelpetekst";
import { FellesHandlersContext } from "../../../../../contexts";
import { DialogboksOppfriskSak } from "../../../../../felleskomponenter/dialogboks";
import {
  mottatteOpplysningerOperations,
  mottatteOpplysningerSelectors,
} from "../../../../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { menypanelOperations } from "../../../../../ducks/menypanel";
import { landkoderSelectors } from "../../../../../ducks/landkoder";
import { navigeringOperations } from "../../../../../ducks/navigering";
import vurderingInngangSchema from "./vurderingInngangSchema";
import "./vurderingInngang.less";
import { modalerOperations, modalerSelectors } from "../../../../../ducks/modaler";
import { oppsummertfaktaOperations } from "../../../../../ducks/oppsummertfakta";
import { BehandlingUnderOppfriskningSelector } from "../../../../../ducks/modaler/selectors";
import * as KV from "../../../../../kodeverk";
import { BOOLSK_STRING } from "../../../../../constants";

const { YRKESAKTIV } = MKV.Koder.behandlinger.behandlingstema;

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export function VurderingInngang({ bekreft, aktivtSteg, oppdaterStatus }: Props) {
  const [visOppfrisk, setVisOppfrisk] = useState(false);
  const [gyldigeTrygdedekninger, setGyldigeTrygdedekninger] = useState<string[]>([]);
  const dispatch = useDispatch();

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const alleLandkoder = useSelector(landkoderSelectors.LandkoderSelector);
  const søknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const søknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.SisteOpplysningerHentetDatoSelector);
  const behandlingUnderOppfriskning = useSelector(BehandlingUnderOppfriskningSelector);
  const { lagreMottatteOpplysningerOgOppfriskSaksopplysninger } = useContext(FellesHandlersContext) as any;

  const initialValues = {
    fom: Utils.dato.formatterDatoTilNorsk(søknadsperiode?.fom, false, undefined),
    tom: Utils.dato.formatterDatoTilNorsk(søknadsperiode?.tom, false, undefined),
    land: søknadsland.landkoder || [],
    flereLandUkjentHvilke: registeropplysningerHentet
      ? Utils.streng.boolTilUppercaseStreng(søknadsland.flereLandUkjentHvilke)
      : null,
    trygdedekning: useSelector(mottatteOpplysningerSelectors.TrygdedekningSelector) ?? "",
    inkluderSiste5Aar: useSelector(modalerSelectors.InkluderSiste5AarSelector),
  };

  const {
    control,
    watch,
    setValue,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurderingInngangSchema),
    mode: "all",
    values: useMemo(() => initialValues as FieldValues, [initialValues]),
  });
  const formValues = watch();

  const skalHenteRegisteropplysninger =
    !registeropplysningerHentet ||
    !Utils.dato.erLikeDatoer(formValues.fom, initialValues.fom) ||
    !Utils.dato.erLikeDatoer(formValues.tom, initialValues.tom) ||
    !Utils._isEqual(formValues.land, initialValues.land) ||
    formValues.flereLandUkjentHvilke !== initialValues.flereLandUkjentHvilke ||
    formValues.trygdedekning !== initialValues.trygdedekning;

  useEffect(() => {
    Api.Ftrl.hentGyldigeTrygdedekninger(behandlingstema).then(setGyldigeTrygdedekninger);
  }, []);

  const stegErGyldig = formIsValid && !skalHenteRegisteropplysninger && !behandlingUnderOppfriskning;

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const mapLandkoder = () =>
    Utils.streng.uppercaseStrengTilBool(formValues.flereLandUkjentHvilke) ? [] : formValues.land;

  const mapFlereLandUkjentHvilke = () => Utils.streng.uppercaseStrengTilBool(formValues.flereLandUkjentHvilke);

  const oppdaterLokalMottatteOpplysninger = async () => {
    await Promise.all([
      dispatch(
        mottatteOpplysningerOperations.oppdaterPeriode({
          fom: Utils.dato.formatterDatoTilISO(formValues.fom, ""),
          tom: Utils.dato.formatterDatoTilISO(formValues.tom, ""),
        }),
      ),
      dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland(mapLandkoder(), mapFlereLandUkjentHvilke())),
      dispatch(mottatteOpplysningerOperations.oppdaterTrygdedekning(formValues.trygdedekning)),
    ]);
  };

  const bekreftOgFortsett = () => {
    if (skalHenteRegisteropplysninger) {
      oppdaterLokalMottatteOpplysninger()
        .then(() => {
          dispatch(modalerOperations.leggTilInkluderSiste5Aar(formValues.inkluderSiste5Aar));
        })
        .finally(() => {
          setVisOppfrisk(true);
        });
    } else {
      bekreft();
    }
  };

  if (!aktivtSteg) return null;

  const valgtLandHarTrygdeavtaleMedNorgeEllerErEøsLand = formValues.land?.some((land: string) =>
    MKV.Kodekombinasjoner.unikeAvtalelandKoder.includes(land),
  );
  const flereLandUkjentHvilkeErUSANN = formValues.flereLandUkjentHvilke === BOOLSK_STRING.USANN;
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const nyVurderingPeriodetekst =
    "Du skal kun endre søknadsperiode dersom det er mottatt informasjon om ny start og/eller sluttdato for oppholdet";

  return (
    <div className="vurderingInngang_ftrl">
      <Nav.Heading level="1" className="stegvelgertittel">
        Oppgi opplysninger fra søknaden
      </Nav.Heading>

      <div className="label__container">
        <Nav.Heading size="xsmall">Søknadsperiode</Nav.Heading>
        {erNyVurdering && <Nav.Detail>{nyVurderingPeriodetekst}</Nav.Detail>}
      </div>

      <div className="søknads_periode_wrapper">
        <Nav.Row className="søknads_periode">
          <Nav.Column className="fomDato">
            <Forms.Datovelger label="Fra og med" name="fom" readOnly={!redigerbart} control={control} />
          </Nav.Column>
          <Nav.Column>
            <Forms.Datovelger
              label={
                <LabelMedHjelpetekst
                  label="Til og med"
                  hjelpetekst={`Ved åpen søknadsperiode lar du "Til og med" feltet stå tomt. Medlemskapsperiode(r) registreres senere.`}
                />
              }
              name="tom"
              minDate={Utils.dato.norskStringTilDate(formValues.fom)}
              readOnly={!redigerbart}
              control={control}
            />
          </Nav.Column>

          <Nav.Column className="land_wrapper">
            <Forms.RadioGroup
              legend={
                behandlingstema === YRKESAKTIV ? (
                  <LabelMedHjelpetekst
                    label="Arbeidsland"
                    hjelpetekst="Oppgi landet der arbeidet utføres. Hvis søker arbeider på skip, skal du oppgi flagglandet"
                  />
                ) : (
                  <Nav.BodyLong weight="semibold" size="small" className="land">
                    Land
                  </Nav.BodyLong>
                )
              }
              control={control}
              name="flereLandUkjentHvilke"
              readOnly={!redigerbart}
            >
              <Nav.Radio value={BOOLSK_STRING.SANN} onChange={() => setValue("land", [])}>
                Flere land, ikke kjent hvilke
              </Nav.Radio>
              <Nav.Radio value={BOOLSK_STRING.USANN}>Velg land fra liste</Nav.Radio>
            </Forms.RadioGroup>
            {flereLandUkjentHvilkeErUSANN && (
              <Forms.MultiSelect
                label=""
                name="land"
                className="land_multiselect"
                redigerbart={redigerbart}
                control={control}
                options={alleLandkoder.map((kt) => ({ value: kt.kode, label: kt.term! }))}
                aria-label={behandlingstema === YRKESAKTIV ? "Arbeidsland" : "Land"}
              />
            )}
          </Nav.Column>

          <Nav.Column className="trygdedekning">
            <Forms.Select
              name="trygdedekning"
              control={control}
              label="Trygdedekning"
              emptyFieldDisabled={!!formValues.trygdedekning}
              readOnly={!redigerbart}
            >
              {gyldigeTrygdedekninger.map((dekning) => (
                <option key={dekning} value={dekning}>
                  {KV.kodeTilTerm(dekning, MKV.KTObjects.trygdedekninger)}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
        </Nav.Row>
      </div>

      {valgtLandHarTrygdeavtaleMedNorgeEllerErEøsLand && (
        <Nav.Alert variant="warning" className="alert">
          Ett eller flere av landene du har valgt er EØS- eller avtaleland
        </Nav.Alert>
      )}

      <Nav.Row>
        <Forms.Checkbox
          className="inkluderSiste5Aar"
          name="inkluderSiste5Aar"
          control={control}
          label="Hent registeropplysninger for siste 5 år"
          value="Hent registeropplysninger for siste 5 år"
          readOnly={!redigerbart}
        />
      </Nav.Row>

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreftOgFortsett,
          disabled: !formIsValid || !redigerbart,
        }}
      />

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={async () => {
            await lagreMottatteOpplysningerOgOppfriskSaksopplysninger();
            dispatch(oppsummertfaktaOperations.lagreArbeidsland(behandlingID, { arbeidsland: mapLandkoder() }));
          }}
          avbryt={() => setVisOppfrisk(false)}
          lukk={() => {
            setVisOppfrisk(false);
            dispatch(menypanelOperations.visMenypanel());
            bekreft();
          }}
          tilForsiden={() => {
            setVisOppfrisk(false);
            dispatch(navigeringOperations.tilForsiden());
          }}
          bekreftetFraStart
        />
      )}
    </div>
  );
}
