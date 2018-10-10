import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as MPT from '../../proptypes/';

import StegLinje from './felles/stegLinje';
import StegFane from './felles/stegFane';
import StegVelger from './stegMotor';

import { fagsakSelectors } from '../../ducks/fagsaker/';
import { KodeverkSelectors } from '../../ducks/kodeverk/';
import { inngangOperations, inngangSelectors } from '../../ducks/inngang/';
import { avklartefaktaSelectors, avklartefaktaOperations } from '../../ducks/avklartefakta/';
import { formSelectors } from '../../ducks/form/';

import './stegvelger.css';

class Vilkarsveileder extends Component {
  state = { aktivtStegNummer: 0, aktuelleSteg: [] };

  componentWillMount() {
    const { snr } = this.props.match.params;
    this.props.hentInngang(snr);
  }

  componentWillReceiveProps(nextProps) {
    if (Object.keys(nextProps.avklartefakta).length > 0) {
      this.oppdaterAktuelleSteg(nextProps);
    }
  }

  /** Her vil validering på hver enkelt felt / fane kunne åpne
   * opp for nye tilgjengelige faner etter at saksbehandler
   * har bekreftet valgene.
   */
  bekreftOgFortsett = () => {
    this.tilSteg(this.beregnNesteSteg());
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
      lagreVedtakHandler: this.props.lagreVedtakHandler,
    };

    const propsLight = {
      avklartefakta: props.avklartefakta,
      saksopplysninger: props.saksopplysninger,
      inngang: props.inngang,
      skjema: props.skjema,
      landkoder: props.landkoder,
      arbeidsgivereIPerioden: props.arbeidsgivereIPerioden,
      begrunnelser: props.begrunnelser,
      tilgjengeligeHandlers,
    };

    const stegVelger = new StegVelger(propsLight);
    const aktuelleSteg = stegVelger.beregnAlleSteg();

    aktuelleSteg[this.state.aktivtStegNummer].aktivtSteg = true;

    this.setState({ aktuelleSteg });
    return aktuelleSteg;
  };

  /** Gå til et konkret steg i steglisten, angitt av en indeks
   * som begynnner med 0.
   * @param nyttStegNummer Number Steget som det skal byttes til.
   */
  tilSteg = async nyttStegNummer => {
    const { skjema, oppdaterAvklartefaktaState, lagreAvklartefaktaHandler } = this.props;
    this.setState({ aktivtStegNummer: nyttStegNummer });
    await oppdaterAvklartefaktaState(skjema);
    await lagreAvklartefaktaHandler();
  };

  /** Beregn neste steg i rekken, men ikke lenger enn
   * maks antall steg (til og med vedtak). Ved forsøk på å gå ytterligere steg
   * enn hva som er mulig skal funksjonen defaulte til det aktive stegnummeret.
   */
  beregnNesteSteg = () => {
    const maksSteg = this.state.aktuelleSteg.length;
    const { aktivtStegNummer } = this.state;
    return (aktivtStegNummer + 1 < maksSteg) ? aktivtStegNummer + 1 : aktivtStegNummer;
  };

  render() {
    return (
      <div className="vilkarsveileder panelSeksjon">
        <StegLinje steg={this.state.aktuelleSteg} stegKlikk={this.tilSteg} />
        {
          this.state.aktuelleSteg.map(item => <StegFane key={item.id} faneData={item} />)
        }
      </div>
    );
  }
}

Vilkarsveileder.propTypes = {
  arbeidsgivereIPerioden: PT.array,
  avklartefakta: PT.object,
  begrunnelser: PT.object,
  hentInngang: PT.func.isRequired,
  history: PT.object.isRequired,
  lagreAvklartefaktaHandler: PT.func.isRequired,
  lagreVedtakHandler: PT.func.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk),
  inngang: PT.object,
  match: PT.object.isRequired,
  oppdaterAvklartefaktaState: PT.func.isRequired,
  oppsummering: MPT.Oppsummering,
  saksopplysninger: PT.object.isRequired,
  skjema: PT.object.isRequired,
  valgteArbeidsgivere: PT.array,
};

Vilkarsveileder.defaultProps = {
  arbeidsgivereIPerioden: [],
  avklartefakta: {},
  begrunnelser: {},
  inngang: {},
  landkoder: [],
  oppsummering: [],
  valgteArbeidsgivere: [],
};

const mapStateToProps = state => ({
  arbeidsgivereIPerioden: avklartefaktaSelectors.ArbeidsgivereIPeriodenSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  begrunnelser: KodeverkSelectors.begrunnelserSelector(state),
  inngang: inngangSelectors.InngangSelector(state),
  landkoder: KodeverkSelectors.landkoderSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
  saksopplysninger: fagsakSelectors.SaksopplysningerSelector(state),
  valgteArbeidsgivere: avklartefaktaSelectors.AvklartefaktaValgteArbeidsgivereSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentInngang: snr => dispatch(inngangOperations.hent(snr)),
  oppdaterAvklartefaktaState: skjema => dispatch(avklartefaktaOperations.oppdaterAvklartefaktaState(skjema)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Vilkarsveileder));
