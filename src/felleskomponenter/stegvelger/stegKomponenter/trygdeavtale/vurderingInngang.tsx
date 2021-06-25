import React, { Fragment, useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";

import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../utils/navFrontend";
import * as Skjema from "../../../skjema";
import * as Utils from "../../../../utils";

import DialogboksOppfriskSak from "../../../dialogboks/oppfrisk/dialogboksOppfrisk";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { formSelectors } from "../../../../ducks/form";
import { FlytReqDto, FlytResDto } from "../../../../services/modules/trygdeavtale/flyt";
import { StegNavn } from "../../../../kodeverk/koder";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurdering_inngang from "./vurderingInngangSchema";

import "./vurderingInngang.css";

const initializeValues = (flyt: FlytResDto | undefined) => ({
  fom: flyt?.resultat?.fom ? Utils.dato.formatterDatoTilNorsk(flyt.resultat.fom) : undefined,
  tom: flyt?.resultat?.tom ? Utils.dato.formatterDatoTilNorsk(flyt.resultat.tom) : undefined,
  land: flyt?.resultat?.land ? flyt.resultat.land[0] : undefined,
});

const mapStateToProps = (state: RootState, ownProps: Props) => ({
  inngangsSteg: ownProps.flyt.steg?.find((steg) => steg.navn === StegNavn.INNGANG),
  formValues: getFormValues(KV.Form.Trygdeavtale.INNGANG)(state),
  initialValues: initializeValues(ownProps.flyt),
  formIsValid: formSelectors.TrygdeavtaleInngangFormValidSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  visMenypanel: () => dispatch(menypanelOperations.visMenypanel()),
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
  fortsett: () => void;
  formValues: FormValuesProps;
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger: () => void;
  redigerbart: boolean;
  flyt: FlytResDto;
  tilForsiden: () => void;
  oppdaterStegData: (data: FlytReqDto) => void;
  // slettStegData: () => void;
}

const VurderingInngang = ({
  annenBehandlingOppfriskes,
  flyt,
  formValues,
  formIsValid,
  fortsett,
  initialValues,
  inngangsSteg,
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger,
  redigerbart,
  tilForsiden,
  oppdaterStegData,
  // slettStegData,
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
  const landkoder = [{ kode: "UK", term: "Storbritannia" }]; // TODO: temp

  useEffect(() => {
    if (initialValues && initialValues.fom && !Utils._isEmpty(initialValues.fom)) {
      visMenypanel();
      setInitialFomTom({ fom: initialValues.fom, tom: initialValues.tom });
    }
  }, []);

  const sendOppdatertStegData = (data: { formValues: FormValuesProps; formIsValid: boolean }) => {
    if (data.formIsValid && data.formValues) {
      const requestData = {
        ...flyt.resultat,
        fom: data.formValues.fom ? Utils.dato.formatterDatoTilISO(data.formValues.fom) : undefined,
        tom: data.formValues.tom ? Utils.dato.formatterDatoTilISO(data.formValues.tom) : undefined,
        land: data.formValues.land ? [data.formValues.land] : [],
      };
      oppdaterStegData({ resultat: requestData });
    }
  };
  const debouncedLagreStegData = useCallback(Utils._debounce(sendOppdatertStegData, 500), []);

  useEffect(() => {
    if (redigerbart) debouncedLagreStegData({ formValues, formIsValid });
  }, [formValues, formIsValid]);

  const fortsettHandle = () => {
    if (formValues.fom !== initialFomTom?.fom || formValues.tom !== initialFomTom?.tom) {
      setInitialFomTom({ fom: formValues.fom, tom: formValues.tom });
      setVisOppfrisk(true);
    } else {
      fortsett();
    }
  };

  const periodeEndringHandle = async () => {
    // await slettStegData();
    sendOppdatertStegData({ formValues, formIsValid });
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
              feltNavn="land"
              placeholder="Velg..."
              landkoder={landkoder}
              disabled
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      <div className="fane__knapplinje">
        <Nav.Hovedknapp
          mini
          disabled={inngangsSteg?.status !== "FERDIG" || !formIsValid || !redigerbart}
          className="fane__navigasjonsknapp"
          onClick={fortsettHandle}
        >
          Fortsett
        </Nav.Hovedknapp>
      </div>

      {visOppfrisk && (
        <DialogboksOppfriskSak
          oppfrisk={lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger}
          avbryt={() => setVisOppfrisk(false)}
          lukk={() => {
            periodeEndringHandle();
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
