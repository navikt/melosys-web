import React from "react";
import { connect, ConnectedProps } from "react-redux";
import PT from "prop-types";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";
import { behandlingsstatusSelectors } from "../../../ducks/behandlingsstatus";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { navigeringOperations } from "../../../ducks/navigering";
import * as Nav from "../../../navFrontend";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingsstatus: behandlingerSelectors.BehandlingsstatusKodeSelector(state),
  muligeBehandlingsstatuser: behandlingsstatusSelectors.MuligeBehandlingsstatusSelector(state),
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentBehandling: (behandlingID: number) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  tilAnnenSide: (link: string) => dispatch(navigeringOperations.tilAnnenSide(link)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  avbryt: () => void;
}

function DialogboksEndre({ avbryt }: Props & PropsFromRedux) {
  return (
    <Nav.Modal
      className="dialogboksEndreBehandlingsfrist"
      isOpen
      contentLabel="Velg ny behandlingsfrist"
      onRequestClose={avbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
    >
      null
    </Nav.Modal>
  );
}

DialogboksEndre.propTypes = {
  avbryt: PT.func.isRequired,
  behandlingID: PT.number.isRequired,
  behandlingsstatus: PT.string.isRequired,
  hentBehandling: PT.func.isRequired,
  muligeBehandlingsstatuser: PT.array.isRequired,
  saksnummer: PT.string.isRequired,
  tilAnnenSide: PT.func.isRequired,
};

export default connector(DialogboksEndre);
