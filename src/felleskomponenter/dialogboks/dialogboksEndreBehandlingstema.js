import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { behandlingerSelectors } from '../../ducks/behandlinger';
import Knapperad from '../knapperad';

import * as Utils from '../../utils';
import * as Mui from '../ui';
import * as Api from '../../services/api';
import * as Nav from '../../utils/navFrontend';

import './dialogboksEndreBehandlingstema.css';

function DialogboksEndreBehandlingstema({
  avbryt, ariaHideApp, hentMuligeBehandlingstema, endreBehandlingstema, ...props
}) {
  const [behandlingstema, setBehandlingstema] = useState(props.behandlingstema);
  const [feilmeldingSelect, setFeilmeldingSelect] = useState(undefined);
  const [muligeBehandlingstema, setMuligeBehandlingstema] = useState([]);
  const [behandlingstemaEndret, setBehandlingstemaEndret] = useState(false);
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(window.location, 'behandlingID'));

  useEffect(() => {
    hentMuligeBehandlingstema(behandlingID).then(response => {
      setMuligeBehandlingstema(response);
    }).catch(error => {
      // console.error(error);
      setFeilmeldingSelect({ feilmelding: error });
    });
  }, []);

  const velgBehandlingstemaHandle = event => {
    setBehandlingstema(event.target.value);
    setFeilmeldingSelect(undefined);
  };

  const endreBehandlingstemaHandle = () => {
    endreBehandlingstema(behandlingID, behandlingstema).then(() => {
      setBehandlingstemaEndret(true);
    }).catch(error => {
      // console.error(error);
      setFeilmeldingSelect({ feilmelding: error });
    });
  };

  return (
    <Nav.Modal
      className="dialogboksEndreBehandlingstema"
      isOpen
      contentLabel="Velg nytt behandlingstema"
      onRequestClose={avbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
      ariaHideApp={ariaHideApp}>
      {behandlingstemaEndret
        ?
        <div>
          <Nav.typo.Systemtittel className="overskrift">Behandlingstema er blitt oppdatert</Nav.typo.Systemtittel>
          <div className="select">
            <Nav.AlertStripe type="suksess">
              Behandlingstemaet har blitt endret og oppdatert.
            </Nav.AlertStripe>
          </div>
          <div className="knapperadcontainer" style={{ float: 'right' }}>
            <Mui.Knapp onClick={avbryt}>LUKK</Mui.Knapp>
          </div>
        </div>
        :
        <div>
          <Nav.typo.Systemtittel className="overskrift">Velg nytt behandlingstema</Nav.typo.Systemtittel>
          <div className="select">
            <Mui.KodeTermSelect
              feil={feilmeldingSelect}
              onChange={velgBehandlingstemaHandle}
              label=""
              disableForsteValg={!!behandlingstema}
              value={behandlingstema}
              koder={muligeBehandlingstema}
            />
          </div>
          <div className="knapperadcontainer">
            <Knapperad
              avbryt={avbryt}
              avbrytTekst="AVBRYT"
              bekreft={endreBehandlingstemaHandle}
              bekreftTekst="ENDRE BEHANDLINGSTEMA"
              redigerbart
              bekreftRedigerbart={!!behandlingstema}
            />
          </div>
        </div>
      }
    </Nav.Modal>
  );
}

DialogboksEndreBehandlingstema.propTypes = {
  behandlingstema: PT.string.isRequired,
  avbryt: PT.func.isRequired,
  ariaHideApp: PT.bool,
  hentMuligeBehandlingstema: PT.func,
  endreBehandlingstema: PT.func,
};

DialogboksEndreBehandlingstema.defaultProps = {
  ariaHideApp: true,
  hentMuligeBehandlingstema: Api.Behandlinger.tema.hentMuligeBehandlingstema,
  endreBehandlingstema: Api.Behandlinger.tema.endreBehandlingstema,
};

const mapStateToProps = state => ({
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
});


export default connect(mapStateToProps)(DialogboksEndreBehandlingstema);
