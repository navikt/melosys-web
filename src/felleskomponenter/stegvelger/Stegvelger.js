/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import TrackVisibility from 'react-on-screen';

import MKV from '../../melosyskodeverk';

import * as MPT from '../../proptypes';
import * as Api from '../../services/api';
import * as Utils from '../../utils';
import StegLinje from './felles/stegLinje';
import StegFane from './felles/stegFane';
import StegMotor from './stegMotor';

import { anmodningsperioderSelectors, anmodningsperioderOperations } from '../../ducks/anmodningsperioder';
import { anmodningsperiodesvarSelectors, anmodningsperiodesvarOperations } from '../../ducks/anmodningsperiodesvar';
import { behandlingerSelectors } from '../../ducks/behandlinger';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../ducks/avklartefakta';
import { behandlingsperioderSelectors, behandlingsperioderOperations } from '../../ducks/behandlingsperioder';
import { fagsakSelectors } from '../../ducks/fagsaker';
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from '../../ducks/lovvalgsperioder';
import { vilkarOperations, vilkarSelectors } from '../../ducks/vilkar';
import { redigerbartSelectors } from '../../ducks/redigerbart';
import { vedtakOperations } from '../../ducks/vedtak';
import { formSelectors } from '../../ducks/form';
import { soknadOperations } from '../../ducks/soknad';
import { utpekOperations } from '../../ducks/utpek';
import { utpekingsperioderOperations, utpekingsperioderSelectors } from '../../ducks/utpekingsperioder';

import { SoknadFeilmeldinger } from '../soknadFeilmeldinger';
import { AvklartefaktaStore, VilkaarStore, EnkelDataStore } from './StegState';
import { StegStoreTyper } from '../../regler';

import './stegvelger.css';

class Stegvelger extends Component {
  state = {
    aktivtStegNummer: 0,
    aktuelleSteg: [],
    stegStores: {
      [StegStoreTyper.Anmodningsperiodersvar]: new EnkelDataStore(),
      [StegStoreTyper.Avklartefakta]: new AvklartefaktaStore(),
      [StegStoreTyper.Vilkar]: new VilkaarStore(),
      [StegStoreTyper.Lovvalgsbestemmelser]: new EnkelDataStore(),
      [StegStoreTyper.Tilleggbestemmelser]: new EnkelDataStore(),
      [StegStoreTyper.UnntakFraBestemmelse]: new EnkelDataStore(),
    },
    visSoknadFeilmeldinger: false,
  };

  async componentDidMount() {
    this.aktiv = true;

    const { behandlingID } = this.props;
    const { aktivtStegNummer } = this.state;

    await Promise.all([
      this.props.hentMedlemsPerioder(behandlingID),
      this.props.hentVilkar(behandlingID),
      this.props.hentAvklartefakta(behandlingID),
      this.props.hentLovvalgsperioder(behandlingID),
      this.props.hentAnmodningsperioder(behandlingID),
      this.props.hentUtpekingsperioder(behandlingID),
    ]);

    this.oppdaterAktuelleSteg(aktivtStegNummer);
  }

  componentDidUpdate(prevProps) {
    const { aktivtStegNummer } = this.state;

    if (this.props.oppsummering.behandlingsstatus !== prevProps.oppsummering.behandlingsstatus) {
      this.oppdaterAktuelleSteg(aktivtStegNummer);
    }
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

  harSoknadFeilmeldinger = () => !Utils._isEmpty(this.props.soknadFeilmeldinger);

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

    const { aktivtStegNummer, stegStores } = this.state;
    const {
      vilkaar,
      avklartefakta,
      lovvalgsbestemmelse,
      anmodningsperiodesvar,
      tilleggbestemmelse,
      unntakfrabestemmelse,
    } = stegStores;

    const bestemmelser = {
      lovvalgsbestemmelse: lovvalgsbestemmelse.hent(),
      tilleggbestemmelse: tilleggbestemmelse.hent(),
      unntakfrabestemmelse: unntakfrabestemmelse.hent(),
    };

    await Promise.all([
      this.props.oppdaterVilkaar(vilkaar.hent()),
      this.props.oppdaterAvklartefakta(avklartefakta.hent()),
      this.props.oppdaterLovvalgperioder(bestemmelser),
      this.props.oppdaterAnmodningsPerioder(bestemmelser),
      this.props.oppdaterUtpekingsperioder(bestemmelser),
      this.props.oppdaterAnmodningsperiodesvar(anmodningsperiodesvar.hent()),
    ]);

    this.props.oppdaterLokalSoknadHandler();
    this.oppdaterAktuelleSteg(aktivtStegNummer);
  };

  fatteVedtakHandler = data => {
    const {
      behandlingID,
      fattVedtak,
    } = this.props;

    const vedtakBody = {
      behandlingsresultatTypeKode: data.behandlingsresultatTypeKode,
      fritekst: data.fritekst || null,
      mottakerinstitusjoner: data.mottakerinstitusjoner || [],
      vedtakstype: data.vedtakstype,
      revurderBegrunnelse: data.revurderBegrunnelse || null,
    };

    fattVedtak(behandlingID, vedtakBody);
  };

  lagreOgFatteVedtak = data => {
    this.sjekkOgVisSoknadFeilmeldinger(async () => {
      await this.props.lagreAllData();
      this.fatteVedtakHandler(data);
    });
  };

  utpekHandler = data => {
    const { saksnummer, utpek } = this.props;

    const utpekBody = {
      mottakerinstitusjoner: data.mottakerinstitusjoner,
    };

    utpek(saksnummer, utpekBody);
  };

  lagreOgUtpek = data => {
    this.sjekkOgVisSoknadFeilmeldinger(async () => {
      await this.props.lagreAllData();
      this.utpekHandler(data);
    });
  };

  bestillAnmodningsperioder = async (mottakerinstitusjon = null) => {
    const { behandlingID, tilForsiden } = this.props;
    const bestillAnmodningsperioderBody = { mottakerinstitusjon };
    try {
      await Api.Saksflyt.Anmodningsperioder.bestill(behandlingID, bestillAnmodningsperioderBody);
      tilForsiden();
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  lagreOgBestillAnmodningsperioder = mottakerinstitusjon => {
    this.sjekkOgVisSoknadFeilmeldinger(async () => {
      await this.props.lagreAllData();
      this.bestillAnmodningsperioder(mottakerinstitusjon);
    });
  };

  videresendSoknad = mottakerinstitusjon => {
    this.sjekkOgVisSoknadFeilmeldinger(async () => {
      const { saksnummer, tilForsiden } = this.props;

      try {
        const body = { mottakerinstitusjon };
        await Api.Fagsaker.fagsak.videresend(saksnummer, body);
      } catch (e) {
        Utils.logger.error(e);
      } finally {
        tilForsiden();
      }
    });
  };

  sjekkOgVisSoknadFeilmeldinger = ingenFeilmeldingerCallback => {
    if (this.harSoknadFeilmeldinger()) {
      this.visSoknadFeilmeldinger();
    } else {
      this.gjemSoknadFeilmeldinger();
      if (ingenFeilmeldingerCallback) ingenFeilmeldingerCallback();
    }
  };

  byggLovvalgsperioderHandler = () => {
    const { lovvalgsbestemmelse, tilleggbestemmelse, unntakfrabestemmelse } = this.state.stegStores;

    this.props.oppdaterLovvalgperioder({
      lovvalgsbestemmelse: lovvalgsbestemmelse.hent(),
      tilleggbestemmelse: tilleggbestemmelse.hent(),
      unntakfrabestemmelse: unntakfrabestemmelse.hent(),
    });
  };

  byggAnmodningsperioderHandler = () => {
    const { lovvalgsbestemmelse, tilleggbestemmelse, unntakfrabestemmelse } = this.state.stegStores;

    this.props.oppdaterAnmodningsPerioder({
      lovvalgsbestemmelse: lovvalgsbestemmelse.hent(),
      tilleggbestemmelse: tilleggbestemmelse.hent(),
      unntakfrabestemmelse: unntakfrabestemmelse.hent(),
    });
  };

  endreDatoOgSendLovvalgsperioderHandler = (fomdato, tomdato) => {
    const { behandlingID, lovvalgsperioder } = this.props;

    const forkortetPeriode = lovvalgsperioder.map(periode => ({ ...periode, fomDato: fomdato, tomDato: tomdato }));
    Api.Lovvalgsperioder.send(behandlingID, forkortetPeriode).catch(e => Utils.logger.error(e));
  };

  endreVedtak = data => {
    const { behandlingID } = this.props;

    const utfyltData = {
      behandlingstype: data.behandlingstype || null,
      begrunnelseKode: data.begrunnelseKode || null,
      fritekst: data.fritekst || null,
    };

    return Api.Saksflyt.Vedtak.endre(behandlingID, utfyltData).catch(Utils.logger.error);
  };

  /** Analyser alle svar som er gjort i tidligere steg og bygg videre
   * steg så langt det er mulig å komme. Alle ubesvarte steg går direkte til vedtak som default.
   *
   * @param aktivtStegNummer
   * @returns {Array}
   */
  oppdaterAktuelleSteg = aktivtStegNummer => {
    const tilgjengeligeHandlers = {
      bekreftOgFortsett: this.bekreftOgFortsett,
      lagreOgFatteVedtak: this.lagreOgFatteVedtak,
      lagreOgUtpek: this.lagreOgUtpek,
      oppdaterOgLagreBehandlinger: this.props.oppdaterOgLagreBehandlingerHandler,
      oppdaterStegData: this.oppdaterStegData,
      slettStegData: this.slettStegData,
      lagreVilkarHandler: this.props.lagreVilkarHandler,
      lagreAnmodningsperioderHandler: this.props.lagreAnmodningsperioderHandler,
      endreVedtak: this.endreVedtak,
      endreDatoOgSendLovvalgsperioderHandler: this.endreDatoOgSendLovvalgsperioderHandler,
      tilForsiden: this.props.tilForsiden,
      lagreOgBestillAnmodningsperioder: this.lagreOgBestillAnmodningsperioder,
      byggAnmodningsperioderHandler: this.byggAnmodningsperioderHandler,
      videresendSoknad: this.videresendSoknad,
      byggLovvalgsperioder: this.byggLovvalgsperioderHandler,
      lagreLovvalgsperioder: this.props.lagreLovvalgsperioderHandler,
    };

    const { props } = this;

    const propsLight = {
      anmodningsperioder: props.anmodningsperioder,
      anmodningsperiodesvar: props.anmodningsperiodesvar,
      anmodningsperiodesvarForm: props.artikkel16_motta_svar_skjema,
      behandlingID: props.behandlingID,
      virksomheterIPerioden: props.arbeidsgivereIPerioden,
      avklartefakta: props.avklartefakta,
      begrunnelser: MKV.KTObjects.begrunnelser,
      bostedsland: props.bostedsland,
      landkoder: MKV.KTObjects.landkoder,
      behandlingstype: props.oppsummering.behandlingstype,
      behandlingsstatus: props.oppsummering.behandlingsstatus,
      lovvalgsperioder: props.lovvalgsperioder,
      utpekingsperioder: props.utpekingsperioder,
      omfattesIAnnetLand: props.omfattesIAnnetLand,
      artikkel16_anmodning_skjema: props.artikkel16_anmodning_skjema,
      artikkel16_motta_svar_skjema: props.artikkel16_motta_svar_skjema,
      tilgjengeligeHandlers,
      saksopplysninger: props.saksopplysninger,
      arbeidsland: props.arbeidsland,
      valgteVirksomheter: props.valgteVirksomheter,
      vilkar: props.vilkar,
      redigerbart: props.redigerbart,
      generiskStegRedigerbart: props.generiskStegRedigerbart,
      erIDirekteTilArtikkel16Flyt: props.erIDirekteTilArtikkel16Flyt,
      soknadslandFaktaer: props.soknadslandFaktaer,
    };

    const stegMotor = new StegMotor(propsLight, props.stegMap);
    const aktuelleSteg = stegMotor.beregnAlleSteg();
    // Dersom ved en re-kalkulering av aktuelle steg viser seg at det ikke er flere mulige steg
    // må vi normalisere siden aktivtStegNummer vil ligge 1 steg foran det som er mulig. Sjekk derfor
    // på faktisk antall mulige steg.
    const normalisertAktivtSteg = Math.min(aktivtStegNummer, aktuelleSteg.length - 1);

    aktuelleSteg[normalisertAktivtSteg].aktivtSteg = true;

    this.setState({ aktuelleSteg });
    return aktuelleSteg;
  };

  validerSoknadOgGaTilSteg = nyttStegNummer => {
    this.sjekkOgVisSoknadFeilmeldinger(() => {
      this.tilSteg(nyttStegNummer);
    });
  };

  /** Gå til et konkret steg i steglisten, angitt av en indeks
   * som begynnner med 0.
   * @param nyttStegNummer Number Steget som det skal byttes til.
   */
  tilSteg = async nyttStegNummer => {
    const {
      artikkel16_anmodning_skjema,
      soknad_skjema,
      oppdaterPerioderState,
      lagreSoknadHandler,
      redigerbart,
      lagreVilkarHandler,
      lagreAvklartefaktaHandler,
      lagreLovvalgsperioderHandler,
      lagreAnmodningsperioderHandler,
      lagreUtpekingsperioderHandler,
    } = this.props;

    this.setState({ aktivtStegNummer: nyttStegNummer });

    if (redigerbart) {
      await oppdaterPerioderState({ ...soknad_skjema, ...artikkel16_anmodning_skjema });
      await lagreAvklartefaktaHandler();
      await lagreVilkarHandler();
      await lagreLovvalgsperioderHandler();
      await lagreAnmodningsperioderHandler();
      await lagreUtpekingsperioderHandler();

      if (this.erSisteSteg(nyttStegNummer)) {
        await lagreSoknadHandler();
      }
    }

    this.oppdaterAktuelleSteg(nyttStegNummer);
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
  anmodningsperiodesvar: MPT.AnmodningsperioderSvar.isRequired,
  behandlingID: PT.number.isRequired,
  arbeidsgivereIPerioden: PT.array,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  avklartefakta: MPT.AvklartefaktaListe,
  bostedsland: MPT.Kodeverk,
  behandlingsPerioder: PT.object.isRequired,
  hentVilkar: PT.func.isRequired,
  hentAvklartefakta: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  history: PT.object.isRequired,
  fattVedtak: PT.func.isRequired,
  lagreSoknadHandler: PT.func.isRequired,
  lovvalgsperioder: PT.array.isRequired,
  oppdaterPerioderState: PT.func.isRequired,
  oppdaterLokalSoknadHandler: PT.func.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering,
  saksopplysninger: PT.object.isRequired,
  soknad_skjema: PT.object,
  artikkel16_anmodning_skjema: PT.object,
  artikkel16_motta_svar_skjema: PT.object,
  oppdaterVilkaar: PT.func.isRequired,
  oppdaterAvklartefakta: PT.func.isRequired,
  oppdaterLovvalgperioder: PT.func.isRequired,
  valgteVirksomheter: PT.array,
  vilkar: PT.array.isRequired,
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
  lagreAnmodningsperioderHandler: PT.func.isRequired,
  lagreUtpekingsperioderHandler: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterAnmodningsperiodesvar: PT.func.isRequired,
  generiskStegRedigerbart: PT.bool.isRequired,
  saksnummer: PT.string,
  erIDirekteTilArtikkel16Flyt: PT.bool.isRequired,
  tilForsiden: PT.func.isRequired,
  utpek: PT.func.isRequired,
  hentUtpekingsperioder: PT.func.isRequired,
  oppdaterUtpekingsperioder: PT.func.isRequired,
  utpekingsperioder: MPT.Utpekingsperioder.isRequired,
  omfattesIAnnetLand: PT.bool.isRequired,
  stegMap: PT.objectOf(PT.arrayOf(PT.oneOfType([
    PT.string,
    PT.object,
  ]))).isRequired,
  soknadslandFaktaer: PT.arrayOf(MPT.Avklartefakta).isRequired,
};

Stegvelger.defaultProps = {
  arbeidsgivereIPerioden: [],
  avklartefakta: [],
  bostedsland: null,
  oppsummering: {},
  valgteVirksomheter: [],
  artikkel16_anmodning_skjema: {},
  artikkel16_motta_svar_skjema: {},
  soknad_skjema: {},
  saksnummer: '',
};

const mapStateToProps = state => ({
  anmodningsperioder: anmodningsperioderSelectors.AnmodningsperioderSelector(state),
  anmodningsperiodesvar: anmodningsperiodesvarSelectors.AnmodningsperiodesvarSelector(state),
  arbeidsgivereIPerioden: avklartefaktaSelectors.VirksomheterIPeriodenSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vilkar: vilkarSelectors.VilkarSelector(state),
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  behandlingsPerioder: behandlingsperioderSelectors.behandlingsPerioderSelector(state),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  bostedsland: avklartefaktaSelectors.BostedslandSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  soknad_skjema: formSelectors.SoknadenFormSelector(state).values,
  artikkel16_anmodning_skjema: formSelectors.Artikkel16AnmodningFormSelector(state).values,
  artikkel16_motta_svar_skjema: formSelectors.Artikkel16MottaSvarFormSelector(state).values,
  saksopplysninger: behandlingerSelectors.SaksopplysningerSelector(state),
  valgteVirksomheter: avklartefaktaSelectors.AvklarteVirksomheterSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  soknadFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
  generiskStegRedigerbart: redigerbartSelectors.GeneriskStegRedigerbartSelector(state),
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  erIDirekteTilArtikkel16Flyt: avklartefaktaSelectors.ErIDirekteTilArtikkel16FlytSelector(state),
  utpekingsperioder: utpekingsperioderSelectors.UtpekingsperioderSelector(state),
  omfattesIAnnetLand: avklartefaktaSelectors.OmfattesIAnnetLandSelector(state),
  soknadslandFaktaer: avklartefaktaSelectors.Soknadsland(state),
});

/* eslint no-alert:off */
const mapDispatchToProps = dispatch => ({
  hentVilkar: behandlingID => dispatch(vilkarOperations.hent(behandlingID)),
  fattVedtak: (behandlingID, body) => dispatch(vedtakOperations.fatt(behandlingID, body)),
  hentAvklartefakta: behandlingID => dispatch(avklartefaktaOperations.hent(behandlingID)),
  hentLovvalgsperioder: behandlingID => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
  oppdaterPerioderState: skjema => dispatch(behandlingsperioderOperations.oppdaterPerioderState(skjema)),
  oppdaterVilkaar: vilkaarListe => dispatch(vilkarOperations.oppdaterVilkarState(vilkaarListe)),
  oppdaterAvklartefakta: avklartefaktaListe => dispatch(avklartefaktaOperations.oppdaterAvklarteFaktaState(avklartefaktaListe)),
  oppdaterLovvalgperioder: stegState => dispatch(lovvalgsperioderOperations.oppdaterLovvalgsperioderState(stegState)),
  hentMedlemsPerioder: behandlingID => dispatch(behandlingsperioderOperations.hentMedlemsPerioder(behandlingID)),
  hentAnmodningsperioder: behandlingID => dispatch(anmodningsperioderOperations.hent(behandlingID)),
  oppdaterAnmodningsPerioder: stegState => dispatch(anmodningsperioderOperations.oppdaterAnmodningsperioderState(stegState)),
  hentUtpekingsperioder: behandlingID => dispatch(utpekingsperioderOperations.hent(behandlingID)),
  oppdaterUtpekingsperioder: stegState => dispatch(utpekingsperioderOperations.oppdaterUtpekingsperioderState(stegState)),
  oppdaterAnmodningsperiodesvar: anmodningsperiodesvar => dispatch(anmodningsperiodesvarOperations.oppdaterAnmodningsperiodesvarState(anmodningsperiodesvar)),
  lagreSoknadHandler: () => dispatch(soknadOperations.lagre()),
  utpek: (saksnummer, body) => dispatch(utpekOperations.utpek(saksnummer, body)),
  lagreUtpekingsperioderHandler: () => dispatch(utpekingsperioderOperations.lagre()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Stegvelger));
