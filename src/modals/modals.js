import React, { Fragment } from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import * as Nav from "../utils/navFrontend";

import { FellesHandlersContext } from "../contexts";
import { modalerOperations, modalerSelectors } from "../ducks/modaler";
import { feiletresponsSelectors } from "../ducks/feiletrespons";

import DialogboksOppfriskSak from "../felleskomponenter/dialogboks/oppfrisk/dialogboksOppfrisk";
import DialogboksHenlegg from "../felleskomponenter/dialogboks/henlegg/dialogboksHenlegg";
import DialogboksAvsluttSakSomBortfalt from "../felleskomponenter/dialogboks/avsluttSakSomBortfalt/dialogboksAvsluttSakSomBortfalt";
import DialogboksAvslagSoknad from "../felleskomponenter/dialogboks/avslagSoknad/dialogboksAvslagSoknad";
import DialogboksRevurderFagsak from "../felleskomponenter/dialogboks/revurderFagsak/dialogboksRevurderFagsak";
import DialogboksValidering from "../felleskomponenter/dialogboks/validering";
import DialogboksEndreBehandlingstema from "../felleskomponenter/dialogboks/endreBehandlingstema/dialogboksEndreBehandlingstema";
import DialogboksEndreBehandlingsstatus from "../felleskomponenter/dialogboks/endreBehandlingsstatus/dialogboksEndreBehandlingsstatus";

Nav.Modal.setAppElement(document.getElementById("root"));

const Modals = ({
  skjulOppfriskModalOgNavigerTilForside,
  visOppfriskDialog,
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger,
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
  visRevurderFagsak,
  skjulRevurderFagsakDialogHandle,
  revurderFagsak,
  venterPaRevurderFagsak,
  visValideringModal,
  skjulValideringModalDialogHandle,
  visEndreBehandlingstemaDialog,
  visEndreBehandlingsstatusDialog,
  skjulEndreBehandlingstemaModalDialogHandle,
  skjulEndreBehandlingsstatusModalDialogHandle,
  valideringerFeilkoder,
  valideringerFeilmeldinger,
  behandlingOppfriskes,
  annenBehandlingOppfriskes,
}) => (
  <Fragment>
    {visOppfriskDialog && (
      <DialogboksOppfriskSak
        oppfrisk={lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger}
        avbryt={skjulOppfriskModal}
        lukk={lukkOppfriskModal}
        tilForsiden={skjulOppfriskModalOgNavigerTilForside}
        behandlingOppfriskes={behandlingOppfriskes}
        annenBehandlingOppfriskes={annenBehandlingOppfriskes}
      />
    )}
    {visHenleggDialog && <DialogboksHenlegg avbryt={skjulHenleggDialogHandle} henleggHandle={henleggHandle} />}
    {visAvslagSoknadDialog && (
      <DialogboksAvslagSoknad avbryt={skjulAvslagSoknadDialogHandle} avslaaSoknadHandle={avslaaSoknadHandle} />
    )}
    {visAvsluttSakSomBortfaltDialog && (
      <DialogboksAvsluttSakSomBortfalt
        avbryt={skjulAvsluttSakSomBortfaltDialogHandle}
        avsluttSakSomBortfalt={avsluttSakSomBortfalt}
      />
    )}
    {visRevurderFagsak && (
      <DialogboksRevurderFagsak
        avbryt={skjulRevurderFagsakDialogHandle}
        bekreft={revurderFagsak}
        spinner={venterPaRevurderFagsak}
      />
    )}
    {visValideringModal && (
      <DialogboksValidering
        avbryt={skjulValideringModalDialogHandle}
        valideringer={valideringerFeilkoder}
        feilmeldinger={valideringerFeilmeldinger}
      />
    )}
    {visEndreBehandlingstemaDialog && (
      <DialogboksEndreBehandlingstema avbryt={skjulEndreBehandlingstemaModalDialogHandle} />
    )}
    {visEndreBehandlingsstatusDialog && (
      <DialogboksEndreBehandlingsstatus avbryt={skjulEndreBehandlingsstatusModalDialogHandle} />
    )}
  </Fragment>
);

Modals.propTypes = {
  skjulOppfriskModalOgNavigerTilForside: PT.func.isRequired,
  visOppfriskDialog: PT.bool.isRequired,
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger: PT.func.isRequired,
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
  visRevurderFagsak: PT.bool.isRequired,
  skjulRevurderFagsakDialogHandle: PT.func.isRequired,
  revurderFagsak: PT.func.isRequired,
  venterPaRevurderFagsak: PT.bool.isRequired,
  visValideringModal: PT.bool.isRequired,
  skjulValideringModalDialogHandle: PT.func.isRequired,
  visEndreBehandlingstemaDialog: PT.bool.isRequired,
  skjulEndreBehandlingstemaModalDialogHandle: PT.func.isRequired,
  visEndreBehandlingsstatusDialog: PT.bool.isRequired,
  skjulEndreBehandlingsstatusModalDialogHandle: PT.func.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  annenBehandlingOppfriskes: PT.bool.isRequired,
  valideringerFeilkoder: PT.arrayOf(
    PT.shape({
      kode: PT.string.isRequired,
      felter: PT.arrayOf(PT.string).isRequired,
    })
  ),
  valideringerFeilmeldinger: PT.arrayOf(
    PT.shape({
      tittel: PT.string.isRequired,
      innhold: PT.string.isRequired,
    })
  ),
};

Modals.defaultProps = {
  valideringerFeilkoder: [],
  valideringerFeilmeldinger: [],
};

const mapStateToProps = (state) => ({
  visOppfriskDialog: modalerSelectors.ErOppfriskSynligSelector(state),
  visHenleggDialog: modalerSelectors.ErHenleggSynligSelector(state),
  visAvslagSoknadDialog: modalerSelectors.ErAvslagSoknadSynligSelector(state),
  visAvsluttSakSomBortfaltDialog: modalerSelectors.ErAvsluttSakSomBortfaltSynligSelector(state),
  visRevurderFagsak: modalerSelectors.ErRevurderFagsakSynligSelector(state),
  visValideringModal: modalerSelectors.ErValideringSynligSelector(state),
  valideringerFeilkoder: feiletresponsSelectors.FeilkoderSelector(state),
  valideringerFeilmeldinger: feiletresponsSelectors.FeilmeldingSelector(state),
  visEndreBehandlingstemaDialog: modalerSelectors.ErEndreBehandlingstemaSynligSelector(state),
  visEndreBehandlingsstatusDialog: modalerSelectors.ErEndreBehandlingsstatusSynligSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  skjulOppfriskModal: () => dispatch(modalerOperations.skjulOppfrisk()),
  lukkOppfriskModal: () =>
    dispatch(modalerOperations.skjulOppfrisk()) && dispatch(modalerOperations.fjernBehandlingOppfriskes()),
  skjulHenleggDialogHandle: () => dispatch(modalerOperations.skjulHenlegg()),
  skjulAvslagSoknadDialogHandle: () => dispatch(modalerOperations.skjulAvslagSoknad()),
  skjulAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.skjulAvsluttSakSomBortfalt()),
  skjulRevurderFagsakDialogHandle: () => dispatch(modalerOperations.skjulRevurderFagsak()),
  skjulValideringModalDialogHandle: () => dispatch(modalerOperations.skjulValidering()),
  skjulEndreBehandlingstemaModalDialogHandle: () => dispatch(modalerOperations.skjulEndreBehandlingstema()),
  skjulEndreBehandlingsstatusModalDialogHandle: () => dispatch(modalerOperations.skjulEndreBehandlingsstatus()),
});

const ConnectedModals = connect(mapStateToProps, mapDispatchToProps)(Modals);

export default () => (
  <FellesHandlersContext.Consumer>
    {(fellesHandlers) => <ConnectedModals {...fellesHandlers} />}
  </FellesHandlersContext.Consumer>
);
