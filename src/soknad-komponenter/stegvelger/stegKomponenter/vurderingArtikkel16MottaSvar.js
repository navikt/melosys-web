import React, { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import { reduxForm, formValueSelector, getFormSyncErrors } from 'redux-form';

import * as Skjema from '../../../soknad-komponenter/skjema';
import * as Api from '../../../services/api';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as KV from '../../../kodeverk';
import * as Utils from '../../../utils';
import * as Validering from '../../../soknad-komponenter/skjema/validering';

import { DatoOmradeMedVarighet } from '../../../komponenter/datoOmrade/datoOmrade';

import { avklartefaktaSelectors } from '../../../ducks/avklartefakta/';
import { soknadSelectors } from '../../../ducks/soknad';
import { anmodningsperioderSelectors } from '../../../ducks/anmodningsperioder';
import { formSelectors } from '../../../ducks/form';
import { anmodningsperiodesvarOperations } from '../../../ducks/anmodningsperiodesvar';

import { lagAnmodningsperiodesvar, slettAnmodningsperiodesvar, konverterAnmodningsperiodesvarTilStegData } from '../../../regler/anmodningsperiodesvar';

import './vurderingArtikkel16MottaSvar.css';

const artikkel16MottaSvarFormValueSelector = formValueSelector(KV.Form.ARTIKKEL_16_MOTTA_SVAR);

export const VurderingArtikkel16MottaSvar = props => {
  const {
    anmodningsperiodeID, gyldigeSoknadsland, soknadsperiode, redigerbart, bekreftOgFortsett, change,
    endretPeriode, svartype, fritekst, formIsValid, oppdaterData, hentAnmodningsperiodesvar,
  } = props;

  useEffect(() => {
    hentAnmodningsperiodesvar(anmodningsperiodeID).then(svar => oppdaterData(lagAnmodningsperiodesvar(svar.data)));

    Api.Anmodningsperioder.hentSvar(anmodningsperiodeID).then(response => {
      change('svartype', response.anmodningsperiodeSvarType);
      change('endretPeriode', {
        fom: Utils.dato.formatterDatoTilNorsk(response.endretPeriode.fom),
        tom: Utils.dato.formatterDatoTilNorsk(response.endretPeriode.tom),
      });
      change('fritekst', response.begrunnelseFritekst);
    }).catch(Utils.logger.error);
  }, []);

  const visLovvalgsperiode = svartype === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE;

  const lagreSvar = () => {
    Api.Anmodningsperioder.sendSvar(anmodningsperiodeID, {
      anmodningsperiodeSvarType: svartype,
      endretPeriode: {
        fom: visLovvalgsperiode ? Utils.dato.formatterDatoTilISO(endretPeriode.fom) : null,
        tom: visLovvalgsperiode ? Utils.dato.formatterDatoTilISO(endretPeriode.tom) : null,
      },
      begrunnelseFritekst: fritekst,
    }).catch(Utils.logger.error);
  };

  const lagreSvarHandler = () => {
    if (svartype && formIsValid) lagreSvar();
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
          <DatoOmradeMedVarighet periode={soknadsperiode} tekst="Søknadsperiode" />
        </Nav.Column>
      </Nav.Row>
      <form name="anmodningSvar" id="anmodningSvar" onBlur={lagreSvarHandler} onSubmit={e => e.preventDefault()} >
        <Nav.Row className="svarFraMyndighetRow">
          <Nav.Column xs="6">
            <Nav.Fieldset disabled={!redigerbart} legend="Svar fra myndighetene">
              <Skjema.Radio name="svarFraMyndighetene" feltNavn="svartype" label="Innvilgelse" value={MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE} />
              <Skjema.Radio name="svarFraMyndighetene" feltNavn="svartype" label="Delvis innvilgelse" value={MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE} />
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
              <Skjema.Radio name="svarFraMyndighetene" feltNavn="svartype" label="Avslag" value={MKV.Koder.anmodningsperiodesvartyper.AVSLAG} />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            { svartype !== MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE && <Skjema.Textarea feltNavn="fritekst" disabled={!redigerbart} label="Begrunnelse" tellerTekst={() => {}} onBlur={lagreSvarHandler} />}
          </Nav.Column>
        </Nav.Row>
      </form>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!redigerbart} type="hoved" onClick={bekreftOgFortsett} className="fane__navigasjonsknapp">BEKREFT OG FORTSETT</Nav.Knapp>
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
  change: PT.func.isRequired,
  endretPeriode: MPT.Periode,
  svartype: PT.string,
  fritekst: PT.string,
  formIsValid: PT.bool,
  hentAnmodningsperiodesvar: PT.func.isRequired,
  anmodningsperiodesvar: PT.object,
};

VurderingArtikkel16MottaSvar.defaultProps = {
  lovvalgsperiodeFom: '',
  lovvalgsperiodeTom: '',
  fritekst: '',
  endretPeriode: { fom: '', tom: '' },
  svartype: '',
  formIsValid: false,
  anmodningsperiodeID: '',
  anmodningsperiodesvar: {},
};

const mapStateToProps = state => ({
  gyldigeSoknadsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  soknadsperiode: soknadSelectors.SoknadsperiodeSelector(state),
  anmodningsperiodeID: anmodningsperioderSelectors.AnmodningsperiodeIDSelector(state),
  endretPeriode: artikkel16MottaSvarFormValueSelector(state, 'endretPeriode'),
  svartype: artikkel16MottaSvarFormValueSelector(state, 'svartype'),
  fritekst: artikkel16MottaSvarFormValueSelector(state, 'fritekst'),
  initialValues: {
    endretPeriode: {
      fom: '',
      tom: '',
    },
    svartype: '',
    fritekst: '',
  },
  formIsValid: formSelectors.Artikkel16MottaSvarSyncErrorsSelector(state) === undefined,
});

const mapDispatchToProps = dispatch => ({
  hentAnmodningsperiodesvar: async anmodningsperiodeID => dispatch(anmodningsperiodesvarOperations.hent(anmodningsperiodeID)),
});

const Artikkel16MottaSvarForm = reduxForm({
  form: KV.Form.ARTIKKEL_16_MOTTA_SVAR,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => Validering.Skjemaer.createValidator(Validering.Skjemaer.artikkel16_motta_svar, { context: { svartype: props.svartype } })(values),
})(VurderingArtikkel16MottaSvar);

export default connect(mapStateToProps, mapDispatchToProps)(Artikkel16MottaSvarForm);
