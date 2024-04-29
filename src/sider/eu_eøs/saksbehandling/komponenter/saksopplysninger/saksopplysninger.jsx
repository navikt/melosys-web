import { Fragment } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import MKV from "../../../../../melosyskodeverk";
import * as Utils from "../../../../../utils";
import * as MPT from "../../../../../proptypes";

import Stegvelger, { STEG } from "../../../../../felleskomponenter/stegvelger";
import { AvslaattPgaManglendeOpplysninger, HenlagtSak } from "../stegErstatter";
import { SoknadMenypanelForm } from "../../../../../felleskomponenter/menypanelForm";

import { fagsakSelectors } from "../../../../../ducks/fagsaker";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import {
  mottatteOpplysningerOperations,
  mottatteOpplysningerSelectors,
} from "../../../../../ducks/mottatteOpplysninger";
import { anmodningsperioderSelectors } from "../../../../../ducks/anmodningsperioder";

import { avklartefaktaSelectors } from "../../../../../ducks/avklartefakta";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { formSelectors } from "../../../../../ducks/form";

import { stegMap } from "../../stegMap";

const hentForsteSteg = (behandlingstype) => {
  switch (behandlingstype) {
    case MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE:
      return STEG.ENDRET_PERIODE;
    default:
      return STEG.INNGANG;
  }
};

const Saksopplysninger = ({
  behandlingstype,
  behandlingOppfriskes,
  redigerbart,
  behandlingID,
  soknadForm,
  mottatteOpplysninger,
  behandlingsresultatType,
  fagsakStatusKode,
  tilForsiden,
  lagreVilkarHandler,
  lagreAvklartefaktaHandler,
  lagreLovvalgsperioderHandler,
  lagreAnmodningsperioderHandler,
  oppdaterOgLagreBehandlingerHandler,
  startOgVisOppfriskModal,
  anmodningsperioderErSendtUtlandet,
}) => {
  if (Utils._isNil(redigerbart)) return null;

  if (!behandlingID || behandlingID < 0) {
    return null;
  }

  const erHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
  const erAvslåttPgaManglendeOpplysninger =
    behandlingsresultatType === MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL;
  const visAvslåttPgaManglendeOpplysninger = erAvslåttPgaManglendeOpplysninger && !erHenlagtSak;
  const mottatteOpplysningerErKlart = !(
    Object.keys(soknadForm).length === 0 || Object.keys(mottatteOpplysninger).length === 0
  );
  const visStegVelger = !erHenlagtSak && !erAvslåttPgaManglendeOpplysninger && mottatteOpplysningerErKlart;
  const forsteSteg = hentForsteSteg(behandlingstype);

  const visOppdaterRegisteropplysninger =
    behandlingstype !== MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE && !anmodningsperioderErSendtUtlandet;

  return (
    <Fragment>
      <main id="main-container">
        {erHenlagtSak && <HenlagtSak />}
        {visAvslåttPgaManglendeOpplysninger && <AvslaattPgaManglendeOpplysninger />}
        {visStegVelger && (
          <Stegvelger
            behandlingID={behandlingID}
            behandlingOppfriskes={behandlingOppfriskes}
            lagreVilkarHandler={lagreVilkarHandler}
            lagreAvklartefaktaHandler={lagreAvklartefaktaHandler}
            lagreLovvalgsperioderHandler={lagreLovvalgsperioderHandler}
            lagreAnmodningsperioderHandler={lagreAnmodningsperioderHandler}
            oppdaterOgLagreBehandlingerHandler={oppdaterOgLagreBehandlingerHandler}
            begrunnelser={MKV.KTObjects.begrunnelser}
            landkoder={MKV.KTObjects.landkoder}
            tilForsiden={tilForsiden}
            stegMap={stegMap}
            forsteSteg={forsteSteg}
          />
        )}
      </main>
      <SoknadMenypanelForm
        startOgVisOppfriskModal={startOgVisOppfriskModal}
        visOppdaterRegisteropplysninger={visOppdaterRegisteropplysninger}
      />
    </Fragment>
  );
};

Saksopplysninger.propTypes = {
  behandlingstype: PT.string.isRequired,
  redigerbart: PT.bool,
  behandlingID: PT.number.isRequired,
  avklartefakta: MPT.AvklartefaktaListe.isRequired,
  behandlingsresultatType: PT.string.isRequired,
  fagsakStatusKode: PT.string.isRequired,
  match: PT.object.isRequired,
  sendMottatteOpplysninger: PT.func.isRequired,
  mottatteOpplysninger: MPT.MottatteOpplysninger,
  soknadForm: PT.object.isRequired,
  inngangForm: PT.object,
  vurdering: PT.object,
  syncErrors: PT.object,
  lagreVilkarHandler: PT.func.isRequired,
  lagreAvklartefaktaHandler: PT.func.isRequired,
  lagreLovvalgsperioderHandler: PT.func.isRequired,
  lagreAnmodningsperioderHandler: PT.func.isRequired,
  oppdaterOgLagreBehandlingerHandler: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  anmodningsperioderErSendtUtlandet: PT.bool.isRequired,
  behandlingOppfriskes: PT.bool,
};

Saksopplysninger.defaultProps = {
  redigerbart: null,
  mottatteOpplysninger: {},
  vurdering: {},
  syncErrors: {},
  inngangForm: {},
  behandlingOppfriskes: false,
};

const mapStateToProps = (state) => ({
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  behandlingsresultatType: behandlingsresultatSelectors.BehandlingsresultatTypeSelector(state),
  mottatteOpplysninger: mottatteOpplysningerSelectors.MottatteOpplysningerDataSelector(state),
  soknadForm: formSelectors.SoknadFormSelector(state),
  anmodningsperioderErSendtUtlandet: anmodningsperioderSelectors.AnmodningsperioderErSendtUtlandetSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  sendMottatteOpplysninger: (bid, dokument) => dispatch(mottatteOpplysningerOperations.send(bid, dokument)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
