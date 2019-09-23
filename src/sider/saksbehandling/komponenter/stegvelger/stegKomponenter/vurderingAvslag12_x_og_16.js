import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as VilkarSelectors from '../../../../../ducks/vilkar/selectors';
import { behandlingerSelectors } from '../../../../../ducks/behandlinger';

import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';
import Begrunnelser from '../../begrunnelser';

const VurderingAvslag12_x_og_16 = ({
  valgte_art_12_1_begrunnelser,
  valgte_art_12_2_begrunnelser,
  valgte_art_16_1_begrunnelser,
  art16_1_fritekst,
  vilkarBegrunnelser,
  behandlingID,
  fattVedtak,
  redigerbart,
}) => {
  const dokumenter = [
    {
      navn: 'Forhåndsvis vedtaksbrev',
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
    {
      navn: 'Orientering til arbeidsgiver om avslag',
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_ARBEIDSGIVER,
      data: {
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
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
      {(valgte_art_16_1_begrunnelser.length > 0 || art16_1_fritekst) &&
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 16, nr. 1:"
          valgteBegrunnelser={valgte_art_16_1_begrunnelser}
          muligeBegrunnelser={MKV.KTObjects.begrunnelser.art16_1_avslag}
          fritekst={art16_1_fritekst}
        />
      }
      {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />}
      <Nav.Hovedknapp disabled={!redigerbart} onClick={() => fattVedtak(MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND)}>
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
  behandlingID: PT.number.isRequired,
  fattVedtak: PT.func.isRequired,
  redigerbart: PT.bool,
};

VurderingAvslag12_x_og_16.defaultProps = {
  art16_1_fritekst: '',
  redigerbart: true,
};

const mapStateToProps = state => ({
  valgte_art_12_1_begrunnelser: VilkarSelectors.art12_1_begrunnelserSelector(state),
  valgte_art_12_2_begrunnelser: VilkarSelectors.art12_2_begrunnelserSelector(state),
  valgte_art_16_1_begrunnelser: VilkarSelectors.art16_1_begrunnelserSelector(state),
  art16_1_fritekst: VilkarSelectors.art16_1_fritekstSelector(state),
  vilkarBegrunnelser: VilkarSelectors.vilkarBegrunnelserSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

export default connect(mapStateToProps)(VurderingAvslag12_x_og_16);
