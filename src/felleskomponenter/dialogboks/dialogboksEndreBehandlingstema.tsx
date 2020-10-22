import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import PT from 'prop-types';
import { RootState } from 'AppTypes';
import { behandlingerOperations, behandlingerSelectors } from '../../ducks/behandlinger';
import { behandlingstemaSelectors } from '../../ducks/behandlingstema';
import { fagsakSelectors } from '../../ducks/fagsaker';
import { navigeringOperations } from '../../ducks/navigering';
import Knapperad from '../knapperad';

import * as Mui from '../ui';
import * as Api from '../../services/api';
import * as Nav from '../../utils/navFrontend';
import * as Routing from '../../routing';

import './dialogboksEndreBehandlingstema.css';


const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  muligeBehandlingstema: behandlingstemaSelectors.MuligeBehandlingstemaSelector(state),
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
});

const mapDispatchToProps = (dispatch: any) => ({
  hentBehandling: (behandlingID: number) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  tilAnnenSide: (link: string) => dispatch(navigeringOperations.tilAnnenSide(link)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props { avbryt: () => void }

function DialogboksEndreBehandlingstema({
  avbryt,
  behandlingID,
  hentBehandling,
  muligeBehandlingstema,
  saksnummer,
  tilAnnenSide,
  ...props
} : Props & PropsFromRedux) {
  const [behandlingstema, setBehandlingstema] = useState('');
  const [generellFeil, setGenerellFeil] = useState('');
  const [behandlingstemaEndret, setBehandlingstemaEndret] = useState(false);
  const link = Routing.lagUrl(saksnummer, behandlingID, props.behandlingstema);

  const velgBehandlingstemaHandle = (event: any) => {
    setBehandlingstema(event.target.value);
  };

  const endreBehandlingstemaHandle = () => {
    Api.Behandlinger.tema.endreBehandlingstema(behandlingID, behandlingstema).then(() => {
      setBehandlingstemaEndret(true);
      hentBehandling(behandlingID);
    }).catch((error: any) => {
      setGenerellFeil(error.message ? error.message : "En feil skjedde ved endring av behandlingstema");
    });
  };

  const avbrytHandle = () => {
    const nyLink = Routing.lagUrl(saksnummer, behandlingID, behandlingstema);
    if (nyLink && nyLink !== link) tilAnnenSide(nyLink);
    avbryt();
  };

  const renderBehandlingstemaEndret = () => (
    <div>
      <Nav.typo.Systemtittel className="overskrift">Behandlingstema er blitt oppdatert</Nav.typo.Systemtittel>
      <div className="select">
        <Nav.AlertStripe type="suksess">
          Behandlingstemaet har blitt endret og oppdatert.
        </Nav.AlertStripe>
      </div>
      <div style={{ float: 'right' }}>
        <Mui.Knapp onClick={avbrytHandle}>LUKK</Mui.Knapp>
      </div>
    </div>
  );

  const renderEndreBehandlingstema = () => (
    <div>
      { !generellFeil
        ?
        <div>
          <Nav.typo.Systemtittel className="overskrift">Velg nytt behandlingstema</Nav.typo.Systemtittel>
          <div className="select">
            <Mui.KodeTermSelect
              onChange={velgBehandlingstemaHandle}
              label=""
              disableForsteValg={!!behandlingstema}
              value={behandlingstema}
              koder={muligeBehandlingstema.filter((tema: any) => tema.kode !== props.behandlingstema)}
            />
          </div>
          <div>
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
          <Nav.typo.Systemtittel className="overskrift">Beklager, noe gikk galt</Nav.typo.Systemtittel>
          <div className="select">
            <Nav.AlertStripe type="feil">
              {generellFeil}
            </Nav.AlertStripe>
          </div>
          <div style={{ float: 'right' }}>
            <Mui.Knapp onClick={avbrytHandle}>LUKK</Mui.Knapp>
          </div>
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
      shouldCloseOnOverlayClick>
      { behandlingstemaEndret
        ? renderBehandlingstemaEndret()
        : renderEndreBehandlingstema()
      }
    </Nav.Modal>
  );
}


DialogboksEndreBehandlingstema.propTypes = {
  avbryt: PT.func.isRequired,
  behandlingID: PT.number.isRequired,
  behandlingstema: PT.string.isRequired,
  hentBehandling: PT.func.isRequired,
  muligeBehandlingstema: PT.array.isRequired,
  saksnummer: PT.string.isRequired,
  tilAnnenSide: PT.func.isRequired,
};

export default connector(DialogboksEndreBehandlingstema);
