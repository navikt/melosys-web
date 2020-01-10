import React, { Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import { modalerOperations, modalerSelectors } from './ducks/modaler';

import DialogboksOppfriskSak from './felleskomponenter/dialogboks/dialogboksOppfrisk';
import DialogboksVenter from './felleskomponenter/dialogboks/dialogboksVenter';
import DialogboksHenlegg from './felleskomponenter/dialogboks/dialogboksHenlegg';
import DialogboksAvsluttSakSomBortfalt from './felleskomponenter/dialogboks/dialogboksAvsluttSakSomBortfalt';
import DialogboksAvslagSoknad from './felleskomponenter/dialogboks/dialogboksAvslagSoknad';
import DialogboksRevurderVedtak from './felleskomponenter/dialogboks/dialogboksRevurderVedtak';
import DialogboksValidering from './felleskomponenter/dialogboks/dialogboksValidering';

const Modals = ({
  oppfriskningBlokkererInnhold,
  skjulOppfriskBekreftelseOgNavigerTilForside,
  hentBehandlingStatus,
  visOppfriskDialog,
  lagreSoknadOgOppfriskSaksopplysninger,
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
  visRevurderVedtak,
  skjulRevurderVedtakDialogHandle,
  revurderVedtak,
  venterPaRevurderVedtak,
  visValideringModal,
  skjulValideringModalDialogHandle,
  vedtakfeilkoder,
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
        bekreft={lagreSoknadOgOppfriskSaksopplysninger}
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
      visRevurderVedtak &&
      <DialogboksRevurderVedtak
        avbryt={skjulRevurderVedtakDialogHandle}
        bekreft={revurderVedtak}
        spinner={venterPaRevurderVedtak}
      />
    }
    {
      visValideringModal &&
      <DialogboksValidering
        avbryt={skjulValideringModalDialogHandle}
        valideringer={vedtakfeilkoder}
      />
    }
  </Fragment>
);

Modals.propTypes = {
  oppfriskningBlokkererInnhold: PT.bool.isRequired,
  skjulOppfriskBekreftelseOgNavigerTilForside: PT.func.isRequired,
  hentBehandlingStatus: PT.func.isRequired,
  visOppfriskDialog: PT.bool.isRequired,
  lagreSoknadOgOppfriskSaksopplysninger: PT.func.isRequired,
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
  visRevurderVedtak: PT.bool.isRequired,
  skjulRevurderVedtakDialogHandle: PT.func.isRequired,
  revurderVedtak: PT.func.isRequired,
  venterPaRevurderVedtak: PT.bool.isRequired,
  visValideringModal: PT.bool.isRequired,
  skjulValideringModalDialogHandle: PT.func.isRequired,
  vedtakfeilkoder: PT.arrayOf(PT.string),
};

Modals.defaultProps = {
  vedtakfeilkoder: [],
};

const mapStateToProps = state => ({
  oppfriskningBlokkererInnhold: modalerSelectors.ErOppfriskningBlokkererInnholdSynligSelector(state),
  visOppfriskDialog: modalerSelectors.ErOppfriskSynligSelector(state),
  visHenleggDialog: modalerSelectors.ErHenleggSynligSelector(state),
  visAvslagSoknadDialog: modalerSelectors.ErAvslagSoknadSynligSelector(state),
  visAvsluttSakSomBortfaltDialog: modalerSelectors.ErAvsluttSakSomBortfaltSynligSelector(state),
  visRevurderVedtak: modalerSelectors.ErRevurderVedtakSynligSelector(state),
  visValideringModal: modalerSelectors.ErValideringSynligSelector(state),
});

const mapDispatchToProps = dispatch => ({
  skjulOppfriskBekreftelse: () => dispatch(modalerOperations.skjulOppfrisk()),
  skjulHenleggDialogHandle: () => dispatch(modalerOperations.skjulHenlegg()),
  skjulAvslagSoknadDialogHandle: () => dispatch(modalerOperations.skjulAvslagSoknad()),
  skjulAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.skjulAvsluttSakSomBortfalt()),
  skjulRevurderVedtakDialogHandle: () => dispatch(modalerOperations.skjulRevurderVedtak()),
  skjulValideringModalDialogHandle: () => dispatch(modalerOperations.skjulValidering()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Modals);
