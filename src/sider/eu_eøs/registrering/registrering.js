/* eslint no-alert:off, consistent-return:off */
import React, { useEffect } from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import MKV from "../../../melosyskodeverk";
import * as Utils from "../../../utils";
import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";

import Informasjonlinje from "../../../felleskomponenter/informasjonlinje";
import SideDialog, { defaultFaner, fanerUtenBucOgSed } from "../../../felleskomponenter/sideDialog";
import Oppsummering from "../../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../../felleskomponenter/saksoversiktLenke";

import { fagsakOperations, fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";
import { avklartefaktaOperations, avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { dokumenterSelectors } from "../../../ducks/dokumenter";

import "./registrering.css";

export const Registrering = ({
  match: {
    params: { snr: saksnummer },
  },
  tilForsiden,
  location,
  hentAvklartefakta,
  hentBehandling,
  hentFagsaker,
  hentLovvalgsperioder,
  vurderingBegrunnelser,
  hovedpartRolle,
  sed,
  redigerbart,
  Saksopplysninger,
  fagsak,
  oppsummering,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  lovvalgsland,
  visOppfriskModal,
  behandlingOppfriskes,
  dokumentOversikt,
  dokumenter,
  startOgVisOppfriskModal,
  resetFagsakState,
}) => {
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));
  const [saksopplysningerErHentet, setSaksopplysningerErHentet] = React.useState(false);

  const lastInnSaksopplysninger = async () => {
    await Promise.all([
      hentBehandling(behandlingID),
      hentFagsaker(saksnummer),
      hentAvklartefakta(behandlingID),
      hentLovvalgsperioder(behandlingID),
    ]);

    setSaksopplysningerErHentet(true);
  };

  useEffect(() => {
    lastInnSaksopplysninger();

    if (behandlingOppfriskes) {
      visOppfriskModal();
    }

    return () => resetFagsakState();
  }, []);

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID) return null;
  if (!saksopplysningerErHentet) return null;

  const hovedpartErVirksomhet = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;

  return (
    <>
      <Informasjonlinje />
      <div id="main-container" className="main-container">
        <div className="registrering">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="7">
                {!hovedpartErVirksomhet ? (
                  <Saksopplysninger
                    redigerbart={redigerbart}
                    behandlingID={behandlingID}
                    saksnummer={saksnummer}
                    sed={sed}
                    vurderingBegrunnelser={vurderingBegrunnelser}
                    tilForsiden={tilForsiden}
                    startOgVisOppfriskModal={startOgVisOppfriskModal}
                  />
                ) : (
                  <Nav.AlertStripeInfo className="infostripe">
                    Behandlingen er journalført på virksomhet
                  </Nav.AlertStripeInfo>
                )}
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  oppsummering={oppsummering}
                  fagsak={fagsak}
                  lovvalgsland={lovvalgsland}
                  lovvalgsperiodeFom={lovvalgsperiodeFom}
                  lovvalgsperiodeTom={lovvalgsperiodeTom}
                />
                <SaksoversiktLenke />
                <SideDialog
                  saksnummer={saksnummer}
                  behandlingID={behandlingID}
                  redigerbart={redigerbart}
                  dokumentOversikt={dokumentOversikt}
                  dokumenter={dokumenter}
                  faner={hovedpartErVirksomhet ? fanerUtenBucOgSed : defaultFaner}
                />
              </Nav.Column>
            </Nav.Row>
          </Nav.Container>
        </div>
      </div>
    </>
  );
};
Registrering.propTypes = {
  Saksopplysninger: PT.oneOfType([PT.object, PT.func]).isRequired,
  hentAvklartefakta: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  redigerbart: PT.bool,
  avklartefakta: MPT.AvklartefaktaListe,
  vurderingBegrunnelser: PT.arrayOf(PT.string),
  fagsak: MPT.Fagsak,
  lovvalgsperioder: PT.array.isRequired, // TODO lag proptype
  oppsummering: MPT.Behandlinger.Oppsummering,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  tilForsiden: PT.func.isRequired,
  lovvalgsland: MPT.Kodeverk.isRequired,
  visOppfriskModal: PT.func.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  hovedpartRolle: PT.string.isRequired,
  dokumentOversikt: PT.array.isRequired,
  dokumenter: PT.array.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
};
Registrering.defaultProps = {
  redigerbart: null,
  avklartefakta: [],
  fagsak: {},
  oppsummering: {},
  sed: {},
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
  vurderingBegrunnelser: [],
};
const mapStateToProps = (state) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  hovedpartRolle: fagsakSelectors.HovedpartRolleSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vurderingBegrunnelser: behandlingsresultatSelectors.KontrollresultatBegrunnelseKoderSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  sed: behandlingerSelectors.SEDSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
  lovvalgsland: behandlingerSelectors.LovvalgslandSelector(state),
  dokumenter: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
  dokumentOversikt: dokumenterSelectors.DokumentOversiktSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  hentAvklartefakta: (behandlingID) => dispatch(avklartefaktaOperations.hent(behandlingID)),
  hentBehandling: (behandlingID) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentFagsaker: (saksnummer) => dispatch(fagsakOperations.hent(saksnummer)),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  hentLovvalgsperioder: (behandlingID) => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Registrering);
