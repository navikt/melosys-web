import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PT from "prop-types";
import { withRouter } from "react-router-dom";

import MKV from "../../../melosyskodeverk";

import * as Utils from "../../../utils";
import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";
import * as API from "../../../services/api";

import Informasjonlinje from "../../../felleskomponenter/informasjonlinje";
import SideDialog, { defaultFaner, fanerUtenBucOgSed } from "../../../felleskomponenter/sideDialog";
import Oppsummering from "../../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../../felleskomponenter/saksoversiktLenke";
import Stegvelger, { STEG } from "../../../felleskomponenter/stegvelger";
import { SoknadMenypanelForm } from "../../../felleskomponenter/menypanelForm";
import { VirksomhetMelding } from "../../../felleskomponenter/alertmeldinger";
import { useFeatureToggle } from "../../../featuretoggle";

import { fagsakOperations, fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingsresultatOperations, behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";
import { avklartefaktaOperations } from "../../../ducks/avklartefakta";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { dokumenterOperations } from "../../../ducks/dokumenter";
import { formSelectors } from "../../../ducks/form";
import { menypanelOperations } from "../../../ducks/menypanel";
import { folketrygdenkodeverkOperations } from "../../../ducks/folketrygdenkodeverk";
import { oppsummertfaktaOperations } from "../../../ducks/oppsummertfakta";
import { vilkarOperations } from "../../../ducks/vilkar";
import { landkoderOperations, landkoderSelectors } from "../../../ducks/landkoder";
import { medlemskapsperioderOperations } from "../../../ducks/medlemskapsperioder";
import { feiletResponsOperations } from "../../../ducks/feiletRespons";

import { AvslaattSoknad, HenlagtSak } from "../../eu_eøs/saksbehandling/komponenter/stegErstatter";
import { stegMap } from "./stegMap";
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
  hentFagsaker,
  hentFolketrygdenKodeverk,
  hentLandkoder,
  hentMedlemskapsperioder,
  hentOppsummertFakta,
  lagreAvklartefakta,
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
  lagreVilkar,
  landkoder,
  location,
  match,
  redigerbart,
  resetBehandlingerState,
  resetMottatteOpplysningerState,
  resetFagsakState,
  resetVilkarState,
  resetOppsummertFaktaState,
  resetMedlemskapsperiodeState,
  skjulMenypanel,
  soknadForm,
  startOgVisOppfriskModal,
  tilForsiden,
  visOppfriskModal,
  resetFeiletrespons,
}) => {
  const [behandlingID, setBehandlingID] = useState(-1);
  const [bestemmelser, setBestemmelser] = useState([]);
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);
  const folketrygdenToggle = useFeatureToggle("melosys.folketrygden.mvp");

  const oppdaterBehandlingIDState = () => {
    const behandlingIDFraParam = Utils.queryString.getParam(location, "behandlingID");

    if (Utils._toInteger(behandlingIDFraParam) !== behandlingID) {
      setBehandlingID(Utils._toInteger(behandlingIDFraParam));
    }
  };

  const lastInnSaksopplysninger = async () => {
    const { saksnr } = match.params;
    const behandlingIDFraParam = Utils.queryString.getParam(location, "behandlingID");
    setBehandlingID(Utils._toInteger(behandlingIDFraParam));

    try {
      await hentFagsaker(saksnr);
      await hentFolketrygdenKodeverk();
      await hentOppsummertFakta(behandlingIDFraParam);
      const response = await hentBehandling(behandlingIDFraParam);
      const behandling = response.data;
      if (!behandling) return false;

      await hentBehandlingsresultat(behandlingIDFraParam);

      // Sjekk om saken er iferd under oppdatering
      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      const bestemmelserResponse = await API.Medlemskapsperioder.hentBestemmelserMedVilkår();
      bestemmelserResponse
        .sort((a, b) => b.bestemmelse.localeCompare(a.bestemmelse))
        .forEach((bestemmelse) => bestemmelse.vilkårOgBegrunnelser.sort((a, b) => a.vilkaar.localeCompare(b.vilkaar)));
      setBestemmelser(bestemmelserResponse);
      await hentMedlemskapsperioder(behandlingIDFraParam);
      await hentMottatteOpplysninger(behandlingIDFraParam);
      await hentDokumentOversikt(saksnr);
      setSaksopplysningerLastet(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    lastInnSaksopplysninger();
    hentLandkoder();

    return () => {
      resetFagsakState();
      resetVilkarState();
      resetOppsummertFaktaState();
      resetMedlemskapsperiodeState();
      resetBehandlingerState();
      resetMottatteOpplysningerState();
      resetFeiletrespons();
      skjulMenypanel();
    };
  }, []);

  useEffect(() => {
    oppdaterBehandlingIDState();
  });

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID || behandlingID < 0) return null;
  if (!saksopplysningerLastet) return null;
  if (folketrygdenToggle === "fetching" || folketrygdenToggle === "disabled") return null;

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
        <div className="ftrl_saksbehandling">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="7">
                {!hovedpartErVirksomhet ? (
                  <>
                    {erHenlagtSak && <HenlagtSak behandlingsresultat={behandlingsresultat} />}
                    {visAvslaattSoknad && <AvslaattSoknad behandlingsresultat={behandlingsresultat} />}
                    {visStegVelger && (
                      <Stegvelger
                        annenBehandlingOppfriskes={annenBehandlingOppfriskes}
                        behandlingID={behandlingID}
                        lagreAvklartefaktaHandler={lagreAvklartefakta}
                        lagreMottatteOpplysningerOgOppfriskSaksopplysninger={
                          lagreMottatteOpplysningerOgOppfriskSaksopplysninger
                        }
                        lagreVilkarHandler={lagreVilkar}
                        begrunnelser={MKV.KTObjects.begrunnelser}
                        landkoder={landkoder}
                        bestemmelser={bestemmelser}
                        tilForsiden={tilForsiden}
                        stegMap={stegMap}
                        forsteSteg={STEG.START}
                        sakstype={MKV.Koder.sakstyper.FTRL}
                      />
                    )}
                  </>
                ) : (
                  <VirksomhetMelding />
                )}
                <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  arbeidsland={
                    landkoder && landkoder.filter((landkodeObjekt) => arbeidsland.includes(landkodeObjekt.kode))
                  }
                  lovvalgsperiodeFom={mottatteOpplysningerPeriodeFom}
                  lovvalgsperiodeTom={mottatteOpplysningerPeriodeTom}
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
  arbeidsland: PT.arrayOf(PT.string).isRequired,
  behandlingstype: PT.string.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  mottatteOpplysninger: MPT.MottatteOpplysninger,
  mottatteOpplysningerPeriodeFom: PT.string.isRequired,
  mottatteOpplysningerPeriodeTom: PT.string.isRequired,
  behandlingsresultat: MPT.Behandlingsresultat.isRequired,
  fagsakStatusKode: PT.string.isRequired,
  hovedpartRolle: PT.string.isRequired,
  history: PT.object.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  location: PT.object.isRequired,
  match: PT.object.isRequired,
  redigerbart: PT.bool,
  soknadForm: PT.object.isRequired,
  // Funcs
  hentBehandling: PT.func.isRequired,
  hentMottatteOpplysninger: PT.func.isRequired,
  hentBehandlingsresultat: PT.func.isRequired,
  hentDokumentOversikt: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  hentLandkoder: PT.func.isRequired,
  hentMedlemskapsperioder: PT.func.isRequired,
  hentOppsummertFakta: PT.func.isRequired,
  hentFolketrygdenKodeverk: PT.func.isRequired,
  lagreAvklartefakta: PT.func.isRequired,
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger: PT.func.isRequired,
  lagreVilkar: PT.func.isRequired,
  resetBehandlingerState: PT.func.isRequired,
  resetMottatteOpplysningerState: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  resetVilkarState: PT.func.isRequired,
  resetOppsummertFaktaState: PT.func.isRequired,
  resetMedlemskapsperiodeState: PT.func.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  skjulMenypanel: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  visOppfriskModal: PT.func.isRequired,
  resetFeiletrespons: PT.func.isRequired,
};

Saksbehandling.defaultProps = {
  mottatteOpplysninger: {},
  redigerbart: null,
};

const mapStateToProps = (state) => ({
  arbeidsland: mottatteOpplysningerSelectors.SoknadslandkoderSelector(state),
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
  fagsak: fagsakSelectors.FagsakSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  landkoder: landkoderSelectors.LandkoderFraSakstypeSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
  soknadForm: formSelectors.SoknadenFormSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  hentBehandling: (behandlingID) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentMottatteOpplysninger: (bid) => dispatch(mottatteOpplysningerOperations.hent(bid)),
  hentBehandlingsresultat: (bid) => dispatch(behandlingsresultatOperations.hent(bid)),
  hentDokumentOversikt: (saksnummer) => dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
  hentFagsaker: (saksnummer) => dispatch(fagsakOperations.hent(saksnummer)),
  hentFolketrygdenKodeverk: () => dispatch(folketrygdenkodeverkOperations.hentKodeverkForFolketrygden()),
  hentLandkoder: () => dispatch(landkoderOperations.hentLandkoder()),
  hentMedlemskapsperioder: (bid) => dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(bid)),
  hentOppsummertFakta: (bid) => dispatch(oppsummertfaktaOperations.hentOppsummertFakta(bid)),
  lagreAvklartefakta: () => dispatch(avklartefaktaOperations.lagre()),
  lagreVilkar: () => dispatch(vilkarOperations.lagre()),
  resetVilkarState: () => dispatch(vilkarOperations.resetState()),
  resetOppsummertFaktaState: () => dispatch(oppsummertfaktaOperations.resetOppsummertFakta()),
  resetMedlemskapsperiodeState: () => dispatch(medlemskapsperioderOperations.resetMedlemskapsperioder()),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetBehandlingerState: () => dispatch(behandlingerOperations.resetBehandlingerState()),
  resetMottatteOpplysningerState: () => dispatch(mottatteOpplysningerOperations.resetState()),
  skjulMenypanel: () => dispatch(menypanelOperations.skjulMenypanel()),
  resetFeiletrespons: () => dispatch(feiletResponsOperations.resetFeiletRespons()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
