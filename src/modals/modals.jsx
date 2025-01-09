import { Fragment } from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import { FellesHandlersContext } from "../contexts";
import { modalerOperations, modalerSelectors } from "../ducks/modaler";
import {
  DialogboksAvslagSoknad,
  DialogboksBekreftValg,
  DialogboksHenleggSak,
  DialogboksOppfriskSak,
} from "../felleskomponenter/dialogboks";

function ModalsInner({
  skjulOppfriskModalOgNavigerTilForside,
  visOppfriskDialog,
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
  skjulOppfriskModal,
  lukkOppfriskModal,
  visHenleggDialog,
  skjulHenleggDialogHandle,
  visAvslagSoknadDialog,
  skjulAvslagSoknadDialogHandle,
  visBekreftValgDialog,
}) {
  return (
    <>
      {visOppfriskDialog && (
        <DialogboksOppfriskSak
          oppfrisk={lagreMottatteOpplysningerOgOppfriskSaksopplysninger}
          avbryt={skjulOppfriskModal}
          lukk={lukkOppfriskModal}
          tilForsiden={skjulOppfriskModalOgNavigerTilForside}
        />
      )}
      {visHenleggDialog && <DialogboksHenleggSak avbryt={skjulHenleggDialogHandle} />}
      {visAvslagSoknadDialog && <DialogboksAvslagSoknad avbryt={skjulAvslagSoknadDialogHandle} />}
      {visBekreftValgDialog && <DialogboksBekreftValg />}
    </>
  );
}

Modals.propTypes = {
  skjulOppfriskModalOgNavigerTilForside: PT.func.isRequired,
  visOppfriskDialog: PT.bool.isRequired,
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger: PT.func.isRequired,
  skjulOppfriskModal: PT.func.isRequired,
  lukkOppfriskModal: PT.func.isRequired,
  visHenleggDialog: PT.bool.isRequired,
  skjulHenleggDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialog: PT.bool.isRequired,
  skjulAvslagSoknadDialogHandle: PT.func.isRequired,
  visBekreftValgDialog: PT.bool.isRequired,
};

const mapStateToProps = (state) => ({
  visOppfriskDialog: modalerSelectors.ErOppfriskSynligSelector(state),
  visHenleggDialog: modalerSelectors.ErHenleggSynligSelector(state),
  visAvslagSoknadDialog: modalerSelectors.ErAvslagSoknadSynligSelector(state),
  visBekreftValgDialog: modalerSelectors.ErBekreftValgSynligSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  skjulOppfriskModal: () => dispatch(modalerOperations.skjulOppfrisk()),
  lukkOppfriskModal: () =>
    dispatch(modalerOperations.skjulOppfrisk()) && dispatch(modalerOperations.fjernBehandlingOppfriskes()),
  skjulHenleggDialogHandle: () => dispatch(modalerOperations.skjulHenlegg()),
  skjulAvslagSoknadDialogHandle: () => dispatch(modalerOperations.skjulAvslagSoknad()),
});

const ConnectedModals = connect(mapStateToProps, mapDispatchToProps)(ModalsInner);

function Modals() {
  return (
    <FellesHandlersContext.Consumer>
      {(fellesHandlers) => <ConnectedModals {...fellesHandlers} />}
    </FellesHandlersContext.Consumer>
  );
}

export default Modals;
