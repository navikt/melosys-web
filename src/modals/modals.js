import React, { Fragment } from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import * as Nav from "../navFrontend";

import { FellesHandlersContext } from "../contexts";
import { modalerOperations, modalerSelectors } from "../ducks/modaler";
import { behandlingerSelectors } from "../ducks/behandlinger";
import { fagsakSelectors } from "../ducks/fagsaker";
import {
  DialogboksAvslagSoknad,
  DialogboksBekreftValg,
  DialogboksHenleggSak,
  DialogboksOppfriskSak,
} from "../felleskomponenter/dialogboks";

Nav.Modal.setAppElement(document.getElementById("root"));

const Modals = ({
  skjulOppfriskModalOgNavigerTilForside,
  visOppfriskDialog,
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
  skjulOppfriskModal,
  lukkOppfriskModal,
  visHenleggDialog,
  skjulHenleggDialogHandle,
  henleggHandle,
  visAvslagSoknadDialog,
  skjulAvslagSoknadDialogHandle,
  avslaaSoknadHandle,
  avsluttSakSomBortfalt,
  visBekreftValgDialog,
  skjulBekreftValgDialogHandle,
  ferdigbehandleSak,
  behandlingOppfriskes,
  annenBehandlingOppfriskes,
}) => {
  return (
    <Fragment>
      {visOppfriskDialog && (
        <DialogboksOppfriskSak
          oppfrisk={lagreMottatteOpplysningerOgOppfriskSaksopplysninger}
          avbryt={skjulOppfriskModal}
          lukk={lukkOppfriskModal}
          tilForsiden={skjulOppfriskModalOgNavigerTilForside}
          behandlingOppfriskes={behandlingOppfriskes}
          annenBehandlingOppfriskes={annenBehandlingOppfriskes}
        />
      )}
      {visHenleggDialog && <DialogboksHenleggSak avbryt={skjulHenleggDialogHandle} henleggHandle={henleggHandle} />}
      {visAvslagSoknadDialog && (
        <DialogboksAvslagSoknad avbryt={skjulAvslagSoknadDialogHandle} avslaaSoknadHandle={avslaaSoknadHandle} />
      )}
      {visBekreftValgDialog && (
        <DialogboksBekreftValg
          ferdigbehandleSak={ferdigbehandleSak}
          avsluttSakSomBortfalt={avsluttSakSomBortfalt}
          handleAvbryt={skjulBekreftValgDialogHandle}
        />
      )}
    </Fragment>
  );
};

Modals.propTypes = {
  skjulOppfriskModalOgNavigerTilForside: PT.func.isRequired,
  visOppfriskDialog: PT.bool.isRequired,
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger: PT.func.isRequired,
  skjulOppfriskModal: PT.func.isRequired,
  lukkOppfriskModal: PT.func.isRequired,
  visHenleggDialog: PT.bool.isRequired,
  skjulHenleggDialogHandle: PT.func.isRequired,
  henleggHandle: PT.func.isRequired,
  visAvslagSoknadDialog: PT.bool.isRequired,
  skjulAvslagSoknadDialogHandle: PT.func.isRequired,
  avslaaSoknadHandle: PT.func.isRequired,
  avsluttSakSomBortfalt: PT.func.isRequired,
  visBekreftValgDialog: PT.bool.isRequired,
  skjulBekreftValgDialogHandle: PT.func.isRequired,
  ferdigbehandleSak: PT.func.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  annenBehandlingOppfriskes: PT.bool.isRequired,
  bekreftValgType: PT.oneOfType([PT.string, PT.number]),
  behandlingID: PT.number.isRequired,
  behandlingstema: PT.string.isRequired,
  sakstype: PT.string.isRequired,
};
Modals.defaultProps = {
  bekreftValgType: "",
};

const mapStateToProps = (state) => ({
  visOppfriskDialog: modalerSelectors.ErOppfriskSynligSelector(state),
  visHenleggDialog: modalerSelectors.ErHenleggSynligSelector(state),
  visAvslagSoknadDialog: modalerSelectors.ErAvslagSoknadSynligSelector(state),
  visBekreftValgDialog: modalerSelectors.ErBekreftValgSynligSelector(state),
  bekreftValgType: modalerSelectors.BekreftValgTypeSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  skjulOppfriskModal: () => dispatch(modalerOperations.skjulOppfrisk()),
  lukkOppfriskModal: () =>
    dispatch(modalerOperations.skjulOppfrisk()) && dispatch(modalerOperations.fjernBehandlingOppfriskes()),
  skjulHenleggDialogHandle: () => dispatch(modalerOperations.skjulHenlegg()),
  skjulAvslagSoknadDialogHandle: () => dispatch(modalerOperations.skjulAvslagSoknad()),
  skjulBekreftValgDialogHandle: () => dispatch(modalerOperations.skjulBekreftValg()),
});

const ConnectedModals = connect(mapStateToProps, mapDispatchToProps)(Modals);

export default () => (
  <FellesHandlersContext.Consumer>
    {(fellesHandlers) => <ConnectedModals {...fellesHandlers} />}
  </FellesHandlersContext.Consumer>
);
