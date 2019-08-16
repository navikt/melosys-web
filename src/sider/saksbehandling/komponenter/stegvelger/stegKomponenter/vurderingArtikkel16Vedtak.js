import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';

import Begrunnelser from '../../begrunnelser';
import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';
import DatoOmrade from '../../../../../felleskomponenter/datoOmrade/datoOmrade';

import { behandlingerSelectors } from '../../../../../ducks/behandlinger';
import { anmodningsperioderSelectors } from '../../../../../ducks/anmodningsperioder';
import { anmodningsperiodesvarSelectors } from '../../../../../ducks/anmodningsperiodesvar';
import { vilkarSelectors } from '../../../../../ducks/vilkar';

export const VurderingArtikkel16VedtakBegrunnelser = ({ art12_1_begrunnelser, art12_2_begrunnelser, vilkarBegrunnelser }) => {
  const muligeVirksomhetBegrunnelser = [
    ...MKV.KTObjects.begrunnelser.art12_2_normalt_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_vesentlig_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_forutgaaende_medl,
    ...MKV.KTObjects.begrunnelser.bosted,
  ];

  return (
    <Fragment>
      {
        art12_1_begrunnelser.length > 0 &&
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12 nr. 1."
          valgteBegrunnelser={[...art12_1_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[
            ...MKV.KTObjects.begrunnelser.art12_1_begrunnelser,
            ...muligeVirksomhetBegrunnelser,
          ]}
        />
      }
      { art12_2_begrunnelser.length > 0 &&
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12 nr. 2."
          valgteBegrunnelser={[...art12_2_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[
            ...MKV.KTObjects.begrunnelser.art12_2_begrunnelser,
            ...muligeVirksomhetBegrunnelser,
          ]}
        />
      }
      <Begrunnelser
        label="Søkeren fyller ikke kriteriene for artikkel 16 nr. 1."
        fritekst="Utenlandske trygdemyndigheter har avslått anmodningen om unntak"
      />
    </Fragment>
  );
};

VurderingArtikkel16VedtakBegrunnelser.propTypes = {
  art12_1_begrunnelser: PT.arrayOf(PT.string).isRequired,
  art12_2_begrunnelser: PT.arrayOf(PT.string).isRequired,
  vilkarBegrunnelser: PT.arrayOf(PT.string).isRequired,
};

export const Innvilgelse = props => {
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
          <DatoOmrade periode={gjeldendePeriode} label="Lovvalgsperiode" />
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

Innvilgelse.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  gjeldendePeriode: MPT.Periode.isRequired,
  begrunnelseFritekst: PT.string,
};

Innvilgelse.defaultProps = {
  begrunnelseFritekst: '',
};

export const DelvisInnvilgelse = props => {
  const {
    redigerbart,
    behandlingID,
    gjeldendePeriode,
    begrunnelseFritekst,
    renderBegrunnelser,
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
      <Nav.Undertittel>Delvis innvilgelse - omfattet av norsk trygdelovgivning etter Fo 883/2004 Artikkel 16 nr. 1. i deler av søknadsperioden</Nav.Undertittel>
      <Nav.Row>
        <Nav.Column xs="7">
          <DatoOmrade periode={gjeldendePeriode} label="Lovvalgsperiode" />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          { renderBegrunnelser() }
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

DelvisInnvilgelse.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  gjeldendePeriode: MPT.Periode.isRequired,
  begrunnelseFritekst: PT.string,
  renderBegrunnelser: PT.func.isRequired,
};

DelvisInnvilgelse.defaultProps = {
  begrunnelseFritekst: '',
};

export const Avslag = props => {
  const {
    redigerbart,
    behandlingID,
    begrunnelseFritekst,
    renderBegrunnelser,
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
      <Nav.Row>
        <Nav.Column xs="7">
          { renderBegrunnelser() }
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

Avslag.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  begrunnelseFritekst: PT.string,
  renderBegrunnelser: PT.func.isRequired,
};

Avslag.defaultProps = {
  begrunnelseFritekst: '',
};

export const VurderingArtikkel16Vedtak = props => {
  const {
    lagreOgFatteVedtak, redigerbart, behandlingID, anmodningsperiodesvar, anmodningsperiode, art_12_1_begrunnelser, art_12_2_begrunnelser, vilkarBegrunnelser,
  } = props;

  const { anmodningsperiodeSvarType, endretPeriode, begrunnelseFritekst } = anmodningsperiodesvar;

  const vedKlikk = () => {
    lagreOgFatteVedtak(MKV.Koder.behandlinger.resultattyper.FASTSATT_LOVVALGSLAND);
  };

  const renderBegrunnelser = () => (
    <VurderingArtikkel16VedtakBegrunnelser
      art12_1_begrunnelser={art_12_1_begrunnelser}
      art12_2_begrunnelser={art_12_2_begrunnelser}
      vilkarBegrunnelser={vilkarBegrunnelser}
    />
  );

  const finnVedtakInnhold = svarType => {
    switch (svarType) {
      case MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE:
        return <Innvilgelse
          redigerbart={redigerbart}
          behandlingID={behandlingID}
          begrunnelseFritekst={begrunnelseFritekst}
          gjeldendePeriode={{ fom: anmodningsperiode.fomDato, tom: anmodningsperiode.tomDato }}
        />;
      case MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE:
        return <DelvisInnvilgelse
          redigerbart={redigerbart}
          behandlingID={behandlingID}
          begrunnelseFritekst={begrunnelseFritekst}
          gjeldendePeriode={endretPeriode}
          renderBegrunnelser={renderBegrunnelser}
        />;
      case MKV.Koder.anmodningsperiodesvartyper.AVSLAG:
        return <Avslag
          redigerbart={redigerbart}
          behandlingID={behandlingID}
          begrunnelseFritekst={begrunnelseFritekst}
          renderBegrunnelser={renderBegrunnelser}
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
  vilkarBegrunnelser: PT.arrayOf(PT.string).isRequired,
  art_12_1_begrunnelser: PT.arrayOf(PT.string).isRequired,
  art_12_2_begrunnelser: PT.arrayOf(PT.string).isRequired,
};

VurderingArtikkel16Vedtak.defaultProps = {
  anmodningsperiodesvar: {},
};

const mapStateToProps = state => ({
  anmodningsperiode: anmodningsperioderSelectors.AnmodningsperiodeSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  anmodningsperiodesvar: anmodningsperiodesvarSelectors.AnmodningsperiodesvarSelector(state),
  vilkarBegrunnelser: vilkarSelectors.vilkarBegrunnelserSelector(state),
  art_12_1_begrunnelser: vilkarSelectors.art12_1_begrunnelserSelector(state),
  art_12_2_begrunnelser: vilkarSelectors.art12_2_begrunnelserSelector(state),
});

export default connect(mapStateToProps)(VurderingArtikkel16Vedtak);
