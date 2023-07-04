import React, { useCallback, useEffect, useState } from "react";
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

interface Periode {
  fom?: string | null;
  tom?: string | null;
}

const initializeValues = (periode: Periode, landkoder: string[]) => ({
  fom: periode.fom ? Utils.dato.formatterDatoTilNorsk(periode.fom) : undefined,
  tom: periode.tom ? Utils.dato.formatterDatoTilNorsk(periode.tom) : undefined,
  arbeidsland: landkoder[0],
});

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.Trygdeavtale.INNGANG)(state),
  initialValues: initializeValues(
    mottatteOpplysningerSelectors.PeriodeSelector(state),
    mottatteOpplysningerSelectors.SoknadslandkoderSelector(state)
  ),
  formIsValid: formSelectors.TrygdeavtaleInngangFormValidSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  visMenypanel: () => dispatch(menypanelOperations.visMenypanel()),
  oppdaterPeriode: (periode: Periode) => dispatch(mottatteOpplysningerOperations.oppdaterPeriode(periode)),
  oppdaterSoeknadsland: (landkoder: string[]) =>
    dispatch(mottatteOpplysningerOperations.oppdaterSoeknadsland(landkoder, false)),
  lagreMottatteOpplysninger: () => dispatch(mottatteOpplysningerOperations.lagre()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  fom?: string;
  tom?: string;
  arbeidsland?: string;
}

interface Props {
  annenBehandlingOppfriskes: boolean;
  data: Api.Trygdeavtale.StegData;
  fortsett: () => void;
  formValues: FormValuesProps;
  hentFlytOgOppdaterAktuelleSteg: () => void;
  redigerbart: boolean;
  resultat: Api.Trygdeavtale.Resultat;
  steg: Api.Trygdeavtale.Steg;
  tilForsiden: () => void;
  oppfriskOgLastInnSaksopplysninger: () => void;
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
  oppfriskOgLastInnSaksopplysninger,
  oppdaterFlyt,
  oppfriskFlyt,
  visMenypanel,
  aktivtSteg,
}: PropsFromRedux & Props) => {
  const [initialFomTomLand, setInitialFomTomLand] = useState<{ fom?: string; tom?: string; arbeidsland?: string }>({});
  const [landUtenStøtteValgt, setLandUtenStøtteValgt] = useState(false);
  const [visSpinner, setVisSpinner] = useState(false);
  const skalHenteRegisteropplysninger =
    formValues?.fom !== initialFomTomLand?.fom ||
    formValues?.tom !== initialFomTomLand?.tom ||
    formValues?.arbeidsland !== initialFomTomLand?.arbeidsland;

  useEffect(() => {
    if (!Utils._isEmpty(initialValues.fom) && !Utils._isEmpty(initialValues.arbeidsland)) {
      visMenypanel();
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
      const isoFom = Utils.dato.formatterDatoTilISO(formValues.fom);
      const isoTom = Utils.dato.formatterDatoTilISO(formValues.tom);
      oppdaterPeriode({
        fom: isoFom === "Invalid date" ? null : isoFom,
        tom: isoTom === "Invalid date" ? null : isoTom,
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

  const bekreftHandle = async () => {
    setInitialFomTomLand({ fom: formValues.fom, tom: formValues.tom, arbeidsland: formValues.arbeidsland });
    if (skalHenteRegisteropplysninger) {
      setVisSpinner(true);
      await oppfriskOgLastInnSaksopplysninger();
      setVisSpinner(false);
      oppfriskFlyt();
      visMenypanel();
    }
    fortsett();
  };

  return (
    <div className="vurderingInngang">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Oppgi opplysninger fra søknaden</Nav.Typo.Innholdstittel>
      <Nav.Fieldset legend="Periode">
        <Nav.Row>
          <Nav.Column xs="3">
            <Skjema.Datovelger label="Fra og med" feltNavn="fom" disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs="3">
            <Skjema.Datovelger label="Til og med" feltNavn="tom" disabled={!redigerbart} />
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
            >
              <LandValgSomOptions landValg={landValg} />
              {landValg && landValgUtenStøtte && <option disabled>{"\u2500"}</option>}
              <LandValgSomOptions landValg={landValgUtenStøtte} />
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      {landUtenStøtteValgt && <TomFlytMelding />}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreftHandle,
          disabled: steg.status !== StegStatus.FERDIG || !formIsValid || !redigerbart || landUtenStøtteValgt,
          spinner: visSpinner,
        }}
        bekreftTekst="Bekreft og innhent registeropplysninger"
      />
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
