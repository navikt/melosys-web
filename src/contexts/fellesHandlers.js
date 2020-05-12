import React, { useState } from 'react';
import { connect } from 'react-redux';
import { stringify } from 'qs';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as Utils from '../utils';
import * as Api from '../services/api';

import { fagsakSelectors } from '../ducks/fagsaker';
import { datalastingOperations } from '../ducks/datalasting';
import { behandlingsgrunnlagOperations } from '../ducks/behandlingsgrunnlag';
import { oppgaverOperations } from '../ducks/oppgaver';
import { vedtakOperations } from '../ducks/vedtak';
import { saksopplysningerOperations } from '../ducks/saksopplysninger';
import { behandlingerOperations } from '../ducks/behandlinger';
import { modalerOperations, modalerSelectors } from '../ducks/modaler';

const FellesHandlersContext = React.createContext({});
export default FellesHandlersContext;

const FellesHandlersProviderUnconnected = ({
  children,
  location,
  history,
  lagreAllData,
  hentOppgaveOversikt,
  tilbakeleggeOppgave,
  lastInnSaksopplysninger,
  oppfriskSaksopplysninger,
  lagreBehandlingsgrunnlag,
  saksnummer,
  apneTidligereBehandlinger,
  avslaSoknad,
  skjulOppfriskDialogHandle,
  skjulHenleggDialogHandle,
  skjulAvsluttSakSomBortfaltDialogHandle,
  skjulRevurderFagsakDialogHandle,
  visOppfriskDialogHandle,
  visHenleggDialogHandle,
  visAvslagSoknadDialogHandle,
  visAvsluttSakSomBortfaltDialogHandle,
  visRevurderFagsakDialogHandle,
  visValideringModalDialogHandle,
  leggTilBehandlingOppfriskes,
  fjernBehandlingOppfriskes,
  behandlingUnderOppfriskning,
}) => {
  const [venterPaRevurderFagsak, setVenterPaRevurderFagsak] = useState(false);
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, 'behandlingID'));

  const lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger = async () => {
    await leggTilBehandlingOppfriskes(behandlingID);
    await lagreBehandlingsgrunnlag();
    await oppfriskSaksopplysninger(behandlingID);
    await fjernBehandlingOppfriskes();
    await lastInnSaksopplysninger(saksnummer, behandlingID);
  };

  const startOgVisOppfriskModal = async () => {
    await leggTilBehandlingOppfriskes(behandlingID);
    visOppfriskDialogHandle();
    await oppfriskSaksopplysninger(behandlingID);
    await fjernBehandlingOppfriskes();
    await lastInnSaksopplysninger(saksnummer, behandlingID);
  };

  const behandlingOppfriskes = behandlingUnderOppfriskning === behandlingID;

  const annenBehandlingOppfriskes = behandlingUnderOppfriskning !== null && !behandlingOppfriskes;

  const tilForsiden = () => {
    hentOppgaveOversikt();
    history.push('/');
  };

  const tilOpprettNySak = () => {
    history.push('/opprettnysak');
  };

  const skjulOppfriskModalOgNavigerTilForside = () => {
    skjulOppfriskDialogHandle();
    tilForsiden();
  };

  const lagreOgLukk = async () => {
    await lagreAllData();
    tilForsiden();
  };

  const debouncedSetVenterPaVurderVedtak = Utils._debounce(() => setVenterPaRevurderFagsak(true), 500);

  const revurderFagsak = async () => {
    debouncedSetVenterPaVurderVedtak();

    try {
      const res = await Api.Fagsaker.fagsak.revurder(saksnummer);
      const { behandlingID: nyBehandlingID } = res;

      history.replace(`${location.pathname}?${stringify({ behandlingID: nyBehandlingID })}`);
      lastInnSaksopplysninger(saksnummer, nyBehandlingID);
    } catch (e) {
      Utils.logger.error(e);
    }

    debouncedSetVenterPaVurderVedtak.cancel();
    setVenterPaRevurderFagsak(false);
    skjulRevurderFagsakDialogHandle();
  };

  const tilbakeleggOppgave = async () => {
    const venterPaaDokumentasjon = true;

    await tilbakeleggeOppgave(behandlingID, venterPaaDokumentasjon);
    lagreOgLukk();
  };

  const henleggSak = async data => Api.Fagsaker.fagsak.henlegg(saksnummer, data);

  const henleggHandle = async data => {
    try {
      await lagreAllData();
      await henleggSak(data);
      skjulHenleggDialogHandle();
      tilForsiden();
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const avslaaSoknadHandle = async () => {
    try {
      await lagreAllData();
      avslaSoknad(behandlingID);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const avsluttSakSomBortfalt = async () => {
    try {
      await Api.Fagsaker.fagsak.bortfall(saksnummer);
      skjulAvsluttSakSomBortfaltDialogHandle();
      tilForsiden();
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const fellesHandlers = {
    lagreOgLukk,
    tilbakeleggOppgave,
    visHenleggDialogHandle,
    visAvsluttSakSomBortfaltDialogHandle,
    visAvslagSoknadDialogHandle,
    visOppfriskModal: visOppfriskDialogHandle,
    skjulOppfriskModalOgNavigerTilForside,
    apneTidligereBehandlinger,
    tilForsiden,
    tilOpprettNySak,
    visRevurderFagsakDialogHandle,
    visValideringModalDialogHandle,
    revurderFagsak,
    henleggHandle,
    avslaaSoknadHandle,
    avsluttSakSomBortfalt,
    lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger,
    venterPaRevurderFagsak,
    behandlingOppfriskes,
    annenBehandlingOppfriskes,
    startOgVisOppfriskModal,
  };

  return (
    <FellesHandlersContext.Provider value={fellesHandlers}>
      {children}
    </FellesHandlersContext.Provider>
  );
};

FellesHandlersProviderUnconnected.propTypes = {
  children: PT.node.isRequired,
  history: PT.object.isRequired,
  location: PT.object.isRequired,
  lagreAllData: PT.func.isRequired,
  hentOppgaveOversikt: PT.func.isRequired,
  tilbakeleggeOppgave: PT.func.isRequired,
  lastInnSaksopplysninger: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  lagreBehandlingsgrunnlag: PT.func.isRequired,
  saksnummer: PT.string,
  apneTidligereBehandlinger: PT.func.isRequired,
  avslaSoknad: PT.func.isRequired,
  skjulOppfriskDialogHandle: PT.func.isRequired,
  skjulHenleggDialogHandle: PT.func.isRequired,
  skjulAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  skjulRevurderFagsakDialogHandle: PT.func.isRequired,
  visOppfriskDialogHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  visAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  visRevurderFagsakDialogHandle: PT.func.isRequired,
  visValideringModalDialogHandle: PT.func.isRequired,
  leggTilBehandlingOppfriskes: PT.func.isRequired,
  fjernBehandlingOppfriskes: PT.func.isRequired,
  behandlingUnderOppfriskning: PT.number,
};

FellesHandlersProviderUnconnected.defaultProps = {
  behandlingUnderOppfriskning: null,
};

FellesHandlersProviderUnconnected.defaultProps = {
  saksnummer: undefined,
};

const mapStateToProps = state => ({
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  behandlingUnderOppfriskning: modalerSelectors.BehandlingUnderOppfriskningSelector(state),
});

const mapDispatchToProps = dispatch => ({
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
  lagreBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.lagre()),
  hentOppgaveOversikt: () => dispatch(oppgaverOperations.oversikt()),
  tilbakeleggeOppgave: (oppgaveID, venterPaaDokumentasjon) => oppgaverOperations.tilbakelegg(oppgaveID, venterPaaDokumentasjon),
  avslaSoknad: behandlingID => dispatch(vedtakOperations.avslaSoknad(behandlingID)),
  lastInnSaksopplysninger: (saksnummer, behandlingID) => dispatch(datalastingOperations.lastInnSaksopplysninger(saksnummer, behandlingID)),
  oppfriskSaksopplysninger: behandlingID => saksopplysningerOperations.oppfrisk(behandlingID),
  leggTilBehandlingOppfriskes: behandlingID => dispatch(modalerOperations.leggTilBehandlingOppfriskes(behandlingID)),
  fjernBehandlingOppfriskes: () => dispatch(modalerOperations.fjernBehandlingOppfriskes()),
  apneTidligereBehandlinger: () => dispatch(behandlingerOperations.apneTidligereBehandlinger()),
  skjulOppfriskDialogHandle: () => dispatch(modalerOperations.skjulOppfrisk()),
  skjulHenleggDialogHandle: () => dispatch(modalerOperations.skjulHenlegg()),
  skjulAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.skjulAvsluttSakSomBortfalt()),
  skjulRevurderFagsakDialogHandle: () => dispatch(modalerOperations.skjulRevurderFagsak()),
  visOppfriskDialogHandle: () => dispatch(modalerOperations.visOppfrisk()),
  visHenleggDialogHandle: () => dispatch(modalerOperations.visHenlegg()),
  visAvslagSoknadDialogHandle: () => dispatch(modalerOperations.visAvslagSoknad()),
  visAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.visAvsluttSakSomBortfalt()),
  visRevurderFagsakDialogHandle: () => dispatch(modalerOperations.visRevurderFagsak()),
  visValideringModalDialogHandle: () => dispatch(modalerOperations.visValidering()),
});

export const FellesHandlersProvider = withRouter(connect(mapStateToProps, mapDispatchToProps)(FellesHandlersProviderUnconnected));
