import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';
import DatoOmrade from '../../../../../felleskomponenter/datoOmrade/datoOmrade';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { anmodningsperioderSelectors } from '../../../../../ducks/anmodningsperioder';
import { anmodningsperiodesvarSelectors } from '../../../../../ducks/anmodningsperiodesvar';

export const VurderingArtikkel16VedtakInnvilgelse = props => {
  const {
    redigerbart,
    behandlingID,
    gjeldendePeriode,
    begrunnelseFritekst,
  } = props;

  const dokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev og A1',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
      data: {
        begrunnelseFritekst,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Brev til arbeidsgiver',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
      data: {
        begrunnelseFritekst,
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
      },
    },
  ];

  return (
    <Fragment>
      <Nav.Undertittel>Omfattet av norsk trygdelovgivning etter Fo 883/2004 Artikkel 16 nr. 1.</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="7">
          <DatoOmrade periode={gjeldendePeriode} tekst="Lovvalgsperiode" />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />}
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

VurderingArtikkel16VedtakInnvilgelse.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  gjeldendePeriode: MPT.Periode.isRequired,
  begrunnelseFritekst: PT.string,
};

VurderingArtikkel16VedtakInnvilgelse.defaultProps = {
  begrunnelseFritekst: '',
};

export const VurderingArtikkel16VedtakDelvisInnvilgelse = props => {
  const {
    redigerbart,
    behandlingID,
    gjeldendePeriode,
    begrunnelseFritekst,
  } = props;

  const dokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev og A1',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
      data: {
        begrunnelseFritekst,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Brev til arbeidsgiver',
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
      data: {
        begrunnelseFritekst,
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
      },
    },
  ];

  return (
    <Fragment>
      <Nav.Undertittel>Delvis innvilgelse - omfattet av norsk trygdelovgivning etter Fo 883/2004 Artikkel 16 nr. 1.</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="7">
          <DatoOmrade periode={gjeldendePeriode} tekst="Lovvalgsperiode" />
        </Nav.Column>
      </Nav.Row>
      { /* TODO: begrunnelser komponent fra avslag 12.1 */}
      <Nav.Row>
        <Nav.Column xs="7">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />}
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

VurderingArtikkel16VedtakDelvisInnvilgelse.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  gjeldendePeriode: MPT.Periode.isRequired,
  begrunnelseFritekst: PT.string,
};

VurderingArtikkel16VedtakDelvisInnvilgelse.defaultProps = {
  begrunnelseFritekst: '',
};

export const VurderingArtikkel16VedtakAvslag = props => {
  const {
    redigerbart,
    behandlingID,
    begrunnelseFritekst,
  } = props;

  const dokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev',
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV,
      data: {
        begrunnelseFritekst,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Brev til arbeidsgiver',
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_ARBEIDSGIVER,
      data: {
        begrunnelseFritekst,
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
      },
    },
  ];

  return (
    <Fragment>
      <Nav.Undertittel>Avslag</Nav.Undertittel>
      { /* TODO: begrunnelser komponent fra avslag 12.1 */}
      <Nav.Row>
        <Nav.Column xs="7">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />}
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

VurderingArtikkel16VedtakAvslag.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  begrunnelseFritekst: PT.string,
};

VurderingArtikkel16VedtakAvslag.defaultProps = {
  begrunnelseFritekst: '',
};

export const VurderingArtikkel16Vedtak = props => {
  const {
    lagreOgFatteVedtak, redigerbart, behandlingID, anmodningsperiodesvar, anmodningsperiode,
  } = props;

  const vedKlikk = () => {
    lagreOgFatteVedtak(MKV.Koder.behandlinger.resultattyper.FASTSATT_LOVVALGSLAND);
  };

  const { anmodningsperiodeSvarType, endretPeriode, begrunnelseFritekst } = anmodningsperiodesvar;

  const finnVedtakInnhold = svarType => {
    switch (svarType) {
      case MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE:
        return <VurderingArtikkel16VedtakInnvilgelse
          redigerbart={redigerbart}
          behandlingID={behandlingID}
          begrunnelseFritekst={begrunnelseFritekst}
          gjeldendePeriode={{ fom: anmodningsperiode.fomDato, tom: anmodningsperiode.tomDato }}
        />;
      case MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE:
        return <VurderingArtikkel16VedtakDelvisInnvilgelse
          redigerbart={redigerbart}
          behandlingID={behandlingID}
          begrunnelseFritekst={begrunnelseFritekst}
          gjeldendePeriode={endretPeriode}
        />;
      case MKV.Koder.anmodningsperiodesvartyper.AVSLAG:
        return <VurderingArtikkel16VedtakAvslag
          redigerbart={redigerbart}
          behandlingID={behandlingID}
          begrunnelseFritekst={begrunnelseFritekst}
        />;
      default:
        throw new Error('AnmodningsperiodeSvarType må være satt');
    }
  };

  const vedtakInnhold = finnVedtakInnhold(anmodningsperiodeSvarType);

  return (
    <Fragment>
      { vedtakInnhold }
      <Nav.Row>
        <Nav.Column xs="7">
          <Nav.Hovedknapp disabled={!redigerbart} type="hoved" onClick={vedKlikk}>FATT VEDTAK</Nav.Hovedknapp>
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

VurderingArtikkel16Vedtak.propTypes = {
  anmodningsperiode: MPT.Periode.isRequired,
  anmodningsperiodesvar: PT.object,
  behandlingID: PT.number.isRequired,
  lagreOgFatteVedtak: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingArtikkel16Vedtak.defaultProps = {
  anmodningsperiodesvar: {},
};

const mapStateToProps = state => ({
  anmodningsperiode: anmodningsperioderSelectors.AnmodningsperiodeSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  anmodningsperiodesvar: anmodningsperiodesvarSelectors.AnmodningsperiodesvarSelector(state),
});

export default connect(mapStateToProps)(VurderingArtikkel16Vedtak);
