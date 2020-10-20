import React, { useState } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { behandlingerOperations, behandlingerSelectors } from '../../ducks/behandlinger';
import { behandlingstemaSelectors } from '../../ducks/behandlingstema';
import Knapperad from '../knapperad';

import * as Mui from '../ui';
import * as Api from '../../services/api';
import * as Nav from '../../utils/navFrontend';

import './dialogboksEndreBehandlingstema.css';

function DialogboksEndreBehandlingstema({
  avbryt,
  ariaHideApp,
  behandlingID,
  hentBehandling,
  muligeBehandlingstema,
  ...props
}) {
  const [behandlingstema, setBehandlingstema] = useState(undefined);
  const [feilmeldingSelect, setFeilmeldingSelect] = useState(undefined);
  const [behandlingstemaEndret, setBehandlingstemaEndret] = useState(false);

  const velgBehandlingstemaHandle = event => {
    setBehandlingstema(event.target.value);
    setFeilmeldingSelect(undefined);
  };

  const endreBehandlingstemaHandle = () => {
    Api.Behandlinger.tema.endreBehandlingstema(behandlingID, behandlingstema).then(() => {
      setBehandlingstemaEndret(true);
      hentBehandling(behandlingID);
    }).catch(error => {
      // console.error(error);
      setFeilmeldingSelect({ feilmelding: error.status });
    });
  };

  const renderBehandlingstemaEndret = () => (
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
  );

  const renderEndreBehandlingstema = () => (
    <div>
      { muligeBehandlingstema.length && muligeBehandlingstema.length !== 0
        ?
        <div>
          <Nav.typo.Systemtittel className="overskrift">Velg nytt behandlingstema</Nav.typo.Systemtittel>
          <div className="select">
            <Mui.KodeTermSelect
              feil={feilmeldingSelect}
              onChange={velgBehandlingstemaHandle}
              label=""
              disableForsteValg={!!behandlingstema}
              value={behandlingstema}
              koder={muligeBehandlingstema.filter(tema => tema.kode !== props.behandlingstema)}
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
        :
        <div>
          Feil
        </div>
      }
    </div>
  );

  return (
    <Nav.Modal
      className="dialogboksEndreBehandlingstema"
      isOpen
      contentLabel="Velg nytt behandlingstema"
      onRequestClose={avbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
      ariaHideApp={ariaHideApp}>
      { behandlingstemaEndret
        ? renderBehandlingstemaEndret()
        : renderEndreBehandlingstema()
      }
    </Nav.Modal>
  );
}

DialogboksEndreBehandlingstema.propTypes = {
  behandlingstema: PT.string.isRequired,
  behandlingID: PT.number.isRequired,
  avbryt: PT.func.isRequired,
  ariaHideApp: PT.bool,
  muligeBehandlingstema: PT.array.isRequired,
  hentBehandling: PT.func.isRequired,
};

DialogboksEndreBehandlingstema.defaultProps = {
  ariaHideApp: true,
};

const mapStateToProps = state => ({
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  muligeBehandlingstema: behandlingstemaSelectors.muligeBehandlingstema(state),
});

const mapDispatchToProps = dispatch => ({
  hentBehandling: behandlingID => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
});


export default connect(mapStateToProps, mapDispatchToProps)(DialogboksEndreBehandlingstema);
