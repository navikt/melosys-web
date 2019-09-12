import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { reduxForm, isValid, getFormValues } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as Utils from '../../../../../utils';
import * as Validering from '../../../../../felleskomponenter/skjema/validering';
import * as Skjema from '../../../../../felleskomponenter/skjema';
import * as KV from '../../../../../kodeverk';
import * as MPT from '../../../../../proptypes';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { lovvalgsperioderSelectors, lovvalgsperioderOperations } from '../../../../../ducks/lovvalgsperioder';
import { soknadSelectors } from '../../../../../ducks/soknad';

import './vurderingArtikkel13_1_vedtak.css';

export const VurderingArtikkel13_1_Vedtak = props => {
  const {
    redigerbart,
    behandlingID,
    lovvalgsperiode,
    lagreOgFatteVedtak,
    formIsValid,
    formValues,
    touch,
    endreLovvalgsPeriode,
    tilstand: { overskrift },
    lagreLovvalgsperioder,
    byggLovvalgsperioder: gjenopprettOpprinneligLovvalgsperiode,
  } = props;

  const vedCheck = e => {
    if (e.target.value === 'true') {
      gjenopprettOpprinneligLovvalgsperiode();
    }
  };

  const validerForm = () => {
    touch('tomDato');
    return formIsValid;
  };

  const forkortLovvalgsperiode = () => endreLovvalgsPeriode(lovvalgsperiode.fomDato, Utils.dato.formatterDatoTilISO(formValues.tomDato));

  const vedKlikkVedtak = async () => {
    if (!validerForm()) return;

    if (formValues.forkortLovvalgsperiode) {
      await forkortLovvalgsperiode();
    }

    lagreOgFatteVedtak(MKV.Koder.behandlinger.resultattyper.FASTSATT_LOVVALGSLAND);
  };

  const vedKlikkForhandsvis = async () => {
    if (!validerForm()) return false;

    if (formValues.forkortLovvalgsperiode) {
      await forkortLovvalgsperiode();
    }

    lagreLovvalgsperioder();

    return true;
  };

  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Forhåndsvis A1',
      type: MKV.Koder.brev.produserbaredokumenter.ATTEST_A1,
      data: {
        mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
      },
    },
  ];

  const fom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato);
  const tom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato);

  return (
    <Fragment>
      <Nav.Undertittel>{overskrift}</Nav.Undertittel>
      {
        redigerbart &&
        <Fragment>
          <Nav.Element className="undertittel">Lovvalgsperiode</Nav.Element>
          <Nav.Row className="lovvalgsperiodeRow">
            <Nav.Column xs="6">
              {fom} - {tom}
            </Nav.Column>
          </Nav.Row>
        </Fragment>
      }
      <Nav.Row className="checkboxRow">
        <Nav.Column xs="6">
          <Skjema.Checkbox feltNavn="forkortLovvalgsperiode" label="Lovvalgsperioden er avkortet." disabled={!redigerbart} onClick={vedCheck} />
        </Nav.Column>
      </Nav.Row>
      {
        formValues.forkortLovvalgsperiode &&
        <Fragment>
          <Nav.Row>
            <Nav.Column xs="3">
              <Skjema.Input
                bredde="fullbredde"
                label="Startdato"
                disabled
                feltNavn="fomDato"
              />
            </Nav.Column>
            <Nav.Column xs="3">
              <Skjema.Input
                bredde="fullbredde"
                label="Sluttdato"
                disabled={!redigerbart}
                feltNavn="tomDato"
                datoFelt
              />
            </Nav.Column>
          </Nav.Row>
        </Fragment>
      }
      <Nav.Row>
        <Nav.Column xs="6">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkForhandsvis} />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Hovedknapp onClick={vedKlikkVedtak} disabled={!redigerbart} type="hoved">FATT VEDTAK</Nav.Hovedknapp>
    </Fragment>
  );
};

VurderingArtikkel13_1_Vedtak.propTypes = {
  tilstand: PT.shape({
    overskrift: PT.string.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgsperiode: MPT.Periode,
  lagreOgFatteVedtak: PT.func.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  touch: PT.func.isRequired,
  endreLovvalgsPeriode: PT.func.isRequired,
  byggLovvalgsperioder: PT.func.isRequired,
  lagreLovvalgsperioder: PT.func.isRequired,
};

VurderingArtikkel13_1_Vedtak.defaultProps = {
  lovvalgsperiode: {},
  formValues: {},
};

const mapStateToProps = (state, ownProps) => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_13_1_VEDTAK)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_13_1_VEDTAK)(state),
  initialValues: {
    forkortLovvalgsperiode: Utils.dato.datoDiffPure(
      soknadSelectors.SoknadsperiodeSelector(state).tom,
      lovvalgsperioderSelectors.TomDatoSelector(state),
      'days'
    ) !== 0,
    tomDato: ownProps.redigerbart ? '' : Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state)),
    fomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.FomDatoSelector(state)),
  },
});

const mapDispatchToProps = dispatch => ({
  endreLovvalgsPeriode: (fomdato, tomdato) => dispatch(lovvalgsperioderOperations.endreLovvalgsPeriode(fomdato, tomdato)),
});

const VurderingArtikkel13_1_vedtak_form = reduxForm({
  form: KV.Form.ARTIKKEL_13_1_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => Validering.Skjemaer.createValidator(Validering.Skjemaer.artikkel13_1_vedtak, {
    context: {
      lovvalgsperiode: props.lovvalgsperiode,
    },
  })(values),
})(VurderingArtikkel13_1_Vedtak);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel13_1_vedtak_form);
