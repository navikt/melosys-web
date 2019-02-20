import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import PdfLenkeListe from '../../pdfLenkeListe';

import { vilkarBegrunnelserSelector, art12_1_begrunnelserSelector, art12_2_begrunnelserSelector, art16_1_begrunnelserSelector, art16_1_fritekstSelector } from '../../../ducks/vilkar/selectors';
import { fagsakSelectors } from '../../../ducks/fagsaker';

import { kodeTilVerdi } from '../../../utils/kodeverk';

import './vurderingAvslag12_x_og_16.css';

const Begrunnelser = ({
  label,
  valgteBegrunnelser,
  muligeBegrunnelser,
  fritekst,
}) => (
  <div className="begrunnelser">
    <Nav.Element className="begrunnelseTittel">
      {label}
    </Nav.Element>
    {
      valgteBegrunnelser.map(begrunnelse => <div className="begrunnelse" key={begrunnelse}>{kodeTilVerdi(begrunnelse, muligeBegrunnelser)}</div>)
    }
    {
      fritekst && <div className="begrunnelse">{fritekst}</div>
    }
  </div>
);

Begrunnelser.propTypes = {
  label: PT.string.isRequired,
  valgteBegrunnelser: PT.array.isRequired,
  muligeBegrunnelser: PT.array.isRequired,
  fritekst: PT.string,
};

Begrunnelser.defaultProps = {
  fritekst: '',
};

const VurderingAvslag12_x_og_16 = ({
  valgte_art_12_1_begrunnelser,
  valgte_art_12_2_begrunnelser,
  valgte_art_16_1_begrunnelser,
  art16_1_fritekst,
  vilkarBegrunnelser,
  oppsummering,
  fattVedtak,
}) => {
  const dokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev',
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
  ];

  const muligeVirksomhetBegrunnelser = [
    ...MKV.KTObjects.begrunnelser.art12_2_normalt_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_vesentlig_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_forutgaaende_medl,
    ...MKV.KTObjects.begrunnelser.bosted,
  ];

  return (
    <div>
      <Nav.Undertittel>
        Avslag
      </Nav.Undertittel>
      {valgte_art_12_1_begrunnelser.length > 0 &&
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12. nr. 1:"
          valgteBegrunnelser={[...valgte_art_12_1_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[
            ...MKV.KTObjects.begrunnelser.art12_1_begrunnelser,
            ...muligeVirksomhetBegrunnelser,
          ]}
        />
      }
      {valgte_art_12_2_begrunnelser.length > 0 &&
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12, nr. 2:"
          valgteBegrunnelser={[...valgte_art_12_2_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[
            ...MKV.KTObjects.begrunnelser.art12_2_begrunnelser,
            ...muligeVirksomhetBegrunnelser,
          ]}
        />
      }
      {valgte_art_16_1_begrunnelser.length > 0 &&
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 16, nr. 1:"
          valgteBegrunnelser={valgte_art_16_1_begrunnelser}
          muligeBegrunnelser={MKV.KTObjects.begrunnelser.art16_1_avslag}
          fritekst={art16_1_fritekst}
        />
      }
      <PdfLenkeListe behandlingID={oppsummering.behandlingID} dokumenter={dokumenter} />
      <Nav.Hovedknapp onClick={() => fattVedtak(MKV.Koder.behandlinger.resultattyper.FASTSATT_LOVVALGSLAND)}>
        Fatt vedtak
      </Nav.Hovedknapp>
    </div>
  );
};

VurderingAvslag12_x_og_16.propTypes = {
  valgte_art_12_1_begrunnelser: PT.array.isRequired,
  valgte_art_12_2_begrunnelser: PT.array.isRequired,
  valgte_art_16_1_begrunnelser: PT.array.isRequired,
  art16_1_fritekst: PT.string,
  vilkarBegrunnelser: PT.array.isRequired,
  oppsummering: PT.object.isRequired,
  fattVedtak: PT.func.isRequired,
};

VurderingAvslag12_x_og_16.defaultProps = {
  art16_1_fritekst: '',
};

const mapStateToProps = state => ({
  valgte_art_12_1_begrunnelser: art12_1_begrunnelserSelector(state),
  valgte_art_12_2_begrunnelser: art12_2_begrunnelserSelector(state),
  valgte_art_16_1_begrunnelser: art16_1_begrunnelserSelector(state),
  art16_1_fritekst: art16_1_fritekstSelector(state),
  vilkarBegrunnelser: vilkarBegrunnelserSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

export default connect(mapStateToProps, null)(VurderingAvslag12_x_og_16);
