import { useCallback, useContext, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Utils from "../../../../utils";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { StegStatus } from "../../stegvelger";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { formSelectors } from "../../../../ducks/form";

import { LandValgSomOptions } from "./vurderingInngangKomponenter";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurdering_inngang from "./vurderingInngangSchema";

import "./vurderingInngang.css";
import { TomFlytMelding } from "../../../../felleskomponenter/alertmeldinger";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { DialogboksOppfriskSak } from "../../../../felleskomponenter/dialogboks";
import { FellesHandlersContext } from "../../../../contexts";
import { navigeringOperations } from "../../../../ducks/navigering";

interface Periode {
  fom?: string | null;
  tom?: string | null;
}

const initializeValues = (periode: Periode, landkoder: string[]) => ({
  fom: Utils.dato.formatterDatoTilNorsk(periode.fom, false, undefined),
  tom: Utils.dato.formatterDatoTilNorsk(periode.tom, false, undefined),
  arbeidsland: landkoder[0],
});

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.Trygdeavtale.INNGANG)(state),
  initialValues: initializeValues(
    mottatteOpplysningerSelectors.PeriodeSelector(state),
    mottatteOpplysningerSelectors.SoknadslandkoderSelector(state)
  ),
  formIsValid: formSelectors.TrygdeavtaleInngangFormValidSelector(state),
  registeropplysningerHentet: behandlingerSelectors.SisteOpplysningerHentetDatoSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  visMenypanel: () => dispatch(menypanelOperations.visMenypanel()),
  oppdaterPeriode: (periode: Periode) => dispatch(mottatteOpplysningerOperations.oppdaterPeriode(periode)),
  oppdaterSoeknadsland: (landkoder: string[]) =>
    dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland(landkoder, false)),
  lagreMottatteOpplysninger: () => dispatch(mottatteOpplysningerOperations.lagre()),
  tilForsiden: () => dispatch(navigeringOperations.tilForsiden()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  fom?: string;
  tom?: string;
  arbeidsland?: string;
}

interface Props {
  data: Api.Trygdeavtale.StegData;
  fortsett: () => void;
  formValues: FormValuesProps;
  hentFlytOgOppdaterAktuelleSteg: () => void;
  redigerbart: boolean;
  resultat: Api.Trygdeavtale.Resultat;
  steg: Api.Trygdeavtale.Steg;
  oppdaterFlyt: (resultat: Api.Trygdeavtale.Resultat) => void;
  oppfriskFlyt: () => void;
  aktivtSteg: boolean;
}

const VurderingInngang = ({
  data: { landValg, landValgUtenStøtte },
  formValues,
  formIsValid,
  fortsett,
  initialValues,
  hentFlytOgOppdaterAktuelleSteg,
  lagreMottatteOpplysninger,
  redigerbart,
  resultat,
  steg,
  oppdaterPeriode,
  oppdaterSoeknadsland,
  oppdaterFlyt,
  visMenypanel,
  aktivtSteg,
  registeropplysningerHentet,
  tilForsiden,
}: PropsFromRedux & Props) => {
  const { oppfriskOgLastInnSaksopplysninger } = useContext(FellesHandlersContext) as any;
  const [initialFomTomLand, setInitialFomTomLand] = useState<{ fom?: string; tom?: string; arbeidsland?: string }>({});
  const [landUtenStøtteValgt, setLandUtenStøtteValgt] = useState(false);
  const [visOppfrisk, setVisOppfrisk] = useState(false);

  const skalHenteRegisteropplysninger =
    !registeropplysningerHentet ||
    formValues?.fom !== initialFomTomLand?.fom ||
    formValues?.tom !== initialFomTomLand?.tom ||
    formValues?.arbeidsland !== initialFomTomLand?.arbeidsland;

  useEffect(() => {
    if (registeropplysningerHentet) {
      visMenypanel();
    }
    if (!Utils._isEmpty(initialValues.fom) && !Utils._isEmpty(initialValues.arbeidsland)) {
      setInitialFomTomLand({ fom: initialValues.fom, tom: initialValues.tom, arbeidsland: initialValues.arbeidsland });
    }
  }, []);

  const lagreMottatteOpplysningerOgOppdaterFlyt = async () => {
    await lagreMottatteOpplysninger();
    hentFlytOgOppdaterAktuelleSteg();
  };
  const debouncedLagremottatteOpplysningerOgOppdaterFlyt = useCallback(
    Utils._debounce(lagreMottatteOpplysningerOgOppdaterFlyt, 300),
    []
  );

  useEffect(() => {
    if (redigerbart && formValues && formIsValid && aktivtSteg) {
      oppdaterPeriode({
        fom: Utils.dato.formatterDatoTilISO(formValues.fom, false, undefined),
        tom: Utils.dato.formatterDatoTilISO(formValues.tom, false, undefined),
      });
      oppdaterSoeknadsland(formValues?.arbeidsland ? [formValues.arbeidsland] : []);

      debouncedLagremottatteOpplysningerOgOppdaterFlyt();
    }
  }, [formValues?.fom, formValues?.tom, formValues?.arbeidsland, formIsValid]);

  useEffect(() => {
    if (redigerbart && formValues && aktivtSteg) {
      setLandUtenStøtteValgt(
        formValues.arbeidsland ? !landValg.map(({ kode }) => kode).includes(formValues.arbeidsland) : false
      );
      oppdaterFlyt(resultat);
    }
  }, [formValues?.arbeidsland]);

  const innhentRegisteropplysninger = () => {
    setInitialFomTomLand({ fom: formValues.fom, tom: formValues.tom, arbeidsland: formValues.arbeidsland });
    setVisOppfrisk(true);
  };

  const bekreftOgFortsett = () => {
    if (skalHenteRegisteropplysninger) {
      innhentRegisteropplysninger();
    } else {
      hentFlytOgOppdaterAktuelleSteg();
      fortsett();
    }
  };

  return (
    <div className="vurderingInngang_trygdeavtale">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Oppgi opplysninger fra søknaden</Nav.Typo.Innholdstittel>

      <Nav.Typo.Undertittel className="periode_label">Periode</Nav.Typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="3">
          <Skjema.Datovelger label="Fra og med" feltNavn="fom" disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="3">
          <Skjema.Datovelger
            label={
              <LabelMedHjelpetekst
                label="Til og med"
                hjelpetekst={`Ved åpen søknadsperiode lar du "Til og med" feltet stå tomt. Lovvalgsperiode registreres senere.`}
              />
            }
            feltNavn="tom"
            minDate={Utils.dato.norskStringTilDate(formValues?.fom)}
            disabled={!redigerbart}
          />
        </Nav.Column>
        <Nav.Column xs="5">
          <Skjema.Select
            label={
              <LabelMedHjelpetekst
                label="Arbeidsland"
                hjelpetekst="Oppgi landet der arbeidet utføres. Hvis søker arbeider på skip, skal du oppgi flagglandet."
              />
            }
            feltNavn="arbeidsland"
            disabled={!redigerbart}
            emptyFieldDisabled={!!formValues?.arbeidsland}
          >
            <LandValgSomOptions landValg={landValg} />
            {landValg && landValgUtenStøtte && <option disabled>{"\u2500"}</option>}
            <LandValgSomOptions landValg={landValgUtenStøtte} />
          </Skjema.Select>
        </Nav.Column>
      </Nav.Row>

      {landUtenStøtteValgt && <TomFlytMelding />}

      {landUtenStøtteValgt && skalHenteRegisteropplysninger && (
        <Mui.StegKnapper
          bekreftKnappProps={{
            onClick: innhentRegisteropplysninger,
            disabled: steg.status !== StegStatus.FERDIG || !formIsValid || !redigerbart,
          }}
          bekreftTekst="Innhent registeropplysninger"
        />
      )}

      {!landUtenStøtteValgt && (
        <Mui.StegKnapper
          bekreftKnappProps={{
            onClick: bekreftOgFortsett,
            disabled: steg.status !== StegStatus.FERDIG || !formIsValid || !redigerbart,
          }}
        />
      )}

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={oppfriskOgLastInnSaksopplysninger}
          avbryt={() => setVisOppfrisk(false)}
          lukk={() => {
            setVisOppfrisk(false);
            visMenypanel();
          }}
          tilForsiden={() => {
            setVisOppfrisk(false);
            tilForsiden();
          }}
          bekreftetFraStart
        />
      )}
    </div>
  );
};

const VurderingInngangForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.Trygdeavtale.INNGANG,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurdering_inngang),
})(VurderingInngang);

export default connector(VurderingInngangForm);
