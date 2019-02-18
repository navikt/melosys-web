import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import PdfLenkeListe from '../../pdfLenkeListe';

import { art12_1_begrunnelserSelector, art12_2_begrunnelserSelector, art16_1_begrunnelserSelector } from '../../../ducks/vilkar/selectors';
import { fagsakSelectors } from '../../../ducks/fagsaker';

import { kodeTilVerdi } from '../../../utils/kodeverk';

import './vurderingAvslag12_x_og_16.css';

const Begrunnelser = ({ label, valgteBegrunnelser, muligeBegrunnelser }) => (
  <div className="begrunnelser">
    <Nav.Element className="begrunnelseTittel">
      {label}
    </Nav.Element>
    {
      valgteBegrunnelser.map(begrunnelse => <div className="begrunnelse" key={begrunnelse}>{kodeTilVerdi(begrunnelse, muligeBegrunnelser)}</div>)
    }
  </div>
);

Begrunnelser.propTypes = {
  label: PT.string.isRequired,
  valgteBegrunnelser: PT.array.isRequired,
  muligeBegrunnelser: PT.array.isRequired,
};

class VurderingAvslag12_x_og_16 extends React.Component {
  render() {
    const {
      valgte_art_12_1_begrunnelser,
      valgte_art_12_2_begrunnelser,
      valgte_art_16_1_begrunnelser,
      oppsummering,
      fattVedtak,
    } = this.props;

    const dokumenter = [
      {
        navn: 'Forhåndsvis vedtaksbrev',
        type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV,
        data: {
          mottaker: MKV.Koder.aktoersroller.BRUKER,
        },
      },
    ];

    return (
      <div>
        <Nav.Undertittel>
          Avslag
        </Nav.Undertittel>
        {valgte_art_12_1_begrunnelser.length > 0 &&
          <Begrunnelser
            label="Søkeren fyller ikke kriteriene for artikkel 12. nr. 1:"
            valgteBegrunnelser={valgte_art_12_1_begrunnelser}
            muligeBegrunnelser={MKV.KTObjects.begrunnelser.art12_1_begrunnelser}
          />
        }
        {valgte_art_12_2_begrunnelser.length > 0 &&
          <Begrunnelser
            label="Søkeren fyller ikke kriteriene for artikkel 12, nr. 2:"
            valgteBegrunnelser={valgte_art_12_2_begrunnelser}
            muligeBegrunnelser={MKV.KTObjects.begrunnelser.art12_2_begrunnelser}
          />
        }
        {valgte_art_16_1_begrunnelser.length > 0 &&
          <Begrunnelser
            label="Søkeren fyller ikke kriteriene for artikkel 16, nr. 1:"
            valgteBegrunnelser={valgte_art_16_1_begrunnelser}
            muligeBegrunnelser={MKV.KTObjects.begrunnelser.art16_1_avslag}
          />
        }
        <PdfLenkeListe behandlingID={oppsummering.behandlingID} dokumenter={dokumenter} />
        <Nav.Hovedknapp onClick={fattVedtak}>
          Fatt vedtak
        </Nav.Hovedknapp>
      </div>
    );
  }
}

VurderingAvslag12_x_og_16.propTypes = {
  valgte_art_12_1_begrunnelser: PT.array.isRequired,
  valgte_art_12_2_begrunnelser: PT.array.isRequired,
  valgte_art_16_1_begrunnelser: PT.array.isRequired,
  oppsummering: PT.object.isRequired,
  fattVedtak: PT.func.isRequired,
};

const mapStateToProps = state => ({
  valgte_art_12_1_begrunnelser: art12_1_begrunnelserSelector(state),
  valgte_art_12_2_begrunnelser: art12_2_begrunnelserSelector(state),
  valgte_art_16_1_begrunnelser: art16_1_begrunnelserSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

export default connect(mapStateToProps, null)(VurderingAvslag12_x_og_16);
