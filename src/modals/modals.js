import React, { Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import { FellesHandlersContext } from '../contexts';
import { modalerOperations, modalerSelectors } from '../ducks/modaler';
import { vedtakSelectors } from '../ducks/vedtak';
import { utpekSelectors } from '../ducks/utpek';

import DialogboksOppfriskSak from '../felleskomponenter/dialogboks/dialogboksOppfrisk';
import DialogboksVenter from '../felleskomponenter/dialogboks/dialogboksVenter';
import DialogboksHenlegg from '../felleskomponenter/dialogboks/dialogboksHenlegg';
import DialogboksAvsluttSakSomBortfalt from '../felleskomponenter/dialogboks/dialogboksAvsluttSakSomBortfalt';
import DialogboksAvslagSoknad from '../felleskomponenter/dialogboks/dialogboksAvslagSoknad';
import DialogboksRevurderFagsak from '../felleskomponenter/dialogboks/dialogboksRevurderFagsak';
import DialogboksValidering from '../felleskomponenter/dialogboks/dialogboksValidering';

const Modals = ({
  oppfriskningBlokkererInnhold,
  skjulOppfriskBekreftelseOgNavigerTilForside,
  hentBehandlingStatus,
  visOppfriskDialog,
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger,
  skjulOppfriskBekreftelse,
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
}) => (
  <Fragment>
    {
      oppfriskningBlokkererInnhold &&
      <DialogboksVenter
        tittel="Oppdaterer registeropplysninger"
        tekst="Vent mens registeropplysningene hentes på nytt fra TPS, Aa-register, Medl etc."
        synlig
        tilForsiden={skjulOppfriskBekreftelseOgNavigerTilForside}
        oppdater={hentBehandlingStatus}
      />
    }
    {
      visOppfriskDialog &&
      <DialogboksOppfriskSak
        bekreft={lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger}
        avbryt={skjulOppfriskBekreftelse}
        tilForsiden={skjulOppfriskBekreftelseOgNavigerTilForside}
        oppdater={hentBehandlingStatus}
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
  oppfriskningBlokkererInnhold: PT.bool.isRequired,
  skjulOppfriskBekreftelseOgNavigerTilForside: PT.func.isRequired,
  hentBehandlingStatus: PT.func.isRequired,
  visOppfriskDialog: PT.bool.isRequired,
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger: PT.func.isRequired,
  skjulOppfriskBekreftelse: PT.func.isRequired,
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
};

Modals.defaultProps = {
  valideringerFeilkoder: [],
};

const mapStateToProps = state => ({
  oppfriskningBlokkererInnhold: modalerSelectors.ErOppfriskningBlokkererInnholdSynligSelector(state),
  visOppfriskDialog: modalerSelectors.ErOppfriskSynligSelector(state),
  visHenleggDialog: modalerSelectors.ErHenleggSynligSelector(state),
  visAvslagSoknadDialog: modalerSelectors.ErAvslagSoknadSynligSelector(state),
  visAvsluttSakSomBortfaltDialog: modalerSelectors.ErAvsluttSakSomBortfaltSynligSelector(state),
  visRevurderFagsak: modalerSelectors.ErRevurderFagsakSynligSelector(state),
  visValideringModal: modalerSelectors.ErValideringSynligSelector(state),
  valideringerFeilkoder: [...vedtakSelectors.FeilkoderSelector(state), ...utpekSelectors.FeilkoderSelector(state)],
});

const mapDispatchToProps = dispatch => ({
  skjulOppfriskBekreftelse: () => dispatch(modalerOperations.skjulOppfrisk()),
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

