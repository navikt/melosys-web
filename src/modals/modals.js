import React, { Fragment } from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import * as Nav from "../navFrontend";

import { FellesHandlersContext } from "../contexts";
import { modalerOperations, modalerSelectors } from "../ducks/modaler";

import {
  DialogboksAvslagSoknad,
  DialogboksAvsluttSakSomBortfalt,
  DialogboksFerdigbehandleSak,
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
  visAvsluttSakSomBortfaltDialog,
  skjulAvsluttSakSomBortfaltDialogHandle,
  avsluttSakSomBortfalt,
  visFerdigbehandleSakDialog,
  skjulFerdigbehandleSakDialogHandle,
  ferdigbehandleSak,
  behandlingOppfriskes,
  annenBehandlingOppfriskes,
}) => (
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
    {visAvsluttSakSomBortfaltDialog && (
      <DialogboksAvsluttSakSomBortfalt
        avbryt={skjulAvsluttSakSomBortfaltDialogHandle}
        avsluttSakSomBortfalt={avsluttSakSomBortfalt}
      />
    )}
    {visFerdigbehandleSakDialog && (
      <DialogboksFerdigbehandleSak avbryt={skjulFerdigbehandleSakDialogHandle} ferdigbehandleSak={ferdigbehandleSak} />
    )}
  </Fragment>
);

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
  visAvsluttSakSomBortfaltDialog: PT.bool.isRequired,
  skjulAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  avsluttSakSomBortfalt: PT.func.isRequired,
  visFerdigbehandleSakDialog: PT.bool.isRequired,
  skjulFerdigbehandleSakDialogHandle: PT.func.isRequired,
  ferdigbehandleSak: PT.func.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  annenBehandlingOppfriskes: PT.bool.isRequired,
};

const mapStateToProps = (state) => ({
  visOppfriskDialog: modalerSelectors.ErOppfriskSynligSelector(state),
  visHenleggDialog: modalerSelectors.ErHenleggSynligSelector(state),
  visAvslagSoknadDialog: modalerSelectors.ErAvslagSoknadSynligSelector(state),
  visAvsluttSakSomBortfaltDialog: modalerSelectors.ErAvsluttSakSomBortfaltSynligSelector(state),
  visFerdigbehandleSakDialog: modalerSelectors.ErFerdigbehandleSakSynligSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  skjulOppfriskModal: () => dispatch(modalerOperations.skjulOppfrisk()),
  lukkOppfriskModal: () =>
    dispatch(modalerOperations.skjulOppfrisk()) && dispatch(modalerOperations.fjernBehandlingOppfriskes()),
  skjulHenleggDialogHandle: () => dispatch(modalerOperations.skjulHenlegg()),
  skjulAvslagSoknadDialogHandle: () => dispatch(modalerOperations.skjulAvslagSoknad()),
  skjulAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.skjulAvsluttSakSomBortfalt()),
  skjulFerdigbehandleSakDialogHandle: () => dispatch(modalerOperations.skjulFerdigbehandleSak()),
});

const ConnectedModals = connect(mapStateToProps, mapDispatchToProps)(Modals);

export default () => (
  <FellesHandlersContext.Consumer>
    {(fellesHandlers) => <ConnectedModals {...fellesHandlers} />}
  </FellesHandlersContext.Consumer>
);
