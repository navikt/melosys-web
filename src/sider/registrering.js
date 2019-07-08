/* eslint no-alert:off, consistent-return:off */
import React from 'react';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as Utils from '../utils';
import Saksopplysninger from '../registrering-komponenter/saksopplysninger';
import SideDialog from '../soknad-komponenter/sideDialog/sideDialog';
import SideOppsummering from '../soknad-komponenter/sideOppsummering';

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
  const [saksnummer, setSaksnummer] = React.useState(-1);

  const lastInnSaksopplysninger = async () => {
    const { match, location } = props;
    const { snr } = match.params;
    setSaksnummer(Utils._toInteger(snr));
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
            {saksnummer !== -1 && <SideOppsummering snr={saksnummer} behandlingID={behandlingID} />}
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
