/* eslint no-alert:off, consistent-return:off */
import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';
import * as Api from '../../../services/api';

import Saksopplysninger from './komponenter/saksopplysninger';
import SideDialog from '../../../felleskomponenter/sideDialog/sideDialog';
import SideOppsummering from './komponenter/sideOppsummering';
import { behandlingerOperations, behandlingerSelectors } from '../../../ducks/behandlinger';
import { fagsakOperations, fagsakSelectors } from '../../../ducks/fagsaker';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../ducks/avklartefakta';
import { lovvalgsperioderOperations } from '../../../ducks/lovvalgsperioder';
import { oppgaverOperations } from '../../../ducks/oppgaver';
import { soknadOperations, soknadSelectors } from '../../../ducks/soknad';

import { initialState, reducer } from './state/reducer';
import { RegistreringStateProvider } from './state/registreringStateProvider';

import * as RegistreringContext from './state/registreringContext';
import './registrering.css';

const Registrering = props => {
  const [behandlingID, setBehandlingID] = React.useState(-1);
  const [oppfriskDialog, visOppfriskDialog] = React.useState(false);
  const [henleggDialog, visHenleggDialog] = React.useState(false);

  const lastInnSaksopplysninger = async () => {
    const { match, location } = props;
    const { snr } = match.params;
    const _behandlingID = Utils.queryString.getParam(location, 'behandlingID');
    setBehandlingID(Utils._toInteger(_behandlingID));

    const {
      hentAvklartefakta, hentBehandling, hentFagsaker, hentLovvalgsperioder, hentSoknad,
    } = props;
    try {
      await Promise.all([
        hentBehandling(_behandlingID),
        hentFagsaker(snr),
        hentAvklartefakta(_behandlingID),
        hentSoknad(_behandlingID),
        hentLovvalgsperioder(_behandlingID),
      ]);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const avsluttSakSomBortfalt = () => {
    const { fagsak: { saksnummer } } = props;
    Api.Fagsaker.fagsak.bortfall(saksnummer).catch(err => Utils.logger.error(err));
    props.history.push('/');
  };

  const visOppfriskBekreftelse = () => {
    visOppfriskDialog(true);
  };
  const lagreOgLukk = async () => {
    this.lagreAllData();
    const { history, hentOppgaveOversikt } = props;
    await hentOppgaveOversikt();
    history.push('/');
  };
  const tilbakeleggHandle = async () => {
    const { tilbakeleggOppgave } = this.props;
    const venterPaaDokumentasjon = true;

    await tilbakeleggOppgave(behandlingID, venterPaaDokumentasjon);
    this.lagreOgLukk();
  };
  const visHenleggDialogHandle = () => {
    visHenleggDialog(true);
  };
  const navigerTilOversiktSide = () => {
    visOppfriskDialog(false);
    props.history.push('/');
  };
  React.useEffect(() => {
    lastInnSaksopplysninger();
  }, []);

  const {
    vurderingBegrunnelser, medlemskap, sed, redigerbart,
  } = props;
  console.log('oppfriskDialog', oppfriskDialog);
  console.log('henleggDialog', henleggDialog);
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
              avsluttSakSomBortfalt={avsluttSakSomBortfalt}
              oppfriskSaksopplysningerHandle={visOppfriskBekreftelse}
              lagreOgLukkHandle={lagreOgLukk}
              tilbakeleggeHandle={tilbakeleggHandle}
              visHenleggDialogHandle={visHenleggDialogHandle}
              tilForsidenHandle={navigerTilOversiktSide}
            />
            <SideDialog behandlingID={behandlingID} redigerbart={redigerbart} />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};
Registrering.propTypes = {
  hentAvklartefakta: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  hentOppgaveOversikt: PT.func.isRequired,
  hentSoknad: PT.func.isRequired,
  tilbakeleggOppgave: PT.func.isRequired,
  redigerbart: PT.bool,
  avklartefakta: MPT.AvklartefaktaListe,
  vurderingBegrunnelser: PT.object,
  fagsak: MPT.Fagsak,
  medlemskap: MPT.Medlemskap,
  oppsummering: MPT.Behandlinger.Oppsummering,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  soknad: MPT.Soknad,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
};
Registrering.defaultProps = {
  redigerbart: null,
  avklartefakta: [],
  fagsak: {},
  medlemskap: {},
  oppsummering: {},
  sed: {},
  soknad: {},
  vurderingBegrunnelser: {},
};
const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vurderingBegrunnelser: avklartefaktaSelectors.VurderingUnntakPeriode(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  sed: behandlingerSelectors.SEDSelector(state),
  soknad: soknadSelectors.SoknadSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentAvklartefakta: behandlingID => dispatch(avklartefaktaOperations.hent(behandlingID)),
  hentBehandling: behandlingID => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  hentLovvalgsperioder: behandlingID => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
  hentSoknad: behandlingID => dispatch(soknadOperations.hent(behandlingID)),
  tilbakeleggOppgave: (oppgaveID, venterPaaDokumentasjon) => oppgaverOperations.tilbakelegg(oppgaveID, venterPaaDokumentasjon),
  hentOppgaveOversikt: () => dispatch(oppgaverOperations.oversikt()),
});

const RegistreringStateProviderWrapper = props => (
  <RegistreringStateProvider initialState={initialState} reducer={reducer}>
    { RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(Registrering)(props) }
  </RegistreringStateProvider>
);

export default RegistreringStateProviderWrapper;
