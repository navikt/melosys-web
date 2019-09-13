import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../utils/navFrontend';
import * as Ikon from '../../resources/images';

import PdfLenkeListe from '../pdfLenkeListe';
import Knapperad from '../knapperad';

import { behandlingerSelectors } from '../../ducks/behandlinger';
import { redigerbartSelectors } from '../../ducks/redigerbart';

import './dialogboksAvslagSoknad.css';

export const DialogboksAvslagSoknad = props => {
  const {
    ariaHideApp,
    avbryt,
    behandlingID,
    redigerbart,
    avslaaSoknad,
  } = props;

  const pdfDokumenter = [{
    navn: 'Forhåndsvis vedtaksbrev',
    type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_MANGLENDE_OPPLYSNINGER,
    data: {
      begrunnelseKode: MKV.Koder.begrunnelser.folketrygdloven.avslag.MANGLENDE_OPPLYSNINGER,
      fritekst: null,
      mottaker: MKV.Koder.aktoersroller.BRUKER,
    },
  }];

  return (
    <Nav.Modal
      className="dialogboksAvslagSoknad"
      isOpen
      contentLabel="Avslå søknad"
      onRequestClose={avbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
      ariaHideApp={ariaHideApp}>
      <div className="avslagsoknadcontainer">
        <div
          className="vedtakIkon"
          style={{ backgroundImage: `url(${Ikon.VedtakGodkjent})` }}
        />
        <div>
          <Nav.Systemtittel className="overskrift">Avslå søknaden på grunn av manglende opplysninger</Nav.Systemtittel>
          {
            redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />
          }
          <div className="knapperadcontainer">
            <Knapperad
              avbryt={avbryt}
              avbrytTekst="AVBRYT"
              bekreft={avslaaSoknad}
              bekreftTekst="AVSLÅ SØKNAD"
              redigerbart={redigerbart}
            />
          </div>
        </div>
      </div>
    </Nav.Modal>
  );
};

DialogboksAvslagSoknad.propTypes = {
  avslaaSoknad: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  ariaHideApp: PT.bool,
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool.isRequired,
};

DialogboksAvslagSoknad.defaultProps = {
  ariaHideApp: true,
};

const mapStateToProps = state => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

export default connect(mapStateToProps)(DialogboksAvslagSoknad);
