import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { reduxForm, isValid, getFormValues } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import * as EKV from 'eessi-kodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as Utils from '../../../../../utils';
import * as Validering from '../../../../../felleskomponenter/skjema/validering';
import * as Skjema from '../../../../../felleskomponenter/skjema';
import * as KV from '../../../../../kodeverk';
import * as MPT from '../../../../../proptypes';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { lovvalgsperioderSelectors, lovvalgsperioderOperations } from '../../../../../ducks/lovvalgsperioder';
import { redigerbartSelectors } from '../../../../../ducks/redigerbart';
import { soknadSelectors } from '../../../../../ducks/soknad';

import './vurderingArtikkel13_1_vedtak.css';

export const VurderingArtikkel13_1b_UtpekLand = props => {
  const {
    redigerbart,
    behandlingID,
    lovvalgsland,
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

    lagreOgFatteVedtak(MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND);
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
      navn: 'Forhåndsvis SED A003',
      type: EKV.Koder.sedtyper.A003,
      erSed: true,
    },
  ];

  const fom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato);
  const tom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato);
  return (
    <Fragment>
      <Nav.Undertittel>{overskrift}</Nav.Undertittel>
      <Nav.Undertittel>
        <Nav.Element className="undertittel">Lovvalgsland:</Nav.Element>
      </Nav.Undertittel>
      <Nav.Row className="lovvalgsperiodeRow">
        <Nav.Column xs="6">
          <p>{lovvalgsland && lovvalgsland.term}</p>
        </Nav.Column>
      </Nav.Row>
      <Nav.Undertittel>
        <Nav.Element className="undertittel">Lovvalgsperiode</Nav.Element>
      </Nav.Undertittel>
      <Nav.Row className="lovvalgsperiodeRow">
        <Nav.Column xs="6">
          {fom} - {tom}
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="checkboxRow">
        <Nav.Column xs="6">
          <Skjema.Checkbox feltNavn="forkortLovvalgsperiode" label="Lovvalget innvilges for en kortere periode" disabled={!redigerbart} onClick={vedCheck} />
        </Nav.Column>
      </Nav.Row>
      {
        formValues.forkortLovvalgsperiode &&
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
      }
      <Nav.Row>
        <Nav.Column xs="6">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkForhandsvis} />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Hovedknapp onClick={vedKlikkVedtak} disabled={!redigerbart} type="hoved">SEND PÅSTAND</Nav.Hovedknapp>
    </Fragment>
  );
};
VurderingArtikkel13_1b_UtpekLand.propTypes = {
  tilstand: PT.shape({
    overskrift: PT.string.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgsland: MPT.Kodeverk.isRequired,
  lovvalgsperiode: MPT.Periode,
  lagreOgFatteVedtak: PT.func.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  touch: PT.func.isRequired,
  endreLovvalgsPeriode: PT.func.isRequired,
  byggLovvalgsperioder: PT.func.isRequired,
  lagreLovvalgsperioder: PT.func.isRequired,
};
VurderingArtikkel13_1b_UtpekLand.defaultProps = {
  lovvalgsperiode: {},
  formValues: {},
};
const mapStateToProps = (state, ownProps) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  lovvalgsland: behandlingerSelectors.LovvalgslandSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_13_1B_UTPEKLAND)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_13_1B_UTPEKLAND)(state),
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

const VurderingArtikkel13_1b_UtpeklLand_form = reduxForm({
  form: KV.Form.ARTIKKEL_13_1B_UTPEKLAND,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => Validering.Skjemaer.lagYupToReduxformErrorMapper(Validering.Skjemaer.artikkel13_1_vedtak, {
    context: {
      lovvalgsperiode: props.lovvalgsperiode,
    },
  })(values),
})(VurderingArtikkel13_1b_UtpekLand);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel13_1b_UtpeklLand_form);
