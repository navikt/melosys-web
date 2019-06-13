import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as KV from '../../../kodeverk';

import PdfLenkeListe from '../../pdfLenkeListe';
import { DatoOmradeMedVarighet } from '../../../komponenter/datoOmrade/datoOmrade';

import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder';

const VurderingArtikkel16Vedtak = props => {
  const {
    lagreOgFatteVedtak, redigerbart, behandlingID, lovvalgsperiode, innvilgelsesResultat, tilstand: { svarAnmodningUnntakFritekst = '' },
  } = props;

  const innvilget = innvilgelsesResultat === KV.Koder.INNVILGET; /*TODO: Må hentes fra MKV*/
  const innvilgetYrkesaktivType = innvilget ? MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV : MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV;
  const innvilgetArbeidsgiverType = innvilget ? MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER : MKV.Koder.brev.produserbaredokumenter.AVSLAG_ARBEIDSGIVER;
  const innvilgetTekst = 'innvilget'; /*TODO: Må hentes fra innvilgelsesResultat sin tilsvarende term*/

  const dokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev',
      type: innvilgetYrkesaktivType,
      data: {
        svarAnmodningUnntakFritekst,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Forhåndsvis A1',
      type: MKV.Koder.brev.produserbaredokumenter.ATTEST_A1,
      data: {
        svarAnmodningUnntakFritekst,
        mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
      },
    },
    {
      navn: 'Brev til arbeidsgiver',
      type: innvilgetArbeidsgiverType,
      data: {
        svarAnmodningUnntakFritekst,
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
      },
    },
    {
      navn: 'Brev til skatteoppkrever utland',
      type: innvilgetYrkesaktivType,
      data: {
        svarAnmodningUnntakFritekst,
        mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
      },
    },
  ];

  return (
    <Fragment>
      <Nav.Undertittel>Svar fra myndigheten</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="7">
          Anmodning om unntak er {innvilgetTekst}.
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          <Nav.Textarea label="Begrunnelse" onChange={() => {}} disabled value={svarAnmodningUnntakFritekst} tellerTekst={() => {}} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          <DatoOmradeMedVarighet periode={lovvalgsperiode} tekst="Lovvalgsperiode" />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          <Nav.Hovedknapp disabled={!redigerbart} type="hoved" onClick={lagreOgFatteVedtak}>FATT VEDTAK</Nav.Hovedknapp>
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

VurderingArtikkel16Vedtak.propTypes = {
  behandlingID: PT.number.isRequired,
  lagreOgFatteVedtak: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  lovvalgsperiode: MPT.Periode.isRequired,
  innvilgelsesResultat: PT.string.isRequired,
  tilstand: PT.shape({
    svarAnmodningUnntakFritekst: PT.string,
  }).isRequired,
};

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.PeriodeSelector(state),
  innvilgelsesResultat: lovvalgsperioderSelectors.InnvilgelsesResultatSelector(state),
});

export default connect(mapStateToProps)(VurderingArtikkel16Vedtak);
