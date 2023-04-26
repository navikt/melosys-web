import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PT from "prop-types";

import MKV from "../../melosyskodeverk";
import * as MPT from "../../proptypes";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import SideDialog, { defaultFaner, fanerUtenBucOgSed } from "../../felleskomponenter/sideDialog";
import { AvslaattSoknad, HenlagtSak } from "../eu_eøs/saksbehandling/komponenter/stegErstatter";
import Oppsummering from "../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../felleskomponenter/saksoversiktLenke";
import { SoknadMenypanelForm } from "../../felleskomponenter/menypanelForm";
import { VirksomhetMelding } from "../../felleskomponenter/alertmeldinger";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { behandlingsresultatOperations, behandlingsresultatSelectors } from "../../ducks/behandlingsresultat";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { dokumenterOperations } from "../../ducks/dokumenter";
import { fagsakOperations, fagsakSelectors } from "../../ducks/fagsaker";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../ducks/lovvalgsperioder";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { menypanelOperations } from "../../ducks/menypanel";
import { landkoderOperations } from "../../ducks/landkoder";
import { formSelectors } from "../../ducks/form";

import Stegvelger from "./stegvelger";
import "./saksbehandling.css";

const Saksbehandling = ({
  annenBehandlingOppfriskes,
  arbeidsland,
  behandlingstype,
  hovedpartRolle,
  behandlingOppfriskes,
  mottatteOpplysninger,
  mottatteOpplysningerPeriodeFom,
  mottatteOpplysningerPeriodeTom,
  behandlingsresultat,
  fagsakStatusKode,
  hentBehandling,
  hentMottatteOpplysninger,
  hentBehandlingsresultat,
  hentDokumentOversikt,
  hentLandkoder,
  hentLovvalgsperiode,
  hentFagsaker,
  location,
  match,
  oppfriskOgLastInnSaksopplysninger,
  redigerbart,
  resetBehandlingerState,
  resetMottatteOpplysningerState,
  resetFagsakState,
  skjulMenypanel,
  startOgVisOppfriskModal,
  soknadForm,
  tilForsiden,
  visOppfriskModal,
  lovvalgsperiodeTom,
}) => {
  const [behandlingID, setBehandlingID] = useState(-1);
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);
  const saksnummer = match?.params?.saksnr;

  const oppdaterBehandlingIDState = () => {
    const behandlingIDFraParam = Utils.queryString.getParam(location, "behandlingID");

    if (Utils._toInteger(behandlingIDFraParam) !== behandlingID) {
      setBehandlingID(Utils._toInteger(behandlingIDFraParam));
    }
  };

  const lastInnSaksopplysninger = async () => {
    const behandlingIDFraParam = Utils.queryString.getParam(location, "behandlingID");
    setBehandlingID(Utils._toInteger(behandlingIDFraParam));

    try {
      await hentFagsaker(saksnummer);
      const response = await hentBehandling(behandlingIDFraParam);
      const behandling = response.data;
      if (!behandling) return false;

      await hentBehandlingsresultat(behandlingIDFraParam);

      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      await hentMottatteOpplysninger(behandlingIDFraParam);
      await hentDokumentOversikt(saksnummer);
      await hentLovvalgsperiode(behandlingIDFraParam);
      setSaksopplysningerLastet(true);
      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    return false;
  };

  useEffect(() => {
    oppdaterBehandlingIDState();
  });

  useEffect(() => {
    lastInnSaksopplysninger();
    hentLandkoder();

    return () => {
      resetFagsakState();
      resetBehandlingerState();
      resetMottatteOpplysningerState();
      skjulMenypanel();
    };
  }, []);

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID || behandlingID < 0) return null;
  if (!saksopplysningerLastet) return null;

  const erHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const erAvslaattSoknad =
    behandlingsresultat.behandlingsresultatTypeKode ===
      MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL && !erNyVurdering;
  const visAvslaattSoknad = erAvslaattSoknad && !erHenlagtSak;
  const mottatteOpplysningerErKlart = !(
    Object.keys(soknadForm).length === 0 || Object.keys(mottatteOpplysninger).length === 0
  );
  const visStegVelger = !erHenlagtSak && !erAvslaattSoknad && mottatteOpplysningerErKlart;

  const hovedpartErVirksomhet = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;

  return (
    <>
      <Informasjonlinje />
      <div id="main-container" className="main-container">
        <div className="trygdeavtale_saksbehandling">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="7">
                {!hovedpartErVirksomhet ? (
                  <>
                    {erHenlagtSak && <HenlagtSak behandlingsresultat={behandlingsresultat} />}
                    {visAvslaattSoknad && <AvslaattSoknad behandlingsresultat={behandlingsresultat} />}
                    {visStegVelger && (
                      <Stegvelger
                        redigerbart={redigerbart}
                        annenBehandlingOppfriskes={annenBehandlingOppfriskes}
                        oppfriskOgLastInnSaksopplysninger={oppfriskOgLastInnSaksopplysninger}
                        tilForsiden={tilForsiden}
                      />
                    )}
                    <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
                  </>
                ) : (
                  <VirksomhetMelding />
                )}
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  arbeidsland={arbeidsland}
                  lovvalgsperiodeFom={mottatteOpplysningerPeriodeFom}
                  lovvalgsperiodeTom={lovvalgsperiodeTom || mottatteOpplysningerPeriodeTom}
                  mottatteOpplysningerPeriodeFom={mottatteOpplysningerPeriodeFom}
                  mottatteOpplysningerPeriodeTom={mottatteOpplysningerPeriodeTom}
                />
                <SaksoversiktLenke />
                <SideDialog faner={hovedpartErVirksomhet ? fanerUtenBucOgSed : defaultFaner} />
              </Nav.Column>
            </Nav.Row>
          </Nav.Container>
        </div>
      </div>
    </>
  );
};

Saksbehandling.propTypes = {
  annenBehandlingOppfriskes: PT.bool.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  behandlingstype: PT.string.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  mottatteOpplysninger: MPT.MottatteOpplysninger,
  mottatteOpplysningerPeriodeFom: PT.string.isRequired,
  mottatteOpplysningerPeriodeTom: PT.string.isRequired,
  behandlingsresultat: MPT.Behandlingsresultat.isRequired,
  fagsakStatusKode: PT.string.isRequired,
  hovedpartRolle: PT.string.isRequired,
  location: PT.object.isRequired,
  match: PT.object.isRequired,
  redigerbart: PT.bool,
  soknadForm: PT.object.isRequired,
  // Funcs
  hentBehandling: PT.func.isRequired,
  hentMottatteOpplysninger: PT.func.isRequired,
  hentBehandlingsresultat: PT.func.isRequired,
  hentDokumentOversikt: PT.func.isRequired,
  hentLandkoder: PT.func.isRequired,
  hentLovvalgsperiode: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  oppfriskOgLastInnSaksopplysninger: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  resetBehandlingerState: PT.func.isRequired,
  resetMottatteOpplysningerState: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  skjulMenypanel: PT.func.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  visOppfriskModal: PT.func.isRequired,
  lovvalgsperiodeTom: PT.string.isRequired,
};

Saksbehandling.defaultProps = {
  mottatteOpplysninger: {},
  redigerbart: null,
};

const mapStateToProps = (state) => ({
  arbeidsland: mottatteOpplysningerSelectors.SoknadslandKTSelector(state),
  hovedpartRolle: fagsakSelectors.HovedpartRolleSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  mottatteOpplysninger: mottatteOpplysningerSelectors.MottatteOpplysningerDataSelector(state),
  mottatteOpplysningerPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeSelector(state).fom
  ),
  mottatteOpplysningerPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeSelector(state).tom
  ),
  behandlingsresultat: behandlingsresultatSelectors.BehandlingsresultatSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state)),
});

const mapDispatchToProps = (dispatch) => ({
  hentBehandling: (bid) => dispatch(behandlingerOperations.hentBehandling(bid)),
  hentMottatteOpplysninger: (bid) => dispatch(mottatteOpplysningerOperations.hent(bid)),
  hentBehandlingsresultat: (bid) => dispatch(behandlingsresultatOperations.hent(bid)),
  hentDokumentOversikt: (saksnummer) => dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
  hentLandkoder: () => dispatch(landkoderOperations.hentLandkoder()),
  hentLovvalgsperiode: (bid) => dispatch(lovvalgsperioderOperations.hent(bid)),
  hentFagsaker: (saksnummer) => dispatch(fagsakOperations.hent(saksnummer)),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetBehandlingerState: () => dispatch(behandlingerOperations.resetBehandlingerState()),
  resetMottatteOpplysningerState: () => dispatch(mottatteOpplysningerOperations.resetState()),
  skjulMenypanel: () => dispatch(menypanelOperations.skjulMenypanel()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Saksbehandling);
