import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as Utils from '../../../utils';
import * as MPT from '../../../proptypes';

import PdfLenkeListe from '../../../soknad-komponenter/pdfLenkeListe';

import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder';

const VurderingArtikkel13_1_a_vedtak = props => {
  const { redigerbart, behandlingID, lovvalgsperiode } = props;

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
      navn: 'Forhåndsvis SED',
      type: null, //TODO
      data: {
        mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
      },
    },
  ];

  //TODO redigerbart

  const fom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato);
  const tom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato);

  return (
    <Fragment>
      <Nav.Undertittel>Omfattet av norsk lovgivning, etter artikkel 13, nr 1, a</Nav.Undertittel>
      <Nav.Element>Lovvalgsperiode</Nav.Element>
      <Nav.Row>
        <Nav.Column xs="6">
          {fom} - {tom}
        </Nav.Column>
      </Nav.Row>
      {/* <Nav.Row>
        <Nav.Column xs="3">
          <Nav.Input disabled={!redigerbart} bredde="fullbredde" label="Startdato" />
        </Nav.Column>
        <Nav.Column xs="3">
          <Nav.Input disabled={!redigerbart} bredde="fullbredde" label="Sluttdato" />
        </Nav.Column>
      </Nav.Row> */}
      <Nav.Row>
        <Nav.Column xs="6">
          <Nav.Checkbox label="Lovvalgsperioden er avkortet." />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Hovedknapp type="hoved">FATT VEDTAK</Nav.Hovedknapp>
    </Fragment>
  );
};

VurderingArtikkel13_1_a_vedtak.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgsperiode: PT.object,
};

VurderingArtikkel13_1_a_vedtak.defaultProps = {
  lovvalgsperiode: {},
};

const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
});

export default connect(mapStateToProps)(VurderingArtikkel13_1_a_vedtak);
