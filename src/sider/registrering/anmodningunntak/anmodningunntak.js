/* eslint no-alert:off, consistent-return:off */
import React from 'react';
import PT from 'prop-types';

import * as Utils from '../../../utils/';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as Api from '../../../services/api';

import DialogboksOppfriskSak from '../../../felleskomponenter/dialogboks/dialogboksOppfrisk';
import DialogboksVenter from '../../../felleskomponenter/dialogboks/dialogboksVenter';
import DialogboksHenlegg from '../../../felleskomponenter/dialogboks/dialogboksHenlegg';
import Saksopplysninger from './komponenter/saksopplysninger';
import SideDialog from '../../../felleskomponenter/sideDialog/sideDialog';
import SideOppsummering from './komponenter/sideOppsummering';
import { fagsakOperations, fagsakSelectors } from '../../../ducks/fagsaker';
import { behandlingerOperations, behandlingerSelectors } from '../../../ducks/behandlinger';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from '../../../ducks/lovvalgsperioder';
import { oppgaverOperations } from '../../../ducks/oppgaver';

import './registrering.css';

import { saksopplysningerOperations } from '../../../ducks/saksopplysninger';
import { RegistreringStateProviderWrapper } from '../state/registreringStateProvider';

const Anmodningunntak = props => {
  const [saksnummer, setSaksnummer] = React.useState(null);
  const [behandlingID, setBehandlingID] = React.useState(-1);
  const [oppfriskDialog, visOppfriskDialog] = React.useState(false);
  const [henleggDialog, visHenleggDialog] = React.useState(false);
  const [oppfriskningBlokkererInnhold, visOppfriskningBlokkererInnhold] = React.useState(false);

  const tilForsiden = () => {
    this.props.history.push('/');
  };
  const skjulOppfriskBekreftelse = () => {
    visOppfriskDialog(false);
    visOppfriskningBlokkererInnhold(false);
  };
  const lastInnSaksopplysninger = async () => {
    const { match, location } = props;
    const { snr } = match.params;
    setSaksnummer(snr);
    const _behandlingID = Utils.queryString.getParam(location, 'behandlingID');
    setBehandlingID(Utils._toInteger(_behandlingID));

    const {
      hentAvklartefakta, hentBehandling, hentFagsaker, hentLovvalgsperioder,
    } = props;
    try {
      await Promise.all([
        hentBehandling(_behandlingID),
        hentFagsaker(snr),
        hentAvklartefakta(_behandlingID),
        hentLovvalgsperioder(_behandlingID),
      ]);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const henleggSak = async data => {
    const { fagsak: { saksnummer: snr } } = props;
    Api.Fagsaker.fagsak.henlegg(snr, data);
  };
  const hentBehandlingStatus = async () => {
    const oppfriskning = await Api.Saksopplysninger.sjekkStatus(behandlingID);

    if (oppfriskning && oppfriskning.response) {
      skjulOppfriskBekreftelse();
    } else if (oppfriskning === 'DONE') {
      skjulOppfriskBekreftelse();
      lastInnSaksopplysninger();
    }
  };

  const henleggHandle = async data => {
    try {
      await henleggSak(data);
    } catch (e) {
      Utils.logger.error(e);
    } finally {
      tilForsiden();
    }
  };
  const lagreOgLukk = async () => {
    const { history, hentOppgaveOversikt } = props;
    await hentOppgaveOversikt();
    history.push('/');
  };
  const tilbakeleggHandle = async () => {
    const { tilbakeleggOppgave } = props;
    const venterPaaDokumentasjon = true;

    await tilbakeleggOppgave(behandlingID, venterPaaDokumentasjon);
    lagreOgLukk();
  };
  const skjulHenleggDialog = () => {
    visHenleggDialog(false);
  };

  const blokkerInnholdMedOppfriskSpinner = () => {
    visOppfriskningBlokkererInnhold(true);
  };
  const lagreSoknadOgOppfriskSaksopplysninger = async () => {
    const { oppfriskSaksopplysninger } = props;
    await oppfriskSaksopplysninger(behandlingID);
    blokkerInnholdMedOppfriskSpinner();
  };
  const navigerTilOversiktSide = () => {
    visOppfriskDialog(false);
    props.history.push('/');
  };
  // ---------------------------------------
  React.useEffect(() => {
    lastInnSaksopplysninger();
    return () => props.resetFagsakState();
  }, []);

  // TODO add unmounts
  // ---------------------------------------
  const {
    vurderingBegrunnelser, medlemskap, sed, redigerbart,
  } = props;

  const oppfriskVenterDialog = oppfriskningBlokkererInnhold && (
    <div>
      <DialogboksVenter
        tittel="Oppdaterer registeropplysninger"
        tekst="Vent mens registeropplysningene hentes på nytt fra TPS, Aa-register, Medl etc."
        synlig
        tilForsiden={navigerTilOversiktSide}
        oppdater={hentBehandlingStatus}
      />
    </div>
  );

  if (Utils._isNil(redigerbart)) return null;
  return (
    <div className="registrering">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            <Saksopplysninger
              redigerbart={redigerbart}
              behandlingID={behandlingID}
              medlemskap={medlemskap}
              sed={sed}
              vurderingBegrunnelser={vurderingBegrunnelser}
            />
          </Nav.Column>
          <Nav.Column xs="5">
            <SideOppsummering
              behandlingID={behandlingID}
              lagreOgLukkHandle={lagreOgLukk}
              tilbakeleggeHandle={tilbakeleggHandle}
              tilForsidenHandle={navigerTilOversiktSide}
            />
            <SideDialog saksnummer={saksnummer} behandlingID={behandlingID} redigerbart={redigerbart} />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
      { oppfriskVenterDialog }
      {
        oppfriskDialog &&
        <DialogboksOppfriskSak
          bekreft={lagreSoknadOgOppfriskSaksopplysninger}
          avbryt={skjulOppfriskBekreftelse}
          tilForsiden={navigerTilOversiktSide}
          oppdater={hentBehandlingStatus}
        />
      }
      {
        henleggDialog &&
        <DialogboksHenlegg
          avbryt={skjulHenleggDialog}
          henleggHandle={henleggHandle}
        />
      }
    </div>
  );
};
Anmodningunntak.propTypes = {
  hentAvklartefakta: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  hentOppgaveOversikt: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  tilbakeleggOppgave: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  redigerbart: PT.bool,
  avklartefakta: MPT.AvklartefaktaListe,
  vurderingBegrunnelser: PT.object,
  fagsak: MPT.Fagsak,
  lovvalgsperioder: PT.array.isRequired, // TODO lag proptype
  medlemskap: MPT.Medlemskap,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
};
Anmodningunntak.defaultProps = {
  redigerbart: null,
  avklartefakta: [],
  fagsak: {},
  medlemskap: {},
  oppsummering: {},
  sed: {},
  vurderingBegrunnelser: {},
};
const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vurderingBegrunnelser: avklartefaktaSelectors.VurderingUnntakPeriode(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  sed: behandlingerSelectors.SEDSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentAvklartefakta: behandlingID => dispatch(avklartefaktaOperations.hent(behandlingID)),
  hentBehandling: behandlingID => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  hentLovvalgsperioder: behandlingID => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
  hentOppgaveOversikt: () => dispatch(oppgaverOperations.oversikt()),
  oppfriskSaksopplysninger: saksnummer => saksopplysningerOperations.oppfrisk(saksnummer),
  tilbakeleggOppgave: (oppgaveID, venterPaaDokumentasjon) => oppgaverOperations.tilbakelegg(oppgaveID, venterPaaDokumentasjon),
});

export default RegistreringStateProviderWrapper(mapStateToProps, mapDispatchToProps)(Anmodningunntak);
