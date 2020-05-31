import React, { Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import { FellesHandlersContext } from '../contexts';
import { modalerOperations, modalerSelectors } from '../ducks/modaler';
import { vedtakSelectors } from '../ducks/vedtak';
import { utpekSelectors } from '../ducks/utpek';

import DialogboksOppfriskSak from '../felleskomponenter/dialogboks/dialogboksOppfrisk';
import DialogboksHenlegg from '../felleskomponenter/dialogboks/dialogboksHenlegg';
import DialogboksAvsluttSakSomBortfalt from '../felleskomponenter/dialogboks/dialogboksAvsluttSakSomBortfalt';
import DialogboksAvslagSoknad from '../felleskomponenter/dialogboks/dialogboksAvslagSoknad';
import DialogboksRevurderFagsak from '../felleskomponenter/dialogboks/dialogboksRevurderFagsak';
import DialogboksValidering from '../felleskomponenter/dialogboks/dialogboksValidering';

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
  valideringerFeilkoder,
  behandlingOppfriskes,
  annenBehandlingOppfriskes,
}) => (
  <Fragment>
    {
      visOppfriskDialog &&
      <DialogboksOppfriskSak
        oppfrisk={lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger}
        avbryt={skjulOppfriskModal}
        lukk={lukkOppfriskModal}
        tilForsiden={skjulOppfriskModalOgNavigerTilForside}
        behandlingOppfriskes={behandlingOppfriskes}
        annenBehandlingOppfriskes={annenBehandlingOppfriskes}
      />
    }
    {
      visHenleggDialog &&
      <DialogboksHenlegg
        avbryt={skjulHenleggDialogHandle}
        henleggHandle={henleggHandle}
      />
    }
    {
      visAvslagSoknadDialog &&
      <DialogboksAvslagSoknad
        avbryt={skjulAvslagSoknadDialogHandle}
        avslaaSoknad={avslaaSoknadHandle}
      />
    }
    {
      visAvsluttSakSomBortfaltDialog &&
      <DialogboksAvsluttSakSomBortfalt
        avbryt={skjulAvsluttSakSomBortfaltDialogHandle}
        avsluttSakSomBortfalt={avsluttSakSomBortfalt}
      />
    }
    {
      visRevurderFagsak &&
      <DialogboksRevurderFagsak
        avbryt={skjulRevurderFagsakDialogHandle}
        bekreft={revurderFagsak}
        spinner={venterPaRevurderFagsak}
      />
    }
    {
      visValideringModal &&
      <DialogboksValidering
        avbryt={skjulValideringModalDialogHandle}
        valideringer={valideringerFeilkoder}
      />
    }
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
  valideringerFeilkoder: PT.arrayOf(PT.string),
  behandlingOppfriskes: PT.bool.isRequired,
  annenBehandlingOppfriskes: PT.bool.isRequired,
};

Modals.defaultProps = {
  valideringerFeilkoder: [],
};

const mapStateToProps = state => ({
  visOppfriskDialog: modalerSelectors.ErOppfriskSynligSelector(state),
  visHenleggDialog: modalerSelectors.ErHenleggSynligSelector(state),
  visAvslagSoknadDialog: modalerSelectors.ErAvslagSoknadSynligSelector(state),
  visAvsluttSakSomBortfaltDialog: modalerSelectors.ErAvsluttSakSomBortfaltSynligSelector(state),
  visRevurderFagsak: modalerSelectors.ErRevurderFagsakSynligSelector(state),
  visValideringModal: modalerSelectors.ErValideringSynligSelector(state),
  valideringerFeilkoder: [...vedtakSelectors.FeilkoderSelector(state), ...utpekSelectors.FeilkoderSelector(state)],
});

const mapDispatchToProps = dispatch => ({
  skjulOppfriskModal: () => dispatch(modalerOperations.skjulOppfrisk()),
  lukkOppfriskModal: () => dispatch(modalerOperations.skjulOppfrisk()) && dispatch(modalerOperations.fjernBehandlingOppfriskes()),
  skjulHenleggDialogHandle: () => dispatch(modalerOperations.skjulHenlegg()),
  skjulAvslagSoknadDialogHandle: () => dispatch(modalerOperations.skjulAvslagSoknad()),
  skjulAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.skjulAvsluttSakSomBortfalt()),
  skjulRevurderFagsakDialogHandle: () => dispatch(modalerOperations.skjulRevurderFagsak()),
  skjulValideringModalDialogHandle: () => dispatch(modalerOperations.skjulValidering()),
});

const ConnectedModals = connect(mapStateToProps, mapDispatchToProps)(Modals);

export default () => (
  <FellesHandlersContext.Consumer>
    { fellesHandlers => <ConnectedModals {...fellesHandlers} />}
  </FellesHandlersContext.Consumer>
);

