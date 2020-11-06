import React, { ChangeEventHandler, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import PT from 'prop-types';
import { RootState } from 'AppTypes';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
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

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
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

  const velgBehandlingstemaHandle: ChangeEventHandler<HTMLInputElement> = event => {
    setBehandlingstema(event.target.value);
  };

  const endreBehandlingstemaHandle = () => {
    Api.Behandlinger.tema.endreBehandlingstema(behandlingID, behandlingstema).then(() => {
      setBehandlingstemaEndret(true);
      hentBehandling(behandlingID);
      const nyLink = Routing.lagUrl(saksnummer, behandlingID, behandlingstema);
      if (nyLink && nyLink !== link) tilAnnenSide(nyLink);
    }).catch(() => {
      setGenerellFeil('Behandlingstema ble ikke endret og oppdatert. Prøv igjen, eller se driftsmeldinger for mer informasjon');
    });
  };

  const renderBehandlingstemaEndret = () => (
    <div className="dialogboks">
      <div className="innhold">
        <Nav.AlertStripe type="suksess">
          Behandlingstemaet har blitt endret og oppdatert.
        </Nav.AlertStripe>
      </div>
      <div style={{ float: 'right' }}>
        <Mui.Knapp onClick={avbryt}>LUKK</Mui.Knapp>
      </div>
    </div>
  );

  const renderEndreBehandlingstema = () => (
    <div className="dialogboks">
      { !generellFeil
        ?
        <div>
          <Nav.typo.Systemtittel className="overskrift">Velg nytt behandlingstema</Nav.typo.Systemtittel>
          <div className="innhold">
            <Mui.KodeTermSelect
              onChange={velgBehandlingstemaHandle}
              label=""
              disableForsteValg={!!behandlingstema}
              value={behandlingstema}
              koder={muligeBehandlingstema.filter(tema => tema.kode !== props.behandlingstema)}
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
          <div className="innhold">
            <Nav.AlertStripe type="feil">
              {generellFeil}
            </Nav.AlertStripe>
          </div>
          <div style={{ float: 'right' }}>
            <Mui.Knapp onClick={avbryt}>LUKK</Mui.Knapp>
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
