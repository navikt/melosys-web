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
import { useFeatureToggle } from "../../../../featuretoggle";
import { StegStatus } from "../../stegvelger";

import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../../../ducks/behandlingsgrunnlag";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { formSelectors } from "../../../../ducks/form";

import { FlytFinnesIkke, LandValgSomOptions } from "./vurderingInngangKomponenter";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurdering_inngang from "./vurderingInngangSchema";

import "./vurderingInngang.css";

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
    behandlingsgrunnlagSelectors.PeriodeSelector(state),
    behandlingsgrunnlagSelectors.SoknadslandkoderSelector(state)
  ),
  formIsValid: formSelectors.TrygdeavtaleInngangFormValidSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  visMenypanel: () => dispatch(menypanelOperations.visMenypanel()),
  oppdaterPeriode: (periode: Periode) => dispatch(behandlingsgrunnlagOperations.oppdaterPeriode(periode)),
  oppdaterSoeknadsland: (landkoder: string[]) =>
    dispatch(behandlingsgrunnlagOperations.oppdaterSoeknadsland(landkoder, false)),
  lagreBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.lagre()),
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
  resetFlyt: () => void;
}

const VurderingInngang = ({
  data: { landValg, landValgUtenStøtte },
  formValues,
  formIsValid,
  fortsett,
  initialValues,
  hentFlytOgOppdaterAktuelleSteg,
  lagreBehandlingsgrunnlag,
  redigerbart,
  resultat,
  steg,
  oppdaterPeriode,
  oppdaterSoeknadsland,
  oppfriskOgLastInnSaksopplysninger,
  oppdaterFlyt,
  resetFlyt,
  visMenypanel,
}: PropsFromRedux & Props) => {
  const [initialFomTomLand, setInitialFomTomLand] = useState<{ fom?: string; tom?: string; arbeidsland?: string }>({});
  const [landUtenStøtteValgt, setLandUtenStøtteValgt] = useState(false);
  const [visSpinner, setVisSpinner] = useState(false);
  const skalHenteRegisteropplysninger =
    formValues?.fom !== initialFomTomLand?.fom ||
    formValues?.tom !== initialFomTomLand?.tom ||
    formValues?.arbeidsland !== initialFomTomLand?.arbeidsland;

  const behandleAlleSakerToggle = useFeatureToggle("melosys.behandle_alle_saker");

  useEffect(() => {
    if (initialValues && initialValues.fom && !Utils._isEmpty(initialValues.fom)) {
      visMenypanel();
      setInitialFomTomLand({ fom: initialValues.fom, tom: initialValues.tom, arbeidsland: initialValues.arbeidsland });
    }
  }, []);

  const lagreBehandlingsgrunnlagOgOppdaterFlyt = async () => {
    await lagreBehandlingsgrunnlag();
    hentFlytOgOppdaterAktuelleSteg();
  };
  const debouncedLagrebehandlingsgrunnlagOgOppdaterFlyt = useCallback(
    Utils._debounce(lagreBehandlingsgrunnlagOgOppdaterFlyt, 300),
    []
  );

  useEffect(() => {
    if (redigerbart && formValues && formIsValid) {
      const isoFom = Utils.dato.formatterDatoTilISO(formValues.fom);
      const isoTom = Utils.dato.formatterDatoTilISO(formValues.tom);
      oppdaterPeriode({
        fom: isoFom === "Invalid date" ? null : isoFom,
        tom: isoTom === "Invalid date" ? null : isoTom,
      });
      oppdaterSoeknadsland(formValues?.arbeidsland ? [formValues.arbeidsland] : []);

      debouncedLagrebehandlingsgrunnlagOgOppdaterFlyt();
    }
  }, [formValues?.fom, formValues?.tom, formValues?.arbeidsland, formIsValid]);

  useEffect(() => {
    if (redigerbart && formValues) {
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
      resetFlyt();
    }
    fortsett();
  };

  return (
    <div className="vurderingInngang">
      <Nav.Typo.Undertittel className="undertittel">Oppgi opplysninger fra søknaden</Nav.Typo.Undertittel>
      <Nav.Fieldset legend="Periode">
        <Nav.Row>
          <Nav.Column xs="3">
            <Skjema.Datovelger label="Fra og med:" feltNavn="fom" disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs="3">
            <Skjema.Datovelger label="Til og med:" feltNavn="tom" disabled={!redigerbart} />
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
              placeholder="Velg..."
              disabled={!redigerbart}
            >
              <LandValgSomOptions landValg={landValg} />
              {behandleAlleSakerToggle === "enabled" && landValg && landValgUtenStøtte && (
                <option disabled>{"\u2500"}</option>
              )}
              {behandleAlleSakerToggle === "enabled" && <LandValgSomOptions landValg={landValgUtenStøtte} />}
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      {landUtenStøtteValgt && <FlytFinnesIkke />}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreftHandle,
          disabled: steg.status !== StegStatus.FERDIG || !formIsValid || !redigerbart || landUtenStøtteValgt,
        }}
        spinner={visSpinner}
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
