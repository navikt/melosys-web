import React, { Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import MKV from '../../../../melosyskodeverk';
import * as Utils from '../../../../utils';
import * as MPT from '../../../../proptypes';

import Stegvelger from '../../../../felleskomponenter/stegvelger';
import { HenlagtSak, AvslaattSoknad } from '../stegErstatter';
import Soknadpaneler from '../../../../felleskomponenter/soknadpaneler';

import { fagsakSelectors } from '../../../../ducks/fagsaker';
import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { redigerbartSelectors } from '../../../../ducks/redigerbart';
import {
  soknadOperations,
  soknadSelectors,
} from '../../../../ducks/soknad';

import { avklartefaktaSelectors } from '../../../../ducks/avklartefakta';
import { behandlingsresultatSelectors } from '../../../../ducks/behandlingsresultat';
import { formSelectors } from '../../../../ducks/form';

import { stegMap } from '../../stegMap';

const Saksopplysninger = ({
  redigerbart,
  behandlingID,
  soknadForm,
  soknad,
  behandlingsresultat,
  fagsakStatusKode,
  tilForsiden,
  lagreVilkarHandler,
  lagreAvklartefaktaHandler,
  lagreLovvalgsperioderHandler,
  lagreAnmodningsperioderHandler,
  oppdaterOgLagreBehandlingerHandler,
  lagreAllData,
  oppdaterSoknad,
  blokkerInnholdMedOppfriskSpinner,
}) => {
  if (Utils._isNil(redigerbart)) return null;
  if (Object.keys(soknadForm).length === 0 || Object.keys(soknad).length === 0) { return null; }

  if (!behandlingID) {
    return null;
  }

  const erHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
  const erAvslaattSoknad = behandlingsresultat.behandlingsresultatTypeKode === MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL;
  const visAvslaattSoknad = erAvslaattSoknad && !erHenlagtSak;
  const visStegVelger = !erHenlagtSak && !erAvslaattSoknad;

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
        oppdaterLokalSoknadHandler={oppdaterSoknad}
        begrunnelser={MKV.KTObjects.begrunnelser}
        landkoder={MKV.KTObjects.landkoder}
        tilForsiden={tilForsiden}
        stegMap={stegMap}
      />
      }
      <Soknadpaneler
        blokkerInnholdMedOppfriskSpinner={blokkerInnholdMedOppfriskSpinner}
        behandlingID={behandlingID}
      />
    </Fragment>
  );
};

Saksopplysninger.propTypes = {
  redigerbart: PT.bool,
  behandlingID: PT.number.isRequired,
  alleRelevantePersoner: PT.arrayOf(MPT.Behandlinger.Saksopplysninger.Person),
  avklartefakta: MPT.AvklartefaktaListe.isRequired,
  behandlingsresultat: MPT.Behandlingsresultat.isRequired,
  blokkerInnholdMedOppfriskSpinner: PT.func.isRequired,
  fagsakStatusKode: PT.string.isRequired,
  match: PT.object.isRequired,
  oppdaterSoknad: PT.func.isRequired,
  person: MPT.Behandlinger.Saksopplysninger.Person,
  soknad: MPT.Soknad,
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
};

Saksopplysninger.defaultProps = {
  redigerbart: null,
  alleRelevantePersoner: [],
  person: {},
  soknad: {},
  vurdering: {},
  syncErrors: {},
  inngangForm: {},
};

const mapStateToProps = state => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  bekreftelser: behandlingerSelectors.BekreftelserSelector(state),
  behandlingsresultat: behandlingsresultatSelectors.BehandlingsresultatSelector(state),
  soknad: soknadSelectors.SoknadSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
  inngangForm: formSelectors.InngangFormSelector(state),
  oppgittAdresseHarVerdier: formSelectors.OppgittAdresseHarVerdierSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterSoknad: () => dispatch(soknadOperations.oppdaterSoknadState()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksopplysninger));
