/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as MPT from '../../proptypes/';

import StegLinje from './felles/stegLinje';
import StegFane from './felles/stegFane';
import StegMotor from './stegMotor';

import { fagsakSelectors } from '../../ducks/fagsaker/';
import { KodeverkSelectors } from '../../ducks/kodeverk/';
import { inngangOperations, inngangSelectors } from '../../ducks/inngang/';
import { avklartefaktaSelectors, avklartefaktaOperations } from '../../ducks/avklartefakta/';
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from '../../ducks/lovvalgsperioder/';
import { vilkarOperations, vilkarSelectors } from '../../ducks/vilkar/';
import { vedtakOperations } from '../../ducks/vedtak/';
import { formSelectors } from '../../ducks/form/';

import './stegvelger.css';

class Stegvelger extends Component {
  state = { aktivtStegNummer: 0, aktuelleSteg: [], didUpdateAfterLastStep: false };

  componentWillMount() {
    const { snr } = this.props.match.params;
    this.props.hentInngang(snr);

    const bid = this.props.oppsummering.behandlingID;

    this.props.hentVilkar(bid);
    this.props.hentAvklartefakta(bid);
    this.props.hentLovvalgsperioder(bid);
  }

  componentWillReceiveProps(nextProps) {
    this.oppdaterAktuelleSteg(nextProps);
  }

  async componentDidUpdate(prevProps) {
    const formHasSetteled = JSON.stringify(prevProps.skjema) === JSON.stringify(this.props.skjema);
    const { didUpdateAfterLastStep } = this.state;
    const shouldUpdate = (formHasSetteled && !didUpdateAfterLastStep);

    // console.log(formHasSetteled, didUpdateAfterLastStep);

    if (!shouldUpdate) { return; }

    this.setState({ didUpdateAfterLastStep: true });
  }

  /** Her vil validering på hver enkelt felt / fane kunne åpne
   * opp for nye tilgjengelige faner etter at saksbehandler
   * har bekreftet valgene.
   */
  bekreftOgFortsett = () => {
    this.tilSteg(this.beregnNesteSteg());
  };

  lagreVilkarHandler = async () => {
    const bid = this.props.oppsummering.behandlingID;
    const { vilkar } = this.props;
    const { sendVilkar } = this.props;
    await sendVilkar(bid, vilkar);
  };

  lagreAvklartefaktaHandler = async () => {
    const bid = this.props.oppsummering.behandlingID;
    const { avklartefakta } = this.props;
    const { sendAvklartefakta } = this.props;
    await sendAvklartefakta(bid, avklartefakta);
  };

  lagreLovvalgsperioderHandler = async () => {
    const bid = this.props.oppsummering.behandlingID;
    const { lovvalgsperioder } = this.props;
    const { sendLovvalgsperioder } = this.props;
    await sendLovvalgsperioder(bid, lovvalgsperioder);
  };

  fatteVedtakHandler = async behandlingsresultattype => {
    const bid = this.props.oppsummering.behandlingID;
    const { fatteVedtak } = this.props;
    const vedtakBody = { behandlingsresultattype };
    await fatteVedtak(bid, vedtakBody);
    this.props.history.push('/');
  };

  lagreOgFatteVedtak = async behandlingsresultattype => {
    await this.lagreVilkarHandler();
    await this.lagreAvklartefaktaHandler();
    await this.lagreLovvalgsperioderHandler();
    await this.fatteVedtakHandler(behandlingsresultattype);
  };

  /** Analyser alle svar som er gjort i tidligere steg og bygg videre
   * steg så langt det er mulig å komme. Alle ubesvarte steg går direkte til vedtak som default.
   *
   * @param props
   * @returns {Array}
   */
  oppdaterAktuelleSteg = props => {
    const tilgjengeligeHandlers = {
      bekreftOgFortsett: this.bekreftOgFortsett,
      lagreOgFatteVedtak: this.lagreOgFatteVedtak,
      settSkjemaVerdi: this.props.settSkjemaVerdi,
    };

    const propsLight = {
      arbeidsgivereIPerioden: props.arbeidsgivereIPerioden,
      avklartefakta: props.avklartefakta,
      begrunnelser: props.begrunnelser,
      landkoder: props.landkoder,
      lovvalgsperioder: props.lovvalgsperioder,
      inngang: props.inngang,
      tilgjengeligeHandlers,
      saksopplysninger: props.saksopplysninger,
      skjema: props.skjema,
      valgteArbeidsgivere: props.valgteArbeidsgivere,
      vilkar: props.vilkar,
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

  /** Gå til et konkret steg i steglisten, angitt av en indeks
   * som begynnner med 0.
   * @param nyttStegNummer Number Steget som det skal byttes til.
   */
  tilSteg = async nyttStegNummer => {
    const {
      avklartefakta,
      skjema,
      oppdaterAvklarteFaktaState,
      oppdaterVilkarState,
      oppdaterLokalSoknadHandler,
      oppdaterLovvalgperioderState,
      lagreSoknadHandler,
      lovvalgsperioder,
      vilkar,
    } = this.props;

    await oppdaterLokalSoknadHandler();

    this.setState({ aktivtStegNummer: nyttStegNummer });
    const { lagreVilkarHandler, lagreAvklartefaktaHandler, lagreLovvalgsperioderHandler } = this;
    const { behandlingID } = this.props.oppsummering;

    await oppdaterAvklarteFaktaState(skjema);
    await oppdaterVilkarState(skjema);
    await oppdaterLovvalgperioderState(skjema);
    await lagreVilkarHandler(behandlingID, vilkar);
    await lagreAvklartefaktaHandler(behandlingID, avklartefakta);
    await lagreLovvalgsperioderHandler(behandlingID, lovvalgsperioder);

    if (this.erSisteSteg(nyttStegNummer)) {
      await lagreSoknadHandler();
    }
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
    return (
      <div className="stegvelger panelSeksjon">
        <StegLinje steg={this.state.aktuelleSteg} stegKlikk={this.tilSteg} />
        {
          this.state.aktuelleSteg.map(item => <StegFane key={item.id} faneData={item} />)
        }
      </div>
    );
  }
}

Stegvelger.propTypes = {
  arbeidsgivereIPerioden: PT.array,
  avklartefakta: PT.array,
  begrunnelser: PT.object,
  hentInngang: PT.func.isRequired,
  hentVilkar: PT.func.isRequired,
  sendVilkar: PT.func.isRequired,
  hentAvklartefakta: PT.func.isRequired,
  sendAvklartefakta: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  history: PT.object.isRequired,
  fatteVedtak: PT.func.isRequired,
  lagreSoknadHandler: PT.func.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk),
  inngang: PT.object,
  match: PT.object.isRequired,
  oppdaterAvklarteFaktaState: PT.func.isRequired,
  oppdaterVilkarState: PT.func.isRequired,
  oppdaterLokalSoknadHandler: PT.func.isRequired,
  oppsummering: MPT.Oppsummering,
  saksopplysninger: PT.object.isRequired,
  settSkjemaVerdi: PT.func.isRequired,
  skjema: PT.object.isRequired,
  valgteArbeidsgivere: PT.array,
};

Stegvelger.defaultProps = {
  arbeidsgivereIPerioden: [],
  avklartefakta: [],
  begrunnelser: {},
  inngang: {},
  landkoder: [],
  oppsummering: [],
  valgteArbeidsgivere: [],
};

const mapStateToProps = state => ({
  arbeidsgivereIPerioden: avklartefaktaSelectors.ArbeidsgivereIPeriodenSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vilkar: vilkarSelectors.VilkarSelector(state),
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  begrunnelser: KodeverkSelectors.begrunnelserSelector(state),
  inngang: inngangSelectors.InngangSelector(state),
  landkoder: KodeverkSelectors.landkoderSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
  saksopplysninger: fagsakSelectors.SaksopplysningerSelector(state),
  valgteArbeidsgivere: avklartefaktaSelectors.AvklartefaktaValgteArbeidsgivereSelector(state),
});

/* eslint no-alert:off */
const mapDispatchToProps = dispatch => ({
  hentInngang: snr => dispatch(inngangOperations.hent(snr)),
  hentVilkar: behandlingID => dispatch(vilkarOperations.hent(behandlingID)),
  sendVilkar: (behandlingID, body) => dispatch(vilkarOperations.send(behandlingID, body)),
  fatteVedtak: (behandlingID, body) => dispatch(vedtakOperations.fatte(behandlingID, body)),
  hentAvklartefakta: behandlingID => dispatch(avklartefaktaOperations.hent(behandlingID)),
  sendAvklartefakta: (behandlingID, body) => dispatch(avklartefaktaOperations.send(behandlingID, body)),
  hentLovvalgsperioder: behandlingID => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
  sendLovvalgsperioder: (behandlingID, body) => dispatch(lovvalgsperioderOperations.send(behandlingID, body)),
  oppdaterAvklarteFaktaState: skjema => dispatch(avklartefaktaOperations.oppdaterAvklarteFaktaState(skjema)),
  oppdaterVilkarState: skjema => dispatch(vilkarOperations.oppdaterVilkarState(skjema)),
  oppdaterLovvalgperioderState: skjema => dispatch(lovvalgsperioderOperations.oppdaterLovvalgsperioderState(skjema)),
  settSkjemaVerdi: (felt, verdi) => dispatch(change('soknad', felt, verdi)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Stegvelger));
