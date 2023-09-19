import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Utils from "../../../../utils";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { TomFlytMelding } from "../../../../felleskomponenter/alertmeldinger";
import { FellesHandlersContext } from "../../../../contexts";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { landkoderSelectors } from "../../../../ducks/landkoder";
import { navigeringOperations } from "../../../../ducks/navigering";

import vurderingInngangSchema from "./vurderingInngangSchema";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import MKV from "../../../../melosyskodeverk";
import { DialogboksOppfriskSak } from "../../../../felleskomponenter/dialogboks";
import "./vurderingInngang.css";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingInngang = ({ bekreft, aktivtSteg, oppdaterStatus }: Props) => {
  const [visOppfrisk, setVisOppfrisk] = useState(false);
  const dispatch = useDispatch();

  const periodeFom = Utils.dato.formatterDatoTilNorsk(useSelector(mottatteOpplysningerSelectors.PeriodeFomSelector));
  const periodeTom = Utils.dato.formatterDatoTilNorsk(useSelector(mottatteOpplysningerSelectors.PeriodeTomSelector));
  const søknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector)[0];
  const landkoder = useSelector(landkoderSelectors.LandkoderFraSakstypeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.SisteOpplysningerHentetDatoSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const { lagreMottatteOpplysningerOgOppfriskSaksopplysninger } = useContext(FellesHandlersContext) as any;

  const { control, watch, formState, trigger } = useForm({
    resolver: yupResolver(vurderingInngangSchema),
    mode: "all",
    defaultValues: {
      fom: periodeFom,
      tom: periodeTom,
      land: søknadsland,
    } as FieldValues,
  });
  const formValues = watch();

  const skalHenteRegisteropplysninger =
    !registeropplysningerHentet ||
    !Utils.dato.erLikeDatoer(formValues?.fom, periodeFom) ||
    !Utils.dato.erLikeDatoer(formValues?.tom, periodeTom) ||
    formValues?.land !== søknadsland;

  const landUtenStøtteValgt =
    sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE &&
    (formValues.land === MKV.Koder.landkoder.FR || formValues.land === MKV.Koder.landkoder.IT);

  const stegErGyldig = formState?.isValid && !skalHenteRegisteropplysninger && !landUtenStøtteValgt;

  useEffect(() => {
    if (registeropplysningerHentet) {
      dispatch(menypanelOperations.visMenypanel());
    }
  }, []);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const lagrePeriodeOgLand = async () => {
    await Promise.all([
      dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland([formValues.land], false)),
      dispatch(
        mottatteOpplysningerOperations.oppdaterPeriode({
          fom: Utils.dato.formatterDatoTilISO(formValues.fom, null, ""),
          tom: Utils.dato.formatterDatoTilISO(formValues.tom, null, ""),
        })
      ),
    ]);
  };

  const innhentRegisteropplysninger = () => {
    lagrePeriodeOgLand().finally(() => setVisOppfrisk(true));
  };

  const bekreftOgFortsett = () => {
    if (skalHenteRegisteropplysninger) {
      innhentRegisteropplysninger();
    } else {
      bekreft();
    }
  };

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingInngang_ikkeYrkesaktiv">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Oppgi opplysninger fra søknaden</Nav.Typo.Innholdstittel>

      <Nav.Typo.Undertittel className="periode_label">Periode</Nav.Typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="3">
          <Forms.Datovelger
            label="Fra og med"
            name="fom"
            disabled={!redigerbart}
            control={control}
            onChange={() => trigger("tom")}
          />
        </Nav.Column>
        <Nav.Column xs="3">
          <Forms.Datovelger
            label={
              <LabelMedHjelpetekst
                label="Til og med"
                hjelpetekst={`Ved åpen søknadsperiode lar du "Til og med" feltet stå tomt. Lovvalgsperiode registreres senere.`}
              />
            }
            minDate={Utils.dato.norskStringTilDate(formValues?.fom)}
            name="tom"
            disabled={!redigerbart}
            control={control}
          />
        </Nav.Column>
        <Nav.Column xs="5">
          <Forms.Select
            label="Land"
            emptyFieldDisabled={!!formValues.land}
            name="land"
            disabled={!redigerbart}
            control={control}
          >
            {landkoder.map((item: KTObject) => (
              <option key={item.kode} value={item.kode}>
                {item.term}
              </option>
            ))}
          </Forms.Select>
        </Nav.Column>
      </Nav.Row>

      {landUtenStøtteValgt && <TomFlytMelding />}

      {landUtenStøtteValgt && skalHenteRegisteropplysninger && (
        <Mui.StegKnapper
          bekreftKnappProps={{
            onClick: innhentRegisteropplysninger,
            disabled: !formState?.isValid || !redigerbart,
          }}
          bekreftTekst="Innhent registeropplysninger"
        />
      )}

      {!landUtenStøtteValgt && (
        <Mui.StegKnapper
          bekreftKnappProps={{
            onClick: bekreftOgFortsett,
            disabled: !formState?.isValid || !redigerbart,
          }}
        />
      )}

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={lagreMottatteOpplysningerOgOppfriskSaksopplysninger}
          avbryt={() => setVisOppfrisk(false)}
          lukk={() => {
            setVisOppfrisk(false);
            dispatch(menypanelOperations.visMenypanel());
            if (!landUtenStøtteValgt) {
              bekreft();
            }
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
