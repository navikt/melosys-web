import React, { Fragment, useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";

import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Utils from "../../../utils";

import DialogboksOppfriskSak from "../../../felleskomponenter/dialogboks/oppfrisk/dialogboksOppfrisk";
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../../ducks/behandlingsgrunnlag";
import { menypanelOperations } from "../../../ducks/menypanel";
import { formSelectors } from "../../../ducks/form";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import { StegStatus } from "../stegvelger";
import vurdering_inngang from "./vurderingInngangSchema";

import "./vurderingInngang.css";

interface Periode {
  fom?: string | null;
  tom?: string | null;
}

const initializeValues = (periode: Periode, landkoder: String[]) => ({
  fom: periode.fom ? Utils.dato.formatterDatoTilNorsk(periode.fom) : undefined,
  tom: periode.tom ? Utils.dato.formatterDatoTilNorsk(periode.tom) : undefined,
  land: landkoder[0],
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
  oppdaterSoeknadsland: (landkoder: String[]) =>
    dispatch(behandlingsgrunnlagOperations.oppdaterSoeknadsland(landkoder, false)),
  lagreBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.lagre()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  fom?: string;
  tom?: string;
  land?: string;
}

interface Props {
  annenBehandlingOppfriskes: boolean;
  data: Api.Trygdeavtale.StegData;
  fortsett: () => void;
  formValues: FormValuesProps;
  hentFlytOgOppdaterAktuelleSteg: () => void;
  lagreBehandlingsgrunnlagOgOppdaterStegData: () => void;
  redigerbart: boolean;
  steg: Api.Trygdeavtale.Steg;
  tilForsiden: () => void;
  oppfriskOgLastInnSaksopplysninger: () => void;
  resetFlyt: () => void;
}

const VurderingInngang = ({
  annenBehandlingOppfriskes,
  data: { landValg },
  formValues,
  formIsValid,
  fortsett,
  initialValues,
  hentFlytOgOppdaterAktuelleSteg,
  lagreBehandlingsgrunnlag,
  redigerbart,
  steg,
  tilForsiden,
  oppdaterPeriode,
  oppdaterSoeknadsland,
  oppfriskOgLastInnSaksopplysninger,
  resetFlyt,
  visMenypanel,
}: PropsFromRedux & Props) => {
  const [initialFomTom, setInitialFomTom] = useState<{ fom?: string; tom?: string }>({});
  const [visOppfrisk, setVisOppfrisk] = useState(false);
  const hjelpetekst = "Oppgi landet der arbeidet utføres. Hvis søker arbeider på skip, skal du oppgi flagglandet.";
  const Hjelpetekst = () => (
    <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Hoyre}>
      {hjelpetekst}
    </Nav.Hjelpetekst>
  );

  useEffect(() => {
    if (initialValues && initialValues.fom && !Utils._isEmpty(initialValues.fom)) {
      visMenypanel();
      setInitialFomTom({ fom: initialValues.fom, tom: initialValues.tom });
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
      oppdaterSoeknadsland(formValues?.land ? [formValues.land] : []);

      debouncedLagrebehandlingsgrunnlagOgOppdaterFlyt();
    }
  }, [formValues?.fom, formValues?.tom, formValues?.land, formIsValid]);

  const fortsettHandle = () => {
    if (formValues.fom !== initialFomTom?.fom || formValues.tom !== initialFomTom?.tom) {
      setInitialFomTom({ fom: formValues.fom, tom: formValues.tom });
      setVisOppfrisk(true);
    } else {
      fortsett();
    }
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
            <Skjema.LandVelger
              label={
                <Fragment>
                  Arbeidsland
                  <Hjelpetekst />
                </Fragment>
              }
              landkoder={landValg}
              feltNavn="land"
              placeholder="Velg..."
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      <div className="fane__knapplinje">
        <Nav.Hovedknapp
          mini
          disabled={steg.status !== StegStatus.FERDIG || !formIsValid || !redigerbart}
          className="fane__navigasjonsknapp"
          onClick={fortsettHandle}
        >
          Fortsett
        </Nav.Hovedknapp>
      </div>

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={async () => {
            await oppfriskOgLastInnSaksopplysninger();
            resetFlyt();
          }}
          avbryt={() => setVisOppfrisk(false)}
          lukk={() => {
            setVisOppfrisk(false);
            visMenypanel();
            fortsett();
          }}
          tilForsiden={() => {
            setVisOppfrisk(false);
            tilForsiden();
          }}
          behandlingOppfriskes
          annenBehandlingOppfriskes={annenBehandlingOppfriskes}
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
