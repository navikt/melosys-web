import React, { useState } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import loadable from '@loadable/component';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Utils from './utils';
import * as Api from './services/api';

import DialogboksOppfriskSak from './felleskomponenter/dialogboks/dialogboksOppfrisk';
import DialogboksVenter from './felleskomponenter/dialogboks/dialogboksVenter';
import DialogboksHenlegg from './felleskomponenter/dialogboks/dialogboksHenlegg';
import DialogboksAvsluttSakSomBortfalt from './felleskomponenter/dialogboks/dialogboksAvsluttSakSomBortfalt';
import DialogboksAvslagSoknad from './felleskomponenter/dialogboks/dialogboksAvslagSoknad';
import ErrorBoundary from './felleskomponenter/ErrorBoundary';

import { oppgaverOperations } from './ducks/oppgaver';
import { soknadOperations } from './ducks/soknad';
import { datalastingOperations } from './ducks/datalasting';
import { vedtakOperations } from './ducks/vedtak';
import { saksopplysningerOperations } from './ducks/saksopplysninger';
import { fagsakSelectors } from './ducks/fagsaker';
import { behandlingerOperations } from './ducks/behandlinger';

const SideLoadingStatus = <div>Laster inn side komponenten!</div>;
const SideLoadingFailMessage = 'Beklager, kan ikke laste inn side komponenten.';

const UkjentSideLoadable = loadable(() => import('./sider/ukjentSide'), { fallback: SideLoadingStatus });
const ForsideLoadable = loadable(() => import('./sider/forside'), { fallback: SideLoadingStatus });
const SokLoadable = loadable(() => import('./sider/sok'), { fallback: SideLoadingStatus });
const SaksbehandlingLoadable = loadable(() => import('./sider/saksbehandling'), { fallback: SideLoadingStatus });
const JournalforingLoadable = loadable(() => import('./sider/journalforing'), { fallback: SideLoadingStatus });
const RegistreringUnntaksperioderLoadable = loadable(() => import('./sider/registrering/unntaksperioder'), { fallback: SideLoadingStatus });
const RegistreringAnmodningunntakLoadable = loadable(() => import('./sider/registrering/anmodningunntak'), { fallback: SideLoadingStatus });
const SedBehandlingLoadable = loadable(() => import('./sider/sedbehandling'), { fallback: SideLoadingStatus });

const Routing = ({
  location,
  history,
  lagreAllData,
  hentOppgaveOversikt,
  tilbakeleggeOppgave,
  fattVedtak,
  sjekkOppfriskningStatus,
  lastInnSaksopplysninger,
  oppfriskSaksopplysninger,
  lagreSoknad,
  saksnummer,
  apneTidligereBehandlinger,
}) => {
  const [visHenleggDialog, setVisHenleggDialog] = useState(false);
  const [visAvsluttSakSomBortfaltDialog, setVisAvsluttSakSomBortfaltDialog] = useState(false);
  const [visAvslagSoknadDialog, setVisAvslagSoknadDialog] = useState(false);
  const [visOppfriskDialog, setVisOppfriskDialog] = useState(false);
  const [oppfriskningBlokkererInnhold, setOppfriskningBlokkererInnhold] = useState(false);

  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, 'behandlingID'));

  const visHenleggDialogHandle = () => {
    setVisHenleggDialog(true);
  };

  const visAvsluttSakSomBortfaltDialogHandle = () => {
    setVisAvsluttSakSomBortfaltDialog(true);
  };

  const visAvslagSoknadDialogHandle = () => {
    setVisAvslagSoknadDialog(true);
  };

  const skjulHenleggDialogHandle = () => {
    setVisHenleggDialog(false);
  };

  const skjulAvsluttSakSomBortfaltDialogHandle = () => {
    setVisAvsluttSakSomBortfaltDialog(false);
  };

  const skjulAvslagSoknadDialogHandle = () => {
    setVisAvslagSoknadDialog(false);
  };

  const visOppfriskBekreftelse = () => {
    setVisOppfriskDialog(true);
  };

  const skjulOppfriskBekreftelse = () => {
    setVisOppfriskDialog(false);
    setOppfriskningBlokkererInnhold(false);
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
    setOppfriskningBlokkererInnhold(true);
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

  const skjulOppfriskBekreftelseOgNavigerTilForside = () => {
    skjulOppfriskBekreftelse();
    tilForsiden();
  };

  const lagreOgLukk = () => {
    lagreAllData();
    tilForsiden();
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

  const avslaaSoknad = () => fattVedtak(behandlingID, { behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL });

  const avslaaSoknadHandle = async () => {
    try {
      await lagreAllData();
      await avslaaSoknad();
      skjulAvslagSoknadDialogHandle();
      tilForsiden();
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
    visOppfriskBekreftelse,
    skjulOppfriskBekreftelseOgNavigerTilForside,
    apneTidligereBehandlinger,
    blokkerInnholdMedOppfriskSpinner,
    tilForsiden,
  };

  return (
    <ErrorBoundary message={SideLoadingFailMessage}>
      <Switch location={location}>
        <Route exact path="/" component={ForsideLoadable} />
        <Route exact path="/sok/:fnr" component={SokLoadable} />
        <Route exact path="/registrering/:snr/unntaksperioder" render={props => <RegistreringUnntaksperioderLoadable {...props} {...fellesHandlers} />} />
        <Route exact path="/registrering/:snr/anmodningunntak" render={props => <RegistreringAnmodningunntakLoadable {...props} {...fellesHandlers} />} />
        <Route path="/sedbehandling/:snr" render={props => <SedBehandlingLoadable {...props} {...fellesHandlers} />} />
        <Route path="/saksbehandling/:snr" render={props => <SaksbehandlingLoadable {...props} {...fellesHandlers} />} />
        <Route path="/journalforing/:journalpostID/:oppgaveID" render={props => <JournalforingLoadable {...props} {...fellesHandlers} />} />
        <Route component={UkjentSideLoadable} />
      </Switch>
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
    </ErrorBoundary>
  );
};

Routing.propTypes = {
  location: PT.object.isRequired,
  history: PT.object.isRequired,
  lagreAllData: PT.func.isRequired,
  hentOppgaveOversikt: PT.func.isRequired,
  tilbakeleggeOppgave: PT.func.isRequired,
  fattVedtak: PT.func.isRequired,
  sjekkOppfriskningStatus: PT.func.isRequired,
  lastInnSaksopplysninger: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  lagreSoknad: PT.func.isRequired,
  saksnummer: PT.string,
  apneTidligereBehandlinger: PT.func.isRequired,
};

Routing.defaultProps = {
  saksnummer: undefined,
};

const mapStateToProps = state => ({
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
  lagreSoknad: () => dispatch(soknadOperations.lagre()),
  hentOppgaveOversikt: () => dispatch(oppgaverOperations.oversikt()),
  tilbakeleggeOppgave: (oppgaveID, venterPaaDokumentasjon) => oppgaverOperations.tilbakelegg(oppgaveID, venterPaaDokumentasjon),
  fattVedtak: (behandlingID, body) => dispatch(vedtakOperations.fatt(behandlingID, body)),
  sjekkOppfriskningStatus: behandlingID => dispatch(saksopplysningerOperations.sjekkStatus(behandlingID)),
  lastInnSaksopplysninger: (saksnummer, behandlingID) => dispatch(datalastingOperations.lastInnSaksopplysninger(saksnummer, behandlingID)),
  oppfriskSaksopplysninger: behandlingID => saksopplysningerOperations.oppfrisk(behandlingID),
  apneTidligereBehandlinger: () => dispatch(behandlingerOperations.apneTidligereBehandlinger()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Routing));
