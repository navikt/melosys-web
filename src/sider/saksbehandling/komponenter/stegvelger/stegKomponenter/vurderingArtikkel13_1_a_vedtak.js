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

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { lovvalgsperioderSelectors, lovvalgsperioderOperations } from '../../../../../ducks/lovvalgsperioder';
import { soknadSelectors } from '../../../../../ducks/soknad';

import './vurderingArtikkel13_1_a_vedtak.css';

export const VurderingArtikkel13_1_A_Vedtak = props => {
  const {
    redigerbart, behandlingID, lovvalgsperiode, lagreOgFatteVedtak, formIsValid, formValues, touch, endreLovvalgsPeriode,
  } = props;

  const vedKlikk = async () => {
    touch('tomDato');
    if (!formIsValid) return;

    if (formValues.forkortLovvalgsperiode) {
      await endreLovvalgsPeriode(lovvalgsperiode.fomDato, Utils.dato.formatterDatoTilISO(formValues.tomDato));
    }

    lagreOgFatteVedtak(MKV.Koder.behandlinger.resultattyper.FASTSATT_LOVVALGSLAND);
  };

  const dokumenter = [
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
      <Nav.Undertittel>Omfattet av norsk lovgivning, etter artikkel 13, nr 1, a</Nav.Undertittel>
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
          <Skjema.Checkbox feltNavn="forkortLovvalgsperiode" label="Lovvalgsperioden er avkortet." disabled={!redigerbart} />
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
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Hovedknapp onClick={vedKlikk} disabled={!redigerbart} type="hoved">FATT VEDTAK</Nav.Hovedknapp>
    </Fragment>
  );
};

VurderingArtikkel13_1_A_Vedtak.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgsperiode: PT.object,
  lagreOgFatteVedtak: PT.func.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  touch: PT.func.isRequired,
  endreLovvalgsPeriode: PT.func.isRequired,
};

VurderingArtikkel13_1_A_Vedtak.defaultProps = {
  lovvalgsperiode: {},
  formValues: {},
};

const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_13_1_A_VEDTAK)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_13_1_A_VEDTAK)(state),
  initialValues: {
    forkortLovvalgsperiode: Utils.dato.datoDiffPure(
      soknadSelectors.SoknadsperiodeSelector(state).tom,
      lovvalgsperioderSelectors.TomDatoSelector(state),
      'days'
    ) !== 0,
    tomDato: behandlingerSelectors.RedigerbartSelector(state) ? '' : Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state)),
    fomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.FomDatoSelector(state)),
  },
});

const mapDispatchToProps = dispatch => ({
  endreLovvalgsPeriode: (fomdato, tomdato) => dispatch(lovvalgsperioderOperations.endreLovvalgsPeriode(fomdato, tomdato)),
});

const VurderingArtikkel13_1_a_vedtak_form = reduxForm({
  form: KV.Form.ARTIKKEL_13_1_A_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) => Validering.Skjemaer.createValidator(Validering.Skjemaer.artikkel13_1_a_vedtak, {
    context: {
      lovvalgsperiode: props.lovvalgsperiode,
    },
  })(values),
})(VurderingArtikkel13_1_A_Vedtak);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel13_1_a_vedtak_form);
