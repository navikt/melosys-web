import React, { Fragment, useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import PT from "prop-types";
import { reduxForm, getFormValues } from "redux-form";

import MKV from "../../../melosyskodeverk";

import * as Skjema from "../../../felleskomponenter/skjema";
import * as Mui from "../../../felleskomponenter/ui";
import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";
import * as Services from "../../../services";

import { DatoOmradeMedVarighet } from "../../../felleskomponenter/datoOmrade";

import { avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { anmodningsperioderSelectors } from "../../../ducks/anmodningsperioder";
import { formSelectors } from "../../../ducks/form";
import { anmodningsperiodesvarOperations, anmodningsperiodesvarSelectors } from "../../../ducks/anmodningsperiodesvar";

import { lagAnmodningsperiodesvar } from "../../../felleskomponenter/stegvelger";
import { lagYupToReduxformErrorMapper } from "../../../yup";
import vurderingArtikkel16MottaSvarSchema from "./vurderingArtikkel16MottaSvarSchema";

import "./vurderingArtikkel16MottaSvar.css";

const Periode = ({ redigerbart }) => (
  <Nav.Row>
    <Nav.Column xs="6">
      <Skjema.Datovelger label="Startdato" feltNavn="endretPeriode.fom" disabled={!redigerbart} />
    </Nav.Column>
    <Nav.Column xs="6">
      <Skjema.Datovelger label="Sluttdato" feltNavn="endretPeriode.tom" disabled={!redigerbart} />
    </Nav.Column>
  </Nav.Row>
);

Periode.propTypes = {
  redigerbart: PT.bool.isRequired,
};

export const FormKomponent = ({
  redigerbart,
  formValues,
  oppdaterData,
  formIsValid,
  anmodningsperiodeID,
  sendAnmodningsperiodeSvar,
}) => {
  const visLovvalgsperiode =
    formValues.anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE;

  const visFritekstFelt =
    formValues.anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE ||
    formValues.anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.AVSLAG;

  const lagreSvar = async (data) => {
    const sendEndretPeriode =
      data.anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE;

    const svar = {
      anmodningsperiodeSvarType: data.anmodningsperiodeSvarType,
      endretPeriode: {
        fom:
          sendEndretPeriode && data.endretPeriode.fom ? Utils.dato.formatterDatoTilISO(data.endretPeriode.fom) : null,
        tom:
          sendEndretPeriode && data.endretPeriode.tom ? Utils.dato.formatterDatoTilISO(data.endretPeriode.tom) : null,
      },
      begrunnelseFritekst: data.begrunnelseFritekst || null,
    };

    if (data.anmodningsperiodeSvarType && data.formIsValid) {
      await sendAnmodningsperiodeSvar(anmodningsperiodeID, svar);
      oppdaterData(lagAnmodningsperiodesvar(svar));
    }
  };
  const debouncedLagreSvar = useCallback(Utils._debounce(lagreSvar, 1000), [oppdaterData, lagAnmodningsperiodesvar]);

  useEffect(() => {
    if (redigerbart) {
      debouncedLagreSvar({ ...formValues, formIsValid });
    }
  }, [formValues, formIsValid]);

  return (
    <form name="anmodningSvar" id="anmodningSvar" onSubmit={(e) => e.preventDefault()}>
      <Nav.Row className="svarFraMyndighetRow">
        <Nav.Column xs="6">
          <Nav.Fieldset disabled={!redigerbart} legend="Svar fra myndighetene">
            <Skjema.Radio
              name="svarFraMyndighetene"
              feltNavn="anmodningsperiodeSvarType"
              label="Innvilgelse"
              value={MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE}
            />
            <Skjema.Radio
              name="svarFraMyndighetene"
              feltNavn="anmodningsperiodeSvarType"
              label="Delvis innvilgelse"
              value={MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE}
            />
            <Skjema.Radio
              name="svarFraMyndighetene"
              feltNavn="anmodningsperiodeSvarType"
              label="Avslag"
              value={MKV.Koder.anmodningsperiodesvartyper.AVSLAG}
            />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">{visLovvalgsperiode && <Periode redigerbart={redigerbart} />}</Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          {visFritekstFelt && (
            <Skjema.Textarea
              feltNavn="begrunnelseFritekst"
              disabled={!redigerbart}
              label="Begrunnelse"
              tellerTekst={() => {}}
            />
          )}
        </Nav.Column>
      </Nav.Row>
    </form>
  );
};

FormKomponent.propTypes = {
  redigerbart: PT.bool.isRequired,
  soknadsperiode: PT.object,
  oppdaterData: PT.func.isRequired,
  formIsValid: PT.bool.isRequired,
  anmodningsperiodeID: PT.string.isRequired,
  sendAnmodningsperiodeSvar: PT.func.isRequired,
  formValues: PT.object,
};

FormKomponent.defaultProps = {
  soknadsperiode: {},
  formValues: {},
};

const Artikkel16MottaSvarForm = reduxForm({
  form: KV.Form.ARTIKKEL_16_MOTTA_SVAR,
  enableReinitialize: false,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(vurderingArtikkel16MottaSvarSchema, {
      context: {
        anmodningsperiodeSvarType: props.formValues && props.formValues.anmodningsperiodeSvarType,
        soknadsperiode: props.soknadsperiode,
      },
    })(values),
})(FormKomponent);

const FormKomponentMapStateToProps = (state) => ({
  formValues: getFormValues(KV.Form.ARTIKKEL_16_MOTTA_SVAR)(state),
  initialValues: {
    anmodningsperiodeSvarType: anmodningsperiodesvarSelectors.AnmodningsperiodeSvarTypeSelector(state),
    endretPeriode: {
      fom: Utils.dato.formatterDatoTilNorsk(anmodningsperiodesvarSelectors.EndretPeriodeFomSelector(state)),
      tom: Utils.dato.formatterDatoTilNorsk(anmodningsperiodesvarSelectors.EndretPeriodeTomSelector(state)),
    },
    begrunnelseFritekst: anmodningsperiodesvarSelectors.BegrunnelseFritekstSelector(state),
  },
});

const FormKomponentMapDispatchToProps = (dispatch) => ({
  sendAnmodningsperiodeSvar: (anmodningsperiodeID, anmodningsperiodeSvar) =>
    dispatch(anmodningsperiodesvarOperations.send(anmodningsperiodeID, anmodningsperiodeSvar)),
});

const ConnectedFormKomponent = connect(
  FormKomponentMapStateToProps,
  FormKomponentMapDispatchToProps
)(Artikkel16MottaSvarForm);

export const VurderingArtikkel16MottaSvar = (props) => {
  const {
    anmodningsperiodeID,
    gyldigeSoknadsland,
    soknadsperiode,
    redigerbart,
    bekreftOgFortsett,
    slettData,
    tilbake,
    tilstand,
    formIsValid,
    oppdaterData,
    hentAnmodningsperiodeSvar,
    anmodningsperioderSvarStatus,
  } = props;

  const [anmodningsperioderSvarHentet, setAnmodningsperioderSvarHentet] = useState(false);

  useEffect(() => {
    hentAnmodningsperiodeSvar(anmodningsperiodeID).then((svar) => oppdaterData(lagAnmodningsperiodesvar(svar.data)));
    const cleanup = () => {
      slettData();
    };
    return cleanup;
  }, []);

  useEffect(() => {
    if (anmodningsperioderSvarStatus === Services.STATUS.OK) {
      setAnmodningsperioderSvarHentet(true);
    }
  }, [anmodningsperioderSvarStatus]);

  return (
    <Fragment>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Svar på anmodning om unntak, etter artikkel 16, nr. 1
      </Nav.Typo.Innholdstittel>
      <Nav.Row>
        <Nav.Column xs="4">
          <Nav.Typo.Element>Land:</Nav.Typo.Element>
          <Nav.Typo.Normaltekst>
            {gyldigeSoknadsland.map((enkeltLandObjekt) => enkeltLandObjekt.term).join(", ")}
          </Nav.Typo.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="soknadsperiodeRow">
        <Nav.Column xs="6">
          <DatoOmradeMedVarighet periode={soknadsperiode} label="Søknadsperiode" />
        </Nav.Column>
      </Nav.Row>
      {anmodningsperioderSvarHentet && (
        <ConnectedFormKomponent
          redigerbart={redigerbart}
          soknadsperiode={soknadsperiode}
          oppdaterData={oppdaterData}
          anmodningsperiodeID={anmodningsperiodeID}
          formIsValid={formIsValid}
        />
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !redigerbart || !formIsValid || !tilstand.harAvklaring,
          onClick: bekreftOgFortsett,
        }}
        tilbakeKnappProps={{
          disabled: !redigerbart,
          onClick: tilbake,
        }}
      />
    </Fragment>
  );
};

VurderingArtikkel16MottaSvar.propTypes = {
  anmodningsperiodeID: PT.string,
  bekreftOgFortsett: PT.func.isRequired,
  gyldigeSoknadsland: MPT.Soknadsland.isRequired,
  soknadsperiode: MPT.Soknadsperiode.isRequired,
  redigerbart: PT.bool.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  formIsValid: PT.bool,
  hentAnmodningsperiodeSvar: PT.func.isRequired,
  anmodningsperioderSvarStatus: PT.string.isRequired,
  tilstand: PT.object.isRequired,
};

VurderingArtikkel16MottaSvar.defaultProps = {
  lovvalgsperiodeFom: "",
  lovvalgsperiodeTom: "",
  formIsValid: false,
  anmodningsperiodeID: "",
};

const mapStateToProps = (state) => ({
  gyldigeSoknadsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  soknadsperiode: mottatteOpplysningerSelectors.PeriodeSelector(state),
  anmodningsperiodeID: anmodningsperioderSelectors.AnmodningsperiodeIDSelector(state),
  anmodningsperioderSvarStatus: anmodningsperiodesvarSelectors.ReduxStatusSelector(state),
  formIsValid: formSelectors.Artikkel16MottaSvarSyncErrorsSelector(state) === undefined,
});

const mapDispatchToProps = (dispatch) => ({
  hentAnmodningsperiodeSvar: (anmodningsperiodeID) =>
    dispatch(anmodningsperiodesvarOperations.hent(anmodningsperiodeID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel16MottaSvar);
