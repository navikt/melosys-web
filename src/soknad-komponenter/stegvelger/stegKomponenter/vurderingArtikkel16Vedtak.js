import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';

import PdfLenkeListe from '../../pdfLenkeListe';
import { DatoOmradeMedVarighet } from '../../../komponenter/datoOmrade/datoOmrade';

import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { anmodningsperioderSelectors } from '../../../ducks/anmodningsperioder';
import { anmodningsperiodesvarSelectors } from '../../../ducks/anmodningsperiodesvar';

export const VurderingArtikkel16Vedtak = props => {
  const {
    lagreOgFatteVedtak, redigerbart, behandlingID, anmodningsperiodesvar,
  } = props;

  const { anmodningsperiodeSvarType, endretPeriode, begrunnelseFritekst } = anmodningsperiodesvar;

  const innvilget = anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE;
  const innvilgetYrkesaktivType = innvilget ? MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV : MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV;
  const innvilgetArbeidsgiverType = innvilget ? MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER : MKV.Koder.brev.produserbaredokumenter.AVSLAG_ARBEIDSGIVER;
  const resultatTekst = `Svar på anmodning om unntak: ${KV.kodeTilTerm(anmodningsperiodeSvarType, MKV.KTObjects.anmodningsperiodesvartyper)}.`;

  const dokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev',
      type: innvilgetYrkesaktivType,
      data: {
        begrunnelseFritekst,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    // {
    //   navn: 'Forhåndsvis A1',
    //   type: MKV.Koder.brev.produserbaredokumenter.ATTEST_A1,
    //   data: {
    //     begrunnelseFritekst,
    //     mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
    //   },
    // },
    {
      navn: 'Brev til arbeidsgiver',
      type: innvilgetArbeidsgiverType,
      data: {
        begrunnelseFritekst,
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
      },
    },
    // {
    //   navn: 'Brev til skatteoppkrever utland',
    //   type: innvilgetYrkesaktivType,
    //   data: {
    //     begrunnelseFritekst,
    //     mottaker: MKV.Koder.aktoersroller.MYNDIGHET,
    //   },
    // },
  ];

  const visFritekstFelt = anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE || anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.AVSLAG;

  const vedKlikk = () => {
    lagreOgFatteVedtak(MKV.Koder.behandlinger.resultattyper.FASTSATT_LOVVALGSLAND);
  };

  return (
    <Fragment>
      <Nav.Undertittel>Svar fra myndigheten</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="7">
          {resultatTekst}
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          { visFritekstFelt && <Nav.Textarea label="Begrunnelse" onChange={() => {}} disabled value={begrunnelseFritekst} tellerTekst={() => {}} />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          <DatoOmradeMedVarighet periode={endretPeriode} tekst="Lovvalgsperiode" />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          <Nav.Hovedknapp disabled={!redigerbart} type="hoved" onClick={vedKlikk}>FATT VEDTAK</Nav.Hovedknapp>
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

VurderingArtikkel16Vedtak.propTypes = {
  anmodningsperiodesvar: PT.object,
  behandlingID: PT.number.isRequired,
  lagreOgFatteVedtak: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  anmodningsperiodeID: PT.string,
};

VurderingArtikkel16Vedtak.defaultProps = {
  anmodningsperiodesvar: {},
  anmodningsperiodeID: '',
};

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  anmodningsperiodeID: anmodningsperioderSelectors.AnmodningsperiodeIDSelector(state),
  anmodningsperiodesvar: anmodningsperiodesvarSelectors.AnmodningsperiodesvarSelector(state),
});

export default connect(mapStateToProps)(VurderingArtikkel16Vedtak);
