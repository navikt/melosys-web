import React, { useState, Fragment } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { stringify } from 'qs';
import loadable from '@loadable/component';
import PT from 'prop-types';

import * as Utils from './utils';
import * as Api from './services/api';

import Modals from './modals';

import { oppgaverOperations } from './ducks/oppgaver';
import { soknadOperations } from './ducks/soknad';
import { datalastingOperations } from './ducks/datalasting';
import { vedtakOperations, vedtakSelectors } from './ducks/vedtak';
import { saksopplysningerOperations } from './ducks/saksopplysninger';
import { fagsakSelectors } from './ducks/fagsaker';
import { behandlingerOperations } from './ducks/behandlinger';
import { modalerOperations } from './ducks/modaler';

const SideLoadingStatus = <div>Laster inn side komponenten!</div>;

const UkjentSideLoadable = loadable(() => import('./sider/ukjentSide'), { fallback: SideLoadingStatus });
const ForsideLoadable = loadable(() => import('./sider/forside'), { fallback: SideLoadingStatus });
const SokLoadable = loadable(() => import('./sider/sok'), { fallback: SideLoadingStatus });
const SaksbehandlingLoadable = loadable(() => import('./sider/saksbehandling'), { fallback: SideLoadingStatus });
const JournalforingLoadable = loadable(() => import('./sider/journalforing'), { fallback: SideLoadingStatus });
const RegistreringUnntaksperioderLoadable = loadable(() => import('./sider/registrering/unntaksperioder'), { fallback: SideLoadingStatus });
const RegistreringAnmodningunntakLoadable = loadable(() => import('./sider/registrering/anmodningunntak'), { fallback: SideLoadingStatus });
const SedBehandlingLoadable = loadable(() => import('./sider/sedbehandling'), { fallback: SideLoadingStatus });
const OpprettNySakLoadable = loadable(() => import('./sider/opprettnysak'), { fallback: SideLoadingStatus });

const Routing = ({
  location,
  history,
  lagreAllData,
  hentOppgaveOversikt,
  tilbakeleggeOppgave,
  sjekkOppfriskningStatus,
  lastInnSaksopplysninger,
  oppfriskSaksopplysninger,
  lagreSoknad,
  saksnummer,
  apneTidligereBehandlinger,
  vedtakfeilkoder,
  avslaSoknad,
  skjulOppfriskDialogHandle,
  skjulHenleggDialogHandle,
  skjulAvsluttSakSomBortfaltDialogHandle,
  skjulRevurderVedtakDialogHandle,
  skjulOppfriskningBlokkererInnhold,
  visOppfriskDialogHandle,
  visHenleggDialogHandle,
  visAvslagSoknadDialogHandle,
  visAvsluttSakSomBortfaltDialogHandle,
  visRevurderVedtakDialogHandle,
  visValideringModalDialogHandle,
  visOppfriskningBlokkererInnhold,
}) => {
  const [venterPaRevurderVedtak, setVenterPaRevurderVedtak] = useState(false);

  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, 'behandlingID'));

  const skjulOppfriskBekreftelse = () => {
    skjulOppfriskDialogHandle();
    skjulOppfriskningBlokkererInnhold();
  };

  const hentBehandlingStatus = async () => {
    const oppfriskning = await sjekkOppfriskningStatus(behandlingID);

    if (oppfriskning && oppfriskning.response) {
      skjulOppfriskBekreftelse();
    } else if (oppfriskning.data === 'DONE') {
      skjulOppfriskBekreftelse();
      lastInnSaksopplysninger(saksnummer, behandlingID);
    }
  };

  const blokkerInnholdMedOppfriskSpinner = () => {
    visOppfriskningBlokkererInnhold();
  };

  const lagreSoknadOgOppfriskSaksopplysninger = async () => {
    await lagreSoknad();
    await oppfriskSaksopplysninger(behandlingID);
    blokkerInnholdMedOppfriskSpinner();
  };

  const tilForsiden = () => {
    hentOppgaveOversikt();
    history.push('/');
  };

  const tilOpprettNySak = () => {
    history.push('/opprettnysak');
  };

  const skjulOppfriskBekreftelseOgNavigerTilForside = () => {
    skjulOppfriskBekreftelse();
    tilForsiden();
  };

  const lagreOgLukk = async () => {
    await lagreAllData();
    tilForsiden();
  };

  const debouncedSetVenterPaVurderVedtak = Utils._debounce(() => setVenterPaRevurderVedtak(true), 500);

  const revurderVedtak = async () => {
    debouncedSetVenterPaVurderVedtak();

    try {
      const res = await Api.Saksflyt.Vedtak.revurder(behandlingID);
      const { behandlingID: nyBehandlingID } = res;

      history.replace(`${location.pathname}?${stringify({ behandlingID: nyBehandlingID })}`);
      lastInnSaksopplysninger(saksnummer, nyBehandlingID);
    } catch (e) {
      Utils.logger.error(e);
    }

    debouncedSetVenterPaVurderVedtak.cancel();
    setVenterPaRevurderVedtak(false);
    skjulRevurderVedtakDialogHandle();
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
    visOppfriskBekreftelse: visOppfriskDialogHandle,
    skjulOppfriskBekreftelseOgNavigerTilForside,
    apneTidligereBehandlinger,
    blokkerInnholdMedOppfriskSpinner,
    tilForsiden,
    tilOpprettNySak,
    visRevurderVedtakDialogHandle,
    visValideringModalDialogHandle,
  };

  return (
    <Fragment>
      <Switch location={location}>
        <Route exact path="/" render={props => <ForsideLoadable {...props} {...fellesHandlers} />} />
        <Route exact path="/sok/:fnr" component={SokLoadable} />
        <Route exact path="/registrering/:snr/unntaksperioder" render={props => <RegistreringUnntaksperioderLoadable {...props} {...fellesHandlers} />} />
        <Route exact path="/registrering/:snr/anmodningunntak" render={props => <RegistreringAnmodningunntakLoadable {...props} {...fellesHandlers} />} />
        <Route path="/sedbehandling/:snr" render={props => <SedBehandlingLoadable {...props} {...fellesHandlers} />} />
        <Route path="/saksbehandling/:snr" render={props => <SaksbehandlingLoadable {...props} {...fellesHandlers} />} />
        <Route path="/journalforing/:journalpostID/:oppgaveID" render={props => <JournalforingLoadable {...props} {...fellesHandlers} />} />
        <Route path="/opprettnysak" render={props => <OpprettNySakLoadable {...props} {...fellesHandlers} />} />;
        <Route component={UkjentSideLoadable} />
      </Switch>
      <Modals
        skjulOppfriskBekreftelseOgNavigerTilForside={skjulOppfriskBekreftelseOgNavigerTilForside}
        hentBehandlingStatus={hentBehandlingStatus}
        lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger}
        henleggHandle={henleggHandle}
        avslaaSoknadHandle={avslaaSoknadHandle}
        avsluttSakSomBortfalt={avsluttSakSomBortfalt}
        revurderVedtak={revurderVedtak}
        venterPaRevurderVedtak={venterPaRevurderVedtak}
        vedtakfeilkoder={vedtakfeilkoder}
        skjulOppfriskBekreftelse={skjulOppfriskBekreftelse}
      />
    </Fragment>
  );
};

Routing.propTypes = {
  location: PT.object.isRequired,
  history: PT.object.isRequired,
  lagreAllData: PT.func.isRequired,
  hentOppgaveOversikt: PT.func.isRequired,
  tilbakeleggeOppgave: PT.func.isRequired,
  sjekkOppfriskningStatus: PT.func.isRequired,
  lastInnSaksopplysninger: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  lagreSoknad: PT.func.isRequired,
  saksnummer: PT.string,
  apneTidligereBehandlinger: PT.func.isRequired,
  vedtakfeilkoder: PT.arrayOf(PT.string),
  avslaSoknad: PT.func.isRequired,
  skjulOppfriskDialogHandle: PT.func.isRequired,
  skjulHenleggDialogHandle: PT.func.isRequired,
  skjulAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  skjulRevurderVedtakDialogHandle: PT.func.isRequired,
  skjulOppfriskningBlokkererInnhold: PT.func.isRequired,
  visOppfriskDialogHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  visAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  visRevurderVedtakDialogHandle: PT.func.isRequired,
  visValideringModalDialogHandle: PT.func.isRequired,
  visOppfriskningBlokkererInnhold: PT.func.isRequired,
};

Routing.defaultProps = {
  saksnummer: undefined,
  vedtakfeilkoder: [],
};

const mapStateToProps = state => ({
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  vedtakfeilkoder: vedtakSelectors.FeilkoderSelector(state),
});

const mapDispatchToProps = dispatch => ({
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
  lagreSoknad: () => dispatch(soknadOperations.lagre()),
  hentOppgaveOversikt: () => dispatch(oppgaverOperations.oversikt()),
  tilbakeleggeOppgave: (oppgaveID, venterPaaDokumentasjon) => oppgaverOperations.tilbakelegg(oppgaveID, venterPaaDokumentasjon),
  avslaSoknad: behandlingID => dispatch(vedtakOperations.avslaSoknad(behandlingID)),
  sjekkOppfriskningStatus: behandlingID => dispatch(saksopplysningerOperations.sjekkStatus(behandlingID)),
  lastInnSaksopplysninger: (saksnummer, behandlingID) => dispatch(datalastingOperations.lastInnSaksopplysninger(saksnummer, behandlingID)),
  oppfriskSaksopplysninger: behandlingID => saksopplysningerOperations.oppfrisk(behandlingID),
  apneTidligereBehandlinger: () => dispatch(behandlingerOperations.apneTidligereBehandlinger()),
  skjulOppfriskDialogHandle: () => dispatch(modalerOperations.skjulOppfrisk()),
  skjulHenleggDialogHandle: () => dispatch(modalerOperations.skjulHenlegg()),
  skjulAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.skjulAvsluttSakSomBortfalt()),
  skjulRevurderVedtakDialogHandle: () => dispatch(modalerOperations.skjulRevurderVedtak()),
  skjulOppfriskningBlokkererInnhold: () => dispatch(modalerOperations.skjulOppfriskningBlokkererInnhold()),
  visOppfriskDialogHandle: () => dispatch(modalerOperations.visOppfrisk()),
  visHenleggDialogHandle: () => dispatch(modalerOperations.visHenlegg()),
  visAvslagSoknadDialogHandle: () => dispatch(modalerOperations.visAvslagSoknad()),
  visAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.visAvsluttSakSomBortfalt()),
  visRevurderVedtakDialogHandle: () => dispatch(modalerOperations.visRevurderVedtak()),
  visValideringModalDialogHandle: () => dispatch(modalerOperations.visValidering()),
  visOppfriskningBlokkererInnhold: () => dispatch(modalerOperations.visOppfriskningBlokkererInnhold()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Routing));
