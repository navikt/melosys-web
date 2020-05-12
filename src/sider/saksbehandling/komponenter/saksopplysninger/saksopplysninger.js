import React, { Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import MKV from '../../../../melosyskodeverk';
import * as Utils from '../../../../utils';
import * as MPT from '../../../../proptypes';

import Stegvelger from '../../../../felleskomponenter/stegvelger';
import { STEG } from '../../../../felleskomponenter/stegvelger/stegMotor/typer';
import { HenlagtSak, AvslaattSoknad } from '../stegErstatter';
import Soknadpaneler from '../../../../felleskomponenter/soknadpaneler';

import { fagsakSelectors } from '../../../../ducks/fagsaker';
import { redigerbartSelectors } from '../../../../ducks/redigerbart';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import {
  behandlingsgrunnlagOperations,
  behandlingsgrunnlagSelectors,
} from '../../../../ducks/behandlingsgrunnlag';

import { avklartefaktaSelectors } from '../../../../ducks/avklartefakta';
import { behandlingsresultatSelectors } from '../../../../ducks/behandlingsresultat';
import { formSelectors } from '../../../../ducks/form';

import { stegMap } from '../../stegMap';

const hentForsteSteg = behandlingstype => {
  switch (behandlingstype) {
    case MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE:
      return STEG.ENDRET_PERIODE;
    default:
      return STEG.INNGANG;
  }
};

const Saksopplysninger = ({
  behandlingstype,
  redigerbart,
  behandlingID,
  soknadForm,
  behandlingsgrunnlag,
  behandlingsresultat,
  fagsakStatusKode,
  tilForsiden,
  lagreVilkarHandler,
  lagreAvklartefaktaHandler,
  lagreLovvalgsperioderHandler,
  lagreAnmodningsperioderHandler,
  oppdaterOgLagreBehandlingerHandler,
  lagreAllData,
  oppdaterBehandlingsgrunnlag,
  startOgVisOppfriskModal,
}) => {
  if (Utils._isNil(redigerbart)) return null;

  if (!behandlingID) {
    return null;
  }

  const erHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
  const erAvslaattSoknad = behandlingsresultat.behandlingsresultatTypeKode === MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL;
  const visAvslaattSoknad = erAvslaattSoknad && !erHenlagtSak;
  const behandlingsgrunnlagErKlart = !(Object.keys(soknadForm).length === 0 || Object.keys(behandlingsgrunnlag).length === 0);
  const visStegVelger = !erHenlagtSak && !erAvslaattSoknad && behandlingsgrunnlagErKlart;
  const forsteSteg = hentForsteSteg(behandlingstype);

  return (
    <Fragment>
      { erHenlagtSak &&
      <HenlagtSak behandlingsresultat={behandlingsresultat} />
      }
      {
        visAvslaattSoknad &&
        <AvslaattSoknad behandlingsresultat={behandlingsresultat} />
      }
      { visStegVelger &&
      <Stegvelger
        behandlingID={behandlingID}
        lagreVilkarHandler={lagreVilkarHandler}
        lagreAvklartefaktaHandler={lagreAvklartefaktaHandler}
        lagreLovvalgsperioderHandler={lagreLovvalgsperioderHandler}
        lagreAnmodningsperioderHandler={lagreAnmodningsperioderHandler}
        oppdaterOgLagreBehandlingerHandler={oppdaterOgLagreBehandlingerHandler}
        lagreAllData={lagreAllData}
        oppdaterLokalSoknadHandler={oppdaterBehandlingsgrunnlag}
        begrunnelser={MKV.KTObjects.begrunnelser}
        landkoder={MKV.KTObjects.landkoder}
        tilForsiden={tilForsiden}
        stegMap={stegMap}
        forsteSteg={forsteSteg}
      />
      }
      <Soknadpaneler
        startOgVisOppfriskModal={startOgVisOppfriskModal}
        behandlingID={behandlingID}
      />
    </Fragment>
  );
};

Saksopplysninger.propTypes = {
  behandlingstype: PT.string.isRequired,
  redigerbart: PT.bool,
  behandlingID: PT.number.isRequired,
  alleRelevantePersoner: PT.arrayOf(MPT.Behandlinger.Saksopplysninger.Person),
  avklartefakta: MPT.AvklartefaktaListe.isRequired,
  behandlingsresultat: MPT.Behandlingsresultat.isRequired,
  fagsakStatusKode: PT.string.isRequired,
  match: PT.object.isRequired,
  oppdaterBehandlingsgrunnlag: PT.func.isRequired,
  sendBehandlingsgrunnlag: PT.func.isRequired,
  behandlingsgrunnlag: MPT.Behandlingsgrunnlag,
  soknadForm: PT.object.isRequired,
  inngangForm: PT.object,
  vurdering: PT.object,
  syncErrors: PT.object,
  lagreVilkarHandler: PT.func.isRequired,
  lagreAvklartefaktaHandler: PT.func.isRequired,
  lagreLovvalgsperioderHandler: PT.func.isRequired,
  lagreAnmodningsperioderHandler: PT.func.isRequired,
  oppdaterOgLagreBehandlingerHandler: PT.func.isRequired,
  lagreAllData: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  visValideringModalDialogHandle: PT.func.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
};

Saksopplysninger.defaultProps = {
  redigerbart: null,
  alleRelevantePersoner: [],
  behandlingsgrunnlag: {},
  vurdering: {},
  syncErrors: {},
  inngangForm: {},
};

const mapStateToProps = state => ({
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  behandlingsresultat: behandlingsresultatSelectors.BehandlingsresultatSelector(state),
  behandlingsgrunnlag: behandlingsgrunnlagSelectors.BehandlingsgrunnlagDataSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
});

const mapDispatchToProps = dispatch => ({
  sendBehandlingsgrunnlag: (bid, dokument) => dispatch(behandlingsgrunnlagOperations.send(bid, dokument)),
  oppdaterBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.oppdaterState()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
