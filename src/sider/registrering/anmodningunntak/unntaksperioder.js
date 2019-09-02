/* eslint no-alert:off, consistent-return:off */
import React from 'react';

import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';
//import * as Api from '../../../services/api';
import Behandlingsmeny from './komponenter/behandlingsmeny';
// import Behandlingsmeny2 from './komponenter/bhandlingmeny2';
import Saksopplysninger from './komponenter/saksopplysninger';
import SideDialog from '../../../felleskomponenter/sideDialog/sideDialog';
import SideOppsummering from './komponenter/sideOppsummering';
import { behandlingerOperations, behandlingerSelectors } from '../../../ducks/behandlinger';
import { fagsakOperations, fagsakSelectors } from '../../../ducks/fagsaker';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../../ducks/avklartefakta';

import { lovvalgsperioderOperations } from '../../../ducks/lovvalgsperioder';
import { soknadOperations, soknadSelectors } from '../../../ducks/soknad';

import { initialState, reducer } from './state/reducer';
import { RegistreringStateProvider } from './state/registreringStateProvider';
import * as RegistreringContext from './state/registreringContext';

import './registrering.css';

const RegistreringAnmodningunntak = props => {
  const [behandlingID, setBehandlingID] = React.useState(-1);
  const lastInnSaksopplysninger = async () => {
    const { match, location } = props;
    const { snr } = match.params;
    const _behandlingID = Utils.queryString.getParam(location, 'behandlingID');
    setBehandlingID(Utils._toInteger(_behandlingID));

    const {
      hentAvklartefakta, hentBehandling, hentFagsaker, hentLovvalgsperioder, hentSoknad,
    } = props;
    try {
      await Promise.all([
        hentBehandling(_behandlingID),
        hentFagsaker(snr),
        hentAvklartefakta(_behandlingID),
        hentSoknad(_behandlingID),
        hentLovvalgsperioder(_behandlingID),
      ]);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const avsluttSakSomBortfalt = () => {
    /*
    const { fagsak: { saksnummer } } = props;
    Api.Fagsaker.fagsak.bortfall(saksnummer).catch(err => Utils.logger.error(err));
    props.history.push('/');
    */
    alert('avsluttSakSomBortfalt');
  };
  const visOppfriskBekreftelse = () => {
    // visOppfriskDialog(true);
    alert('visOppfriskBekreftelse');
  };
  const lagreOgLukk = async () => {
    // this.lagreAllData();
    // const { history, hentOppgaveOversikt } = props;
    // await hentOppgaveOversikt();
    //props.history.push('/');
    alert('LagreOgLukk');
  };
  const tilbakeleggeHandle = async () => {
    /*
    const { behandlingID } = this.state;
    const { tilbakeleggeOppgave } = this.props;

    await tilbakeleggeOppgave(behandlingID, venterPaaDokumentasjon);
    this.lagreOgLukk();
    */
    alert('tilbakeleggeHandle');
  };
  const visHenleggDialog = () => {
    // this.setState({ visHenleggDialog: true });
    alert('visHenleggDialog');
  };
  const navigerTilOversiktSide = () => {
    // this.skjulOppfriskBekreftelse();
    props.history.push('/');
  };
  React.useEffect(() => {
    lastInnSaksopplysninger();
  }, []);

  const apneTidligereBehandlinger = () => {
    const URI_SOK = `/sok/${props.person.fnr}`;
    window.open(URI_SOK);
  };
  const {
    vurderingBegrunnelser, medlemskap, sed, redigerbart, behandlingstype,
  } = props;


  const visHenleggSak = () => redigerbart && behandlingstype !== MKV.Koder.behandlinger.typer.ENDRET_PERIODE;
  const knappeRader = [{
    label: 'Lagre og lukk',
    clickFunc: lagreOgLukk,
    redigerbart,
  }, {
    label: 'Legg tilbake i kø',
    clickFunc: tilbakeleggeHandle,
    disabled: !redigerbart,
  }, {
    label: 'Oppdater saksopplysninger',
    clickFunc: visOppfriskBekreftelse,
    disabled: !redigerbart,
  }, {
    label: 'Henlegg sak',
    clickFunc: visHenleggDialog,
    redigerbart: visHenleggSak(),
  }, {
    label: 'Avslutt sak som bortfalt',
    clickFunc: avsluttSakSomBortfalt,
    redigerbart,
  }, {
    label: ' Vis tidligere behandlinger',
    clickFunc: apneTidligereBehandlinger,
  }];

  return (
    <div className="registrering">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            <Saksopplysninger
              redigerbart={redigerbart}
              behandlingID={behandlingID}
              medlemskap={medlemskap}
              sed={sed}
              vurderingBegrunnelser={vurderingBegrunnelser}
            />
          </Nav.Column>
          <Nav.Column xs="5">
            <Nav.Panel>
              <Nav.Row>
                <Nav.Column xs="12" md="12">
                  <div className="oppsummering__menylinje">
                    <Behandlingsmeny
                      lagreOgLukkHandle={lagreOgLukk}
                      tilbakeleggeHandle={tilbakeleggeHandle}
                      oppfriskSaksopplysningerHandle={visOppfriskBekreftelse}
                      visHenleggDialogHandle={visHenleggDialog}
                      avsluttSakSomBortfalt={avsluttSakSomBortfalt}
                      apneTidligereBehandlinger={apneTidligereBehandlinger}
                      redigerbart={redigerbart}
                      visHenleggSak={behandlingstype !== MKV.Koder.behandlinger.typer.ENDRET_PERIODE}
                    />
                  </div>
                </Nav.Column>
              </Nav.Row>
            </Nav.Panel>
            {/*<Nav.Panel>
              <Nav.Row>
                <Nav.Column xs="12" md="12">
                  <div className="oppsummering__menylinje">
                    <Behandlingsmeny2 title="Behandlingsmeny" knappeRader={knappeRader} />
                  </div>
                </Nav.Column>
              </Nav.Row>
            </Nav.Panel>*/}
            <SideOppsummering behandlingID={behandlingID} />
            <SideDialog behandlingID={behandlingID} redigerbart={redigerbart}/>
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};
RegistreringAnmodningunntak.propTypes = {
  avsluttSakSomBortfalt: PT.func.isRequired,
  hentAvklartefakta: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  hentSoknad: PT.func.isRequired,
  redigerbart: PT.bool,
  behandlingstype: PT.string.isRequired,
  avklartefakta: MPT.AvklartefaktaListe,
  vurderingBegrunnelser: PT.object,
  fagsak: MPT.Fagsak,
  medlemskap: MPT.Medlemskap,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  soknad: MPT.Soknad,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
};
RegistreringAnmodningunntak.defaultProps = {
  avklartefakta: [],
  fagsak: {},
  medlemskap: {},
  oppsummering: {},
  redigerbart: false,
  sed: {},
  soknad: {},
  vurderingBegrunnelser: {},
};
const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vurderingBegrunnelser: avklartefaktaSelectors.VurderingUnntakPeriode(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  sed: behandlingerSelectors.SEDSelector(state),
  soknad: soknadSelectors.SoknadSelector(state),
});


const mapDispatchToProps = dispatch => ({
  hentAvklartefakta: behandlingID => dispatch(avklartefaktaOperations.hent(behandlingID)),
  hentBehandling: behandlingID => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  hentLovvalgsperioder: behandlingID => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
  hentSoknad: behandlingID => dispatch(soknadOperations.hent(behandlingID)),
});

const RegistreringStateProviderWrapper = props => (
  <RegistreringStateProvider initialState={initialState} reducer={reducer}>
    { RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(RegistreringAnmodningunntak)(props) }
  </RegistreringStateProvider>
);

export default RegistreringStateProviderWrapper;
