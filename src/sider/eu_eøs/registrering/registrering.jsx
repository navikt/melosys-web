/* eslint no-alert:off, consistent-return:off */
import { useEffect, useState } from "react";
import PT from "prop-types";
import { connect, useDispatch } from "react-redux";

import MKV from "../../../melosyskodeverk";
import * as Utils from "../../../utils";
import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";

import Informasjonlinje from "../../../felleskomponenter/informasjonlinje";
import SideDialog, { defaultTabs, tabsUtenBucOgSed } from "../../../felleskomponenter/sideDialog";
import Oppsummering from "../../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../../felleskomponenter/saksoversiktLenke";
import { Innsynsmelding, VirksomhetMelding } from "../../../felleskomponenter/alertmeldinger";

import { fagsakOperations, fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";
import { avklartefaktaOperations, avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { redigerbartSelectors } from "../../../ducks/redigerbart";

import "./registrering.css";

export function Registrering({
  match: {
    params: { saksnr: saksnummer },
  },
  tilForsiden,
  location,
  hentAvklartefakta,
  hentBehandling,
  hentFagsaker,
  hentLovvalgsperioder,
  vurderingBegrunnelser = [],
  hovedpartRolle,
  sed = {},
  redigerbart = null,
  Saksopplysninger,
  lovvalgsperiodeFom = undefined,
  lovvalgsperiodeTom = undefined,
  lovvalgsland,
  visOppfriskModal,
  behandlingOppfriskes,
  startOgVisOppfriskModal,
}) {
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));
  const dispatch = useDispatch();
  const [saksopplysningerErHentet, setSaksopplysningerErHentet] = useState(false);

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

    return () => {
      dispatch(behandlingerOperations.resetBehandlingerState());
      dispatch(fagsakOperations.resetFagsakState());
      dispatch(avklartefaktaOperations.resetAvklartefaktaState());
      dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState());
    };
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
                {!redigerbart && <Innsynsmelding />}
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
                  <VirksomhetMelding />
                )}
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  lovvalgsland={lovvalgsland}
                  lovvalgsperiodeFom={lovvalgsperiodeFom}
                  lovvalgsperiodeTom={lovvalgsperiodeTom}
                />
                <SaksoversiktLenke />
                <SideDialog tabs={hovedpartErVirksomhet ? tabsUtenBucOgSed : defaultTabs} />
              </Nav.Column>
            </Nav.Row>
          </Nav.Container>
        </div>
      </div>
    </>
  );
}
Registrering.propTypes = {
  Saksopplysninger: PT.oneOfType([PT.object, PT.func]).isRequired,
  hentAvklartefakta: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  redigerbart: PT.bool,
  vurderingBegrunnelser: PT.arrayOf(PT.string),
  lovvalgsperioder: PT.array.isRequired, // TODO lag proptype
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
  startOgVisOppfriskModal: PT.func.isRequired,
};
const mapStateToProps = (state) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  hovedpartRolle: fagsakSelectors.HovedpartRolleSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vurderingBegrunnelser: behandlingsresultatSelectors.KontrollresultatBegrunnelseKoderSelector(state),
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  sed: behandlingerSelectors.SEDSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
  lovvalgsland: behandlingerSelectors.LovvalgslandSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  hentAvklartefakta: (behandlingID) => dispatch(avklartefaktaOperations.hent(behandlingID)),
  hentBehandling: (behandlingID) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentFagsaker: (saksnummer) => dispatch(fagsakOperations.hent(saksnummer)),
  hentLovvalgsperioder: (behandlingID) => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Registrering);
