import React, { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import { reduxForm, formValueSelector } from 'redux-form';

import * as Skjema from '../../../../../felleskomponenter/skjema';
import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';
import * as KV from '../../../../../kodeverk';
import * as Utils from '../../../../../utils';
import * as Validering from '../../../../../felleskomponenter/skjema/validering';

import { DatoOmradeMedVarighet } from '../../../../../felleskomponenter/datoOmrade/datoOmrade';

import { avklartefaktaSelectors } from '../../../../../ducks/avklartefakta';
import { soknadSelectors } from '../../../../../ducks/soknad';
import { anmodningsperioderSelectors } from '../../../../../ducks/anmodningsperioder';
import { formSelectors } from '../../../../../ducks/form';
import { anmodningsperiodesvarOperations, anmodningsperiodesvarSelectors } from '../../../../../ducks/anmodningsperiodesvar';

import { lagAnmodningsperiodesvar } from '../../../../../regler/anmodningsperiodesvar';

import './vurderingArtikkel16MottaSvar.css';

const artikkel16MottaSvarFormValueSelector = formValueSelector(KV.Form.ARTIKKEL_16_MOTTA_SVAR);

export const VurderingArtikkel16MottaSvar = props => {
  const {
    anmodningsperiodeID, gyldigeSoknadsland, soknadsperiode, redigerbart, bekreftOgFortsett, slettData, tilstand,
    endretPeriode, anmodningsperiodeSvarType, begrunnelseFritekst, formIsValid, oppdaterData, hentAnmodningsperiodeSvar, sendAnmodningsperiodeSvar,
  } = props;

  useEffect(() => {
    hentAnmodningsperiodeSvar(anmodningsperiodeID).then(svar => oppdaterData(lagAnmodningsperiodesvar(svar.data)));

    return function cleanup() {
      slettData();
    };
  }, []);

  const visLovvalgsperiode = anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE;

  const visFritekstFelt = anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE || anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.AVSLAG;

  const lagreSvar = () => {
    const svar = {
      anmodningsperiodeSvarType,
      endretPeriode: {
        fom: visLovvalgsperiode ? Utils.dato.formatterDatoTilISO(endretPeriode.fom) : null,
        tom: visLovvalgsperiode ? Utils.dato.formatterDatoTilISO(endretPeriode.tom) : null,
      },
      begrunnelseFritekst: begrunnelseFritekst || null,
    };

    oppdaterData(lagAnmodningsperiodesvar(svar));

    sendAnmodningsperiodeSvar(anmodningsperiodeID, svar);
  };

  const lagreSvarHandler = () => {
    if (anmodningsperiodeSvarType && formIsValid) lagreSvar();
  };

  return (
    <Fragment>
      <Nav.Undertittel>Svar på anmodning om unntak, etter artikkel 16, nr. 1</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="4">
          <Nav.Element>Land:</Nav.Element>
          <Nav.Normaltekst>{gyldigeSoknadsland.map(enkeltLandObjekt => enkeltLandObjekt.term).join(', ')}</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="soknadsperiodeRow">
        <Nav.Column xs="6">
          <DatoOmradeMedVarighet periode={soknadsperiode} label="Søknadsperiode" />
        </Nav.Column>
      </Nav.Row>
      <form name="anmodningSvar" id="anmodningSvar" onBlur={lagreSvarHandler} onSubmit={e => e.preventDefault()} >
        <Nav.Row className="svarFraMyndighetRow">
          <Nav.Column xs="6">
            <Nav.Fieldset disabled={!redigerbart} legend="Svar fra myndighetene">
              <Skjema.Radio name="svarFraMyndighetene" feltNavn="anmodningsperiodeSvarType" label="Innvilgelse" value={MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE} />
              <Skjema.Radio name="svarFraMyndighetene" feltNavn="anmodningsperiodeSvarType" label="Delvis innvilgelse" value={MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE} />
              {
                visLovvalgsperiode &&
                <Nav.Row>
                  <Nav.Column xs="6">
                    <Skjema.Input
                      bredde="fullbredde"
                      label="Startdato"
                      feltNavn="endretPeriode.fom"
                      disabled={!redigerbart}
                      datoFelt
                    />
                  </Nav.Column>
                  <Nav.Column xs="6">
                    <Skjema.Input
                      bredde="fullbredde"
                      label="Sluttdato"
                      feltNavn="endretPeriode.tom"
                      disabled={!redigerbart}
                      datoFelt
                    />
                  </Nav.Column>
                </Nav.Row>
              }
              <Skjema.Radio name="svarFraMyndighetene" feltNavn="anmodningsperiodeSvarType" label="Avslag" value={MKV.Koder.anmodningsperiodesvartyper.AVSLAG} />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            { visFritekstFelt && <Skjema.Textarea feltNavn="begrunnelseFritekst" disabled={!redigerbart} label="Begrunnelse" tellerTekst={() => {}} />}
          </Nav.Column>
        </Nav.Row>
      </form>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!redigerbart || !formIsValid || !tilstand.harAvklaring} onClick={bekreftOgFortsett} className="fane__navigasjonsknapp">BEKREFT OG FORTSETT</Nav.Knapp>
      </div>
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
  endretPeriode: MPT.Periode,
  anmodningsperiodeSvarType: PT.string,
  begrunnelseFritekst: PT.string,
  formIsValid: PT.bool,
  hentAnmodningsperiodeSvar: PT.func.isRequired,
  sendAnmodningsperiodeSvar: PT.func.isRequired,
  tilstand: PT.object.isRequired,
};

VurderingArtikkel16MottaSvar.defaultProps = {
  lovvalgsperiodeFom: '',
  lovvalgsperiodeTom: '',
  begrunnelseFritekst: '',
  endretPeriode: { fom: '', tom: '' },
  anmodningsperiodeSvarType: '',
  formIsValid: false,
  anmodningsperiodeID: '',
};

const mapStateToProps = state => ({
  gyldigeSoknadsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  soknadsperiode: soknadSelectors.SoknadsperiodeSelector(state),
  anmodningsperiodeID: anmodningsperioderSelectors.AnmodningsperiodeIDSelector(state),
  endretPeriode: artikkel16MottaSvarFormValueSelector(state, 'endretPeriode'),
  anmodningsperiodeSvarType: artikkel16MottaSvarFormValueSelector(state, 'anmodningsperiodeSvarType'),
  begrunnelseFritekst: artikkel16MottaSvarFormValueSelector(state, 'begrunnelseFritekst'),
  initialValues: {
    anmodningsperiodeSvarType: anmodningsperiodesvarSelectors.AnmodningsperiodeSvarTypeSelector(state),
    endretPeriode: {
      fom: Utils.dato.formatterDatoTilNorsk(anmodningsperiodesvarSelectors.EndretPeriodeFomSelector(state)),
      tom: Utils.dato.formatterDatoTilNorsk(anmodningsperiodesvarSelectors.EndretPeriodeTomSelector(state)),
    },
    begrunnelseFritekst: anmodningsperiodesvarSelectors.BegrunnelseFritekstSelector(state),
  },
  formIsValid: formSelectors.Artikkel16MottaSvarSyncErrorsSelector(state) === undefined,
});

const mapDispatchToProps = dispatch => ({
  hentAnmodningsperiodeSvar: async anmodningsperiodeID => dispatch(anmodningsperiodesvarOperations.hent(anmodningsperiodeID)),
  sendAnmodningsperiodeSvar: (anmodningsperiodeID, anmodningsperiodeSvar) => dispatch(anmodningsperiodesvarOperations.send(anmodningsperiodeID, anmodningsperiodeSvar)),
});

const Artikkel16MottaSvarForm = reduxForm({
  form: KV.Form.ARTIKKEL_16_MOTTA_SVAR,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.artikkel16_motta_svar, { context: { anmodningsperiodeSvarType: props.anmodningsperiodeSvarType } })(values),
})(VurderingArtikkel16MottaSvar);

export default connect(mapStateToProps, mapDispatchToProps)(Artikkel16MottaSvarForm);
