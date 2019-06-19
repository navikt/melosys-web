/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import TrackVisibility from 'react-on-screen';

import * as MPT from '../../proptypes/';
import * as Api from '../../services/api';
import * as Utils from '../../utils';
import StegLinje from './felles/stegLinje';
import StegFane from './felles/stegFane';
import StegMotor from './stegMotor';

import { anmodningsperioderSelectors, anmodningsperioderOperations } from '../../ducks/anmodningsperioder';
import { behandlingerSelectors } from '../../ducks/behandlinger/';
import { inngangOperations, inngangSelectors } from '../../ducks/inngang/';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../ducks/avklartefakta/';
import { behandlingsperioderSelectors, behandlingsperioderOperations } from '../../ducks/behandlingsperioder';
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from '../../ducks/lovvalgsperioder/';
import { vilkarOperations, vilkarSelectors } from '../../ducks/vilkar/';
import { vedtakOperations } from '../../ducks/vedtak/';
import { formSelectors } from '../../ducks/form/';
import { SoknadFeilmeldinger } from '../soknadFeilmeldinger';
import { AnmodningsperioderStore, AvklartefaktaStore, VilkaarStore, LovvalgsbestemmelseStore } from './StegState/';

import './stegvelger.css';

class Stegvelger extends Component {
  state = {
    aktivtStegNummer: 0,
    aktuelleSteg: [],
    stegStores: {
      anmodningsperioder: new AnmodningsperioderStore(),
      avklartefakta: new AvklartefaktaStore(),
      vilkaar: new VilkaarStore(),
      lovvalgsbestemmelse: new LovvalgsbestemmelseStore(),
    },
    visSoknadFeilmeldinger: false,
  };

  async componentDidMount() {
    this.aktiv = true;
    const { snr } = this.props.match.params;
    this.props.hentInngang(snr);

    const { behandlingID } = this.props;

    await Promise.all([
      this.props.hentMedlemsPerioder(behandlingID),
      this.props.hentVilkar(behandlingID),
      this.props.hentAvklartefakta(behandlingID),
      this.props.hentLovvalgsperioder(behandlingID),
      this.props.hentAnmodningsperioder(behandlingID),
    ]);

    this.oppdaterAktuelleSteg();
  }

  componentWillUnmount() {
    this.aktiv = false;
  }

  aktiv = true;

  /** Her vil validering på hver enkelt felt / fane kunne åpne
   * opp for nye tilgjengelige faner etter at saksbehandler
   * har bekreftet valgene.
   */
  bekreftOgFortsett = () => {
    this.publiserStegdata();
    this.validerSoknadOgGaTilSteg(this.beregnNesteSteg());
  };

  harSoknadIngenFeilmeldinger = () => Utils._isEmpty(this.props.soknadFeilmeldinger);

  gjemSoknadFeilmeldinger = () => this.setState({ visSoknadFeilmeldinger: false });

  visSoknadFeilmeldinger = () => this.setState({ visSoknadFeilmeldinger: true });

  oppdaterStegData = (stegID, data) => {
    if (!data) return;

    const { felt, type, innhold } = data;
    const { stegStores } = this.state;
    stegStores[type].oppdaterStegData(stegID, { felt, type, innhold });
    this.setState(stegStores);

    if (data.oppdaterRedux) {
      this.publiserStegdata();
    }
  };

  slettStegData = (stegID, data = {}) => {
    const { felt, type } = data;

    if (Utils._isNil(type) && Utils._isNil(felt)) {
      this.slettSteg(stegID);
    } else {
      const { stegStores } = this.state;
      stegStores[type].slettStegData(stegID, data);
      this.setState(stegStores);
    }
    this.publiserStegdata();
  };

  slettSteg = stegID => {
    const { stegStores } = this.state;
    Object.keys(stegStores).forEach(type => stegStores[type].slettSteg(stegID));
    this.setState(stegStores);
  };

  publiserStegdata = async () => {
    if (!this.aktiv) { return; }

    const {
      anmodningsperioder, vilkaar, avklartefakta, lovvalgsbestemmelse,
    } = this.state.stegStores;

    await Promise.all([
      this.props.oppdaterAnmodningsPerioder(anmodningsperioder.hent()),
      this.props.oppdaterVilkaar(vilkaar.hent()),
      this.props.oppdaterAvklartefakta(avklartefakta.hent()),
      this.props.oppdaterLovvalgperioder(lovvalgsbestemmelse.hent()),
    ]);

    this.oppdaterAktuelleSteg();
  };

  fatteVedtakHandler = async behandlingsresultattype => {
    const { behandlingID, fatteVedtak } = this.props;
    const vedtakBody = { behandlingsresultattype };
    try {
      await fatteVedtak(behandlingID, vedtakBody);
      this.tilForsiden();
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  lagreOgFatteVedtak = async behandlingsresultattype => {
    if (this.harSoknadIngenFeilmeldinger()) {
      this.gjemSoknadFeilmeldinger();
      await this.props.lagreAllData();
      this.fatteVedtakHandler(behandlingsresultattype);
    } else {
      this.visSoknadFeilmeldinger();
    }
  };

  endreDatoOgSendLovvalgsperioderHandler = (fomdato, tomdato) => {
    const { behandlingID, lovvalgsperioder } = this.props;

    const forkortetPeriode = lovvalgsperioder.map(periode => ({ ...periode, fomDato: fomdato, tomDato: tomdato }));
    Api.Lovvalgsperioder.send(behandlingID, forkortetPeriode).catch(e => Utils.logger.error(e));
  };

  vedtaEndretPeriode = begrunnelseKode => {
    const { behandlingID } = this.props;

    Api.Saksflyt.Vedtak.endrePeriode(behandlingID, { begrunnelseKode }).catch(e => Utils.logger.error(e));
  };

  tilForsiden = () => {
    this.props.history.push('/');
  };

  /** Analyser alle svar som er gjort i tidligere steg og bygg videre
   * steg så langt det er mulig å komme. Alle ubesvarte steg går direkte til vedtak som default.
   *
   * @param props
   * @returns {Array}
   */
  oppdaterAktuelleSteg = () => {
    const tilgjengeligeHandlers = {
      bekreftOgFortsett: this.bekreftOgFortsett,
      lagreOgFatteVedtak: this.lagreOgFatteVedtak,
      oppdaterOgLagreBehandlinger: this.props.oppdaterOgLagreBehandlingerHandler,
      oppdaterStegData: this.oppdaterStegData,
      slettStegData: this.slettStegData,
      lagreVilkarHandler: this.props.lagreVilkarHandler,
      lagreLovvalgsperioderHandler: this.props.lagreLovvalgsperioderHandler,
      vedtaEndretPeriode: this.vedtaEndretPeriode,
      endreDatoOgSendLovvalgsperioderHandler: this.endreDatoOgSendLovvalgsperioderHandler,
      tilForsiden: this.tilForsiden,
    };

    const { props } = this;

    const propsLight = { //TODO oppdater anmodningsperioder
      anmodningsperioder: props.anmodningsperioder,
      behandlingID: props.behandlingID,
      virksomheterIPerioden: props.arbeidsgivereIPerioden,
      avklartefakta: props.avklartefakta,
      begrunnelser: MKV.KTObjects.begrunnelser,
      bostedsland: props.bostedsland,
      landkoder: MKV.KTObjects.landkoder,
      behandlingstype: props.oppsummering.behandlingstype,
      behandlingsstatus: props.oppsummering.behandlingsstatus,
      lovvalgsperioder: props.lovvalgsperioder,
      inngang: props.inngang,
      tilgjengeligeHandlers,
      saksopplysninger: props.saksopplysninger,
      skjema: props.skjema,
      arbeidsland: props.arbeidsland,
      valgteVirksomheter: props.valgteVirksomheter,
      vilkar: props.vilkar,
      redigerbart: props.redigerbart,
    };

    const stegMotor = new StegMotor(propsLight);
    const aktuelleSteg = stegMotor.beregnAlleSteg();
    // Dersom ved en re-kalkulering av aktuelle steg viser seg at det ikke er flere mulige steg
    // må vi normalisere siden aktivtStegNummer vil ligge 1 steg foran det som er mulig. Sjekk derfor
    // på faktisk antall mulige steg.
    const normalisertAktivtSteg = Math.min(this.state.aktivtStegNummer, aktuelleSteg.length - 1);

    aktuelleSteg[normalisertAktivtSteg].aktivtSteg = true;

    this.setState({ aktuelleSteg });
    return aktuelleSteg;
  };

  validerSoknadOgGaTilSteg = nyttStegNummer => {
    if (this.harSoknadIngenFeilmeldinger()) {
      this.gjemSoknadFeilmeldinger();
      this.tilSteg(nyttStegNummer);
    } else {
      this.visSoknadFeilmeldinger();
    }
  };

  /** Gå til et konkret steg i steglisten, angitt av en indeks
   * som begynnner med 0.
   * @param nyttStegNummer Number Steget som det skal byttes til.
   */
  tilSteg = async nyttStegNummer => {
    const {
      skjema,
      oppdaterPerioderState,
      oppdaterLokalSoknadHandler,
      lagreSoknadHandler,
    } = this.props;

    await oppdaterLokalSoknadHandler();

    this.setState({ aktivtStegNummer: nyttStegNummer });

    const {
      lagreVilkarHandler,
      lagreAvklartefaktaHandler,
      lagreLovvalgsperioderHandler,
    } = this.props;

    await oppdaterPerioderState(skjema);

    await lagreAvklartefaktaHandler();
    await lagreVilkarHandler();
    await lagreLovvalgsperioderHandler();

    if (this.erSisteSteg(nyttStegNummer)) {
      await lagreSoknadHandler();
    }

    this.oppdaterAktuelleSteg();
  };

  /** Beregn neste steg i rekken, men ikke lenger enn
   * maks antall steg (til og med vedtak). Ved forsøk på å gå ytterligere steg
   * enn hva som er mulig skal funksjonen defaulte til det aktive stegnummeret.
   */
  beregnNesteSteg = () => {
    const { aktivtStegNummer } = this.state;
    return aktivtStegNummer + 1;
  };

  erSisteSteg(stegNummer) {
    const maksSteg = this.state.aktuelleSteg.length - 1;
    return stegNummer >= maksSteg;
  }

  render() {
    const { visSoknadFeilmeldinger } = this.state;

    return (
      <TrackVisibility partialVisibility>
        {({ isVisible }) => (
          <div className="stegvelger panelSeksjon">
            <StegLinje steg={this.state.aktuelleSteg} stegKlikk={this.validerSoknadOgGaTilSteg} />
            {
              this.state.aktuelleSteg.map(item => <StegFane key={item.id} faneData={item} />)
            }
            { isVisible && visSoknadFeilmeldinger && <SoknadFeilmeldinger />}
          </div>
        )}
      </TrackVisibility>
    );
  }
}

Stegvelger.propTypes = {
  behandlingID: PT.number.isRequired,
  arbeidsgivereIPerioden: PT.array,
  avklartefakta: MPT.AvklartefaktaListe,
  behandlingsPerioder: PT.object.isRequired,
  hentInngang: PT.func.isRequired,
  hentVilkar: PT.func.isRequired,
  hentAvklartefakta: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  history: PT.object.isRequired,
  fatteVedtak: PT.func.isRequired,
  lagreSoknadHandler: PT.func.isRequired,
  lovvalgsperioder: PT.array.isRequired,
  inngang: PT.object,
  match: PT.object.isRequired,
  oppdaterPerioderState: PT.func.isRequired,
  oppdaterLokalSoknadHandler: PT.func.isRequired,
  oppsummering: MPT.Oppsummering,
  saksopplysninger: PT.object.isRequired,
  skjema: PT.object.isRequired,
  oppdaterVilkaar: PT.func.isRequired,
  oppdaterAvklartefakta: PT.func.isRequired,
  oppdaterLovvalgperioder: PT.func.isRequired,
  valgteVirksomheter: PT.array,
  vilkar: PT.array.isRequired,
  endreLovvalgsPeriode: PT.func.isRequired,
  lagreVilkarHandler: PT.func.isRequired,
  lagreAvklartefaktaHandler: PT.func.isRequired,
  lagreLovvalgsperioderHandler: PT.func.isRequired,
  oppdaterOgLagreBehandlingerHandler: PT.func.isRequired,
  lagreAllData: PT.func.isRequired,
  hentMedlemsPerioder: PT.func.isRequired,
  soknadFeilmeldinger: PT.object.isRequired,
  hentAnmodningsperioder: PT.func.isRequired,
  anmodningsperioder: PT.array.isRequired,
  oppdaterAnmodningsPerioder: PT.func.isRequired,
};

Stegvelger.defaultProps = {
  arbeidsgivereIPerioden: [],
  avklartefakta: [],
  inngang: {},
  oppsummering: {},
  valgteVirksomheter: [],
};

const mapStateToProps = state => ({
  anmodningsperioder: anmodningsperioderSelectors.AnmodningsperioderSelector(state),
  arbeidsgivereIPerioden: avklartefaktaSelectors.VirksomheterIPeriodenSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vilkar: vilkarSelectors.VilkarSelector(state),
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  behandlingsPerioder: behandlingsperioderSelectors.behandlingsPerioderSelector(state),
  inngang: inngangSelectors.InngangSelector(state),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  bostedsland: avklartefaktaSelectors.BostedslandSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
  saksopplysninger: behandlingerSelectors.SaksopplysningerSelector(state),
  valgteVirksomheter: avklartefaktaSelectors.AvklarteVirksomheterSelector(state),
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  soknadFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
});

/* eslint no-alert:off */
const mapDispatchToProps = dispatch => ({
  hentInngang: snr => dispatch(inngangOperations.hent(snr)),
  hentVilkar: behandlingID => dispatch(vilkarOperations.hent(behandlingID)),
  fatteVedtak: (behandlingID, body) => dispatch(vedtakOperations.fatte(behandlingID, body)),
  hentAvklartefakta: behandlingID => dispatch(avklartefaktaOperations.hent(behandlingID)),
  hentLovvalgsperioder: behandlingID => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
  oppdaterPerioderState: skjema => dispatch(behandlingsperioderOperations.oppdaterPerioderState(skjema)),
  endreLovvalgsPeriode: (fomdato, tomdato) => dispatch(lovvalgsperioderOperations.endreLovvalgsPeriode(fomdato, tomdato)),
  oppdaterVilkaar: vilkaarListe => dispatch(vilkarOperations.oppdaterVilkarState(vilkaarListe)),
  oppdaterAvklartefakta: avklartefaktaListe => dispatch(avklartefaktaOperations.oppdaterAvklarteFaktaState(avklartefaktaListe)),
  oppdaterLovvalgperioder: lovvalgsperiode => dispatch(lovvalgsperioderOperations.oppdaterLovvalgsperioderState(lovvalgsperiode)),
  hentMedlemsPerioder: behandlingID => dispatch(behandlingsperioderOperations.hentMedlemsPerioder(behandlingID)),
  hentAnmodningsperioder: behandlingID => dispatch(anmodningsperioderOperations.hent(behandlingID)),
  oppdaterAnmodningsPerioder: anmodningsperioder => dispatch(anmodningsperioderOperations.oppdaterAnmodningsperioderState(anmodningsperioder)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Stegvelger));
