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

const VurderingArtikkel13_1b_UtpekLand = props => {
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
  const pdfDokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV_FLERE_LAND,
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
      <Nav.Undertittel>{overskrift}</Nav.Undertittel>
      <Fragment>
        <Nav.Undertittel>
          <Nav.Element className="undertittel">Lovvalgsperiode</Nav.Element>
          <Nav.Row className="lovvalgsperiodeRow">
            <Nav.Column xs="6">
              {fom} - {tom}
            </Nav.Column>
          </Nav.Row>
        </Nav.Undertittel>
      </Fragment>
    </Fragment>
  );
};
VurderingArtikkel13_1b_UtpekLand.propTypes = {
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
VurderingArtikkel13_1b_UtpekLand.defaultProps = {
  lovvalgsperiode: {},
  formValues: {},
};
const mapStateToProps = (state, ownProps) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
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
})(VurderingArtikkel13_1b_UtpekLand);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel13_1b_UtpeklLand_form);
