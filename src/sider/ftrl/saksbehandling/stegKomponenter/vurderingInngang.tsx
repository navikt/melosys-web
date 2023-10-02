import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";

import MKV from "../../../../melosyskodeverk";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Utils from "../../../../utils";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { FellesHandlersContext } from "../../../../contexts";
import { DialogboksOppfriskSak } from "../../../../felleskomponenter/dialogboks";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { landkoderSelectors } from "../../../../ducks/landkoder";
import { navigeringOperations } from "../../../../ducks/navigering";

import vurderingInngangSchema from "./vurderingInngangSchema";
import "./vurderingInngang.css";
import { modalerOperations, modalerSelectors } from "../../../../ducks/modaler";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingInngang = ({ bekreft, aktivtSteg, oppdaterStatus }: Props) => {
  const [visOppfrisk, setVisOppfrisk] = useState(false);
  const dispatch = useDispatch();

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const trygdedekninger = useSelector(folketrygdenkodeverkSelectors.TrygdedekningerSelector);
  const alleLandkoder = useSelector(landkoderSelectors.LandkoderSelector);
  const søknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.SisteOpplysningerHentetDatoSelector);
  const { lagreMottatteOpplysningerOgOppfriskSaksopplysninger } = useContext(FellesHandlersContext) as any;

  const initialValues = {
    fom: Utils.dato.formatterDatoTilNorsk(søknadsperiode?.fom, false, undefined),
    tom: Utils.dato.formatterDatoTilNorsk(søknadsperiode?.tom, false, undefined),
    land: useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector).toString(),
    trygdedekning: useSelector(mottatteOpplysningerSelectors.TrygdedekningSelector),
    inkluderSiste5Aar: useSelector(modalerSelectors.InkluderSiste5AarSelector),
  };

  const {
    control,
    watch,
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
    formValues.land !== initialValues.land ||
    formValues.trygdedekning !== initialValues.trygdedekning;

  const stegErGyldig = formIsValid && !skalHenteRegisteropplysninger;

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const oppdaterLokalMottatteOpplysninger = async () => {
    await Promise.all([
      dispatch(
        mottatteOpplysningerOperations.oppdaterPeriode({
          fom: Utils.dato.formatterDatoTilISO(formValues.fom, null, ""),
          tom: Utils.dato.formatterDatoTilISO(formValues.tom, null, ""),
        })
      ),
      dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland(formValues.land ? [formValues.land] : [], false)),
      dispatch(mottatteOpplysningerOperations.oppdaterTrygdedekning(formValues.trygdedekning)),
      dispatch(modalerOperations.leggTilInkluderSiste5Aar(formValues.inkluderSiste5Aar)),
    ]);
  };

  const bekreftOgFortsett = () => {
    if (skalHenteRegisteropplysninger) {
      oppdaterLokalMottatteOpplysninger().finally(() => {
        setVisOppfrisk(true);
      });
    } else {
      bekreft();
    }
  };

  if (!aktivtSteg) return null;

  const valgtLandHarTrygdeavtaleMedNorgeEllerErEøsLand = formValues.land
    ? MKV.Kodekombinasjoner.unikeAvtalelandKoder.includes(formValues.land)
    : false;
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const nyVurderingPeriodetekst =
    "Du skal kun endre søknadsperiode dersom det er mottatt informasjon om ny start og/eller sluttdato for oppholdet";

  return (
    <div className="vurderingInngang_ftrl">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Oppgi opplysninger fra søknaden</Nav.Typo.Innholdstittel>

      <div className="label__container">
        <Nav.Typo.Undertittel>Søknadsperiode</Nav.Typo.Undertittel>
        {erNyVurdering && <Nav.Typo.Undertekst>{nyVurderingPeriodetekst}</Nav.Typo.Undertekst>}
      </div>

      <Nav.Row>
        <Nav.Column xs="2">
          <Forms.Datovelger label="Fra og med" name="fom" disabled={!redigerbart} control={control} />
        </Nav.Column>
        <Nav.Column xs="2">
          <Forms.Datovelger
            label={
              <LabelMedHjelpetekst
                label="Til og med"
                hjelpetekst={`Ved åpen søknadsperiode lar du "Til og med" feltet stå tomt. Medlemskapsperiode(r) registreres senere.`}
                hjelpetekstClassName="hjelpetekst"
              />
            }
            name="tom"
            minDate={Utils.dato.norskStringTilDate(formValues.fom)}
            disabled={!redigerbart}
            control={control}
          />
        </Nav.Column>
        <Nav.Column xs="3">
          <Forms.Select
            label={
              <LabelMedHjelpetekst
                label="Arbeidsland"
                hjelpetekst="Oppgi landet der arbeidet utføres. Hvis søker arbeider på skip, skal du oppgi flagglandet"
                hjelpetekstClassName="hjelpetekst"
              />
            }
            emptyFieldDisabled={!!formValues.land}
            name="land"
            disabled={!redigerbart}
            control={control}
          >
            {alleLandkoder.map((item: KTObject) => (
              <option key={item.kode} value={item.kode}>
                {item.term}
              </option>
            ))}
          </Forms.Select>
        </Nav.Column>
        <Nav.Column xs="5">
          <Forms.Select
            name="trygdedekning"
            control={control}
            label="Trygdedekning"
            emptyFieldDisabled={!!formValues.trygdedekning}
            disabled={!redigerbart}
          >
            {trygdedekninger.map((item: KTObject) => (
              <option key={item.kode} value={item.kode}>
                {item.term}
              </option>
            ))}
          </Forms.Select>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Forms.Checkbox
          className="inkluderSiste5Aar"
          name="inkluderSiste5Aar"
          control={control}
          label="Hent registeropplysninger for 5 år"
          value="Inkluder siste 5 år"
          disabled={!redigerbart}
        />
      </Nav.Row>
      {valgtLandHarTrygdeavtaleMedNorgeEllerErEøsLand && (
        <Nav.Row>
          <Nav.Column xs="4" />
          <Nav.Column xs="3">
            <Nav.AlertStripeAdvarsel>
              Landet er et EØS-land og/eller et land Norge har trygdeavtale med
            </Nav.AlertStripeAdvarsel>
          </Nav.Column>
        </Nav.Row>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreftOgFortsett,
          disabled: !formIsValid || !redigerbart,
        }}
      />

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={lagreMottatteOpplysningerOgOppfriskSaksopplysninger}
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
};
