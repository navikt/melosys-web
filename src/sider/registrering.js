/* eslint no-alert:off, consistent-return:off */
import React from 'react';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as Utils from '../utils';
import Saksopplysninger from '../registrering-komponenter/saksopplysninger';
import SideDialog from '../soknad-komponenter/sideDialog/sideDialog';
import SideOppsummering from '../registrering-komponenter/sideOppsummering';
import { behandlingerOperations, behandlingerSelectors } from '../ducks/behandlinger';
import { fagsakOperations, fagsakSelectors } from '../ducks/fagsaker';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../ducks/avklartefakta';

import './registrering.css';
import { lovvalgsperioderOperations } from '../ducks/lovvalgsperioder';
import { RegistreringStateProvider } from '../registrering-komponenter/state/registreringStateProvider';
import * as RegistreringContext from '../registrering-komponenter/state/registreringContext';
import { initialState, reducer } from '../registrering-komponenter/state/reducer';

const Registrering = props => {
  const [behandlingID, setBehandlingID] = React.useState(-1);

  const lastInnSaksopplysninger = async () => {
    const { match, location } = props;
    const { snr } = match.params;
    const _behandlingID = Utils.queryString.getParam(location, 'behandlingID');
    setBehandlingID(Utils._toInteger(_behandlingID));

    const {
      hentAvklartefakta, hentBehandling, hentFagsaker, hentLovvalgsperioder,
    } = props;
    try {
      await Promise.all([
        hentFagsaker(snr),
        hentBehandling(_behandlingID),
        hentAvklartefakta(_behandlingID),
        hentLovvalgsperioder(_behandlingID),
      ]);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const avsluttSakSomBortfalt = () => {
    // const { fagsak: { saksnummer } } = this.props;
    // Api.Fagsaker.bortfall(saksnummer).catch(err => Utils.logger.error(err));
    this.props.history.push('/');
  };

  const visOppfriskBekreftelse = () => {
    // TODO this.setState({ visOppfriskDialog: true });
  };
  const lagreOgLukk = async () => {
    // this.lagreAllData();
    // const { history, hentOppgaveOversikt } = this.props;
    // await hentOppgaveOversikt();
    // history.push('/');
  };
  const tilbakeleggeHandle = async () => {
    /*
    const { behandlingID } = this.state;
    const { tilbakeleggeOppgave } = this.props;
    const venterPaaDokumentasjon = true;

    await tilbakeleggeOppgave(behandlingID, venterPaaDokumentasjon);
    this.lagreOgLukk();
    */
  };
  const visHenleggDialog = () => {
    // this.setState({ visHenleggDialog: true });
  };
  const navigerTilOversiktSide = () => {
    // this.skjulOppfriskBekreftelse();
    // this.props.history.push('/');
  };
  React.useEffect(() => {
    lastInnSaksopplysninger();
  }, []);

  const { vurderingBegrunnelser, medlemskap, sed } = props;
  return (
    <div className="registrering">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            <Saksopplysninger
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
              tilbakeleggeHandle={tilbakeleggeHandle}
              visHenleggDialogHandle={visHenleggDialog}
              tilForsidenHandle={navigerTilOversiktSide}
            />
            <SideDialog behandlingID={behandlingID} />
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
  redigerbart: PT.bool,
  avklartefakta: MPT.AvklartefaktaListe,
  vurderingBegrunnelser: PT.object,
  fagsak: MPT.Fagsak,
  medlemskap: MPT.Medlemskap,
  oppsummering: MPT.Behandlinger.Oppsummering,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
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
});

const mapDispatchToProps = dispatch => ({
  hentAvklartefakta: behandlingID => dispatch(avklartefaktaOperations.hent(behandlingID)),
  hentBehandling: behandlingID => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  hentLovvalgsperioder: behandlingID => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
});

const RegistreringStateProviderWrapper = props => (
  <RegistreringStateProvider initialState={initialState} reducer={reducer}>
    { RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(Registrering)(props) }
  </RegistreringStateProvider>
);

export default RegistreringStateProviderWrapper;
