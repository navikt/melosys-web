import React, { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import { reduxForm, formValueSelector } from 'redux-form';

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

import './vurderingArtikkel16MottaSvar.css';

const artikkel16MottaSvarFormValueSelector = formValueSelector(KV.Form.ARTIKKEL_16_MOTTA_SVAR);

export const VurderingArtikkel16MottaSvar = props => {
  const {
    anmodningsperiodeID, gyldigeSoknadsland, soknadsperiode, redigerbart, bekreftOgFortsett, change,
    endretPeriode, svartype, fritekst,
  } = props;

  useEffect(() => {
    Api.Anmodningsperioder.hentSvar(anmodningsperiodeID).then(response => {
      change('svartype', response.anmodningsperiodeSvarType);
      change('endretPeriode', response.endretPeriode);
      change('fritekst', response.begrunnelseFritekst);
    }).catch(Utils.logger.error);
  }, [anmodningsperiodeID]);

  const lagreSvar = () => {
    Api.Anmodningsperioder.sendSvar(anmodningsperiodeID, {
      anmodningsperiodeSvarType: svartype,
      endretPeriode: {
        fom: Utils.dato.formatterDatoTilISO(endretPeriode.fom),
        tom: Utils.dato.formatterDatoTilISO(endretPeriode.tom),
      },
      begrunnelseFritekst: fritekst,
    }).then(response => {
      change('anmodningsperiodeSvarType', response.anmodningsperiodeSvarType);
      change('endretPeriode', response.endretPeriode);
      change('fritekst', response.fritekst);
    }).catch(Utils.logger.error);
  };

  const lagreSvarHandler = () => {
    if (svartype) lagreSvar();
  };

  const visLovvalgsperiode = svartype === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE;

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
      <form name="anmodningSvar" id="anmodningSvar" onSubmit={e => e.preventDefault()} >
        <Nav.Row className="svarFraMyndighetRow">
          <Nav.Column xs="6">
            <Nav.Fieldset disabled={!redigerbart} onBlur={lagreSvarHandler} legend="Svar fra myndighetene">
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
            <Skjema.Textarea feltNavn="fritekst" disabled={!redigerbart} label="Begrunnelse" tellerTekst={() => {}} onBlur={lagreSvarHandler} />
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
  anmodningsperiodeID: PT.string.isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  gyldigeSoknadsland: MPT.Soknadsland.isRequired,
  soknadsperiode: MPT.Soknadsperiode.isRequired,
  redigerbart: PT.bool.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  tilstand: PT.shape({
    svarAnmodningUnntakAvklartfakta: MPT.Avklartefakta,
  }).isRequired,
  change: PT.func.isRequired,
  endretPeriode: MPT.Periode.isRequired,
  svartype: PT.string.isRequired,
  fritekst: PT.string.isRequired,
};

VurderingArtikkel16MottaSvar.defaultProps = {
  lovvalgsperiodeFom: '',
  lovvalgsperiodeTom: '',
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
});

const Artikkel16MottaSvarForm = reduxForm({
  form: KV.Form.ARTIKKEL_16_MOTTA_SVAR,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: Validering.Skjemaer.createValidator(Validering.Skjemaer.saksopplysninger),
})(VurderingArtikkel16MottaSvar);

export default connect(mapStateToProps)(Artikkel16MottaSvarForm);
