import { useEffect } from "react";
import { connect } from "react-redux";
import PT from "prop-types";
import { getFormValues } from "redux-form";

import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import * as MPT from "../../../proptypes";
import * as KV from "../../../kodeverk";

import Informasjonlinje from "../../../felleskomponenter/informasjonlinje";
import SideDialog, { defaultFaner, fanerUtenBucOgSed } from "../../../felleskomponenter/sideDialog";
import Oppsummering from "../../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../../felleskomponenter/saksoversiktLenke";
import Stegvelger, { STEG } from "../../../felleskomponenter/stegvelger";
import { SoknadMenypanelForm } from "../../../felleskomponenter/menypanelForm";
import { VirksomhetMelding } from "../../../felleskomponenter/alertmeldinger";

import { formSelectors } from "../../../ducks/form";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { datalastingOperations } from "../../../ducks/datalasting";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { vilkarOperations } from "../../../ducks/vilkar";
import { avklartefaktaOperations, avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { anmodningsperioderOperations } from "../../../ducks/anmodningsperioder";
import { lovvalgsperioderOperations } from "../../../ducks/lovvalgsperioder";
import { behandlingsperioderOperations } from "../../../ducks/behandlingsperioder";
import { landkoderOperations } from "../../../ducks/landkoder";

import stegMap from "./stegMap";
import "./vurderutpeking.css";

const hentForsteSteg = (behandlingstema) => {
  switch (behandlingstema) {
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND:
      return STEG.VURDER_UTPEKING;
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE:
    default:
      return STEG.INNGANG;
  }
};

const Vurderutpeking = ({
  match: {
    params: { saksnr: saksnummer },
  },
  lastInnSaksopplysninger,
  location,
  behandlingstema,
  hovedpartRolle,
  redigerbart,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  arbeidsland,
  mottatteOpplysningerPeriodeFom,
  mottatteOpplysningerPeriodeTom,
  resetSaksopplysninger,
  lagreVilkar,
  lagreAvklartefakta,
  lagreLovvalgsperioder,
  lagreAnmodningsperioder,
  oppdaterOgLagreBehandlingsperioder,
  tilForsiden,
  startOgVisOppfriskModal,
  soknadForm,
  mottatteOpplysninger,
  vurderUtpekingFormValues,
  hentLandkoder,
}) => {
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));

  useEffect(() => {
    lastInnSaksopplysninger(saksnummer, behandlingID);
    hentLandkoder();

    return () => {
      resetSaksopplysninger();
    };
  }, []);

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID) return null;
  if (!behandlingstema) return null;

  const mottatteOpplysningerErKlart = !(
    Object.keys(soknadForm).length === 0 || Object.keys(mottatteOpplysninger).length === 0
  );

  const forsteSteg = hentForsteSteg(behandlingstema);

  const lovvalgslandFraForm = vurderUtpekingFormValues.lovvalgsland;
  const visLovvalgsland = lovvalgslandFraForm && lovvalgslandFraForm !== MKV.Koder.landkoder.NO;
  const lovvalgslandKTOBject = visLovvalgsland
    ? KV.kodeTilObjekt(lovvalgslandFraForm, MKV.KTObjects.landkoder)
    : undefined;

  const hovedpartErVirksomhet = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;

  return (
    <>
      <Informasjonlinje />
      <div id="main-container" className="main-container">
        <div className="vurderutpeking">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="7">
                {hovedpartErVirksomhet ? (
                  <VirksomhetMelding />
                ) : (
                  <>
                    {mottatteOpplysningerErKlart && (
                      <Stegvelger
                        behandlingID={behandlingID}
                        stegMap={stegMap}
                        lagreVilkarHandler={lagreVilkar}
                        lagreAvklartefaktaHandler={lagreAvklartefakta}
                        lagreLovvalgsperioderHandler={lagreLovvalgsperioder}
                        lagreAnmodningsperioderHandler={lagreAnmodningsperioder}
                        oppdaterOgLagreBehandlingerHandler={oppdaterOgLagreBehandlingsperioder}
                        begrunnelser={MKV.KTObjects.begrunnelser}
                        landkoder={MKV.KTObjects.landkoder}
                        tilForsiden={tilForsiden}
                        forsteSteg={forsteSteg}
                      />
                    )}
                    <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
                  </>
                )}
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  arbeidsland={arbeidsland}
                  lovvalgsland={lovvalgslandKTOBject}
                  lovvalgsperiodeFom={lovvalgsperiodeFom}
                  lovvalgsperiodeTom={lovvalgsperiodeTom}
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

Vurderutpeking.propTypes = {
  lastInnSaksopplysninger: PT.func.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  behandlingstema: PT.string.isRequired,
  hovedpartRolle: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  lovvalgsperiodeFom: PT.string.isRequired,
  lovvalgsperiodeTom: PT.string.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  mottatteOpplysningerPeriodeFom: PT.string.isRequired,
  mottatteOpplysningerPeriodeTom: PT.string.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  resetSaksopplysninger: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  lagreVilkar: PT.func.isRequired,
  lagreAvklartefakta: PT.func.isRequired,
  lagreLovvalgsperioder: PT.func.isRequired,
  lagreAnmodningsperioder: PT.func.isRequired,
  oppdaterOgLagreBehandlingsperioder: PT.func.isRequired,
  mottatteOpplysninger: MPT.MottatteOpplysninger,
  soknadForm: PT.object.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  vurderUtpekingFormValues: PT.object,
  hentLandkoder: PT.func.isRequired,
};

Vurderutpeking.defaultProps = {
  mottatteOpplysninger: {},
  vurderUtpekingFormValues: {},
};

const mapStateToProps = (state) => ({
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  hovedpartRolle: fagsakSelectors.HovedpartRolleSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  mottatteOpplysningerPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeSelector(state).fom
  ),
  mottatteOpplysningerPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeSelector(state).tom
  ),
  mottatteOpplysninger: mottatteOpplysningerSelectors.MottatteOpplysningerDataSelector(state),
  soknadForm: formSelectors.SoknadFormSelector(state),
  vurderUtpekingFormValues: getFormValues(KV.Form.VURDER_UTPEKING)(state),
});

const mapDispatchToProps = (dispatch) => ({
  lastInnSaksopplysninger: (saksnummer, behandlingID) =>
    dispatch(datalastingOperations.lastInnSaksopplysninger(MKV.Koder.sakstyper.EU_EOS, saksnummer, behandlingID)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
  lagreVilkar: () => dispatch(vilkarOperations.lagre()),
  lagreAvklartefakta: () => dispatch(avklartefaktaOperations.lagre()),
  lagreLovvalgsperioder: () => dispatch(lovvalgsperioderOperations.lagre()),
  lagreAnmodningsperioder: () => dispatch(anmodningsperioderOperations.lagre()),
  oppdaterOgLagreBehandlingsperioder: () => dispatch(behandlingsperioderOperations.oppdaterOgLagre()),
  hentLandkoder: () => dispatch(landkoderOperations.hentLandkoder()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Vurderutpeking);
