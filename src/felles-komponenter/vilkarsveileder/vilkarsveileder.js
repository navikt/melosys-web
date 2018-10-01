import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as MPT from '../../proptypes/';

import StegLinje from './felles/stegLinje';
import StegFane from './felles/stegFane';
import StegVelger from './stegVelger';

import { fagsakSelectors } from '../../ducks/fagsaker/';
import { KodeverkSelectors } from '../../ducks/kodeverk/';
import { vurderingOperations } from '../../ducks/vurdering/';
import { inngangOperations, inngangSelectors } from '../../ducks/inngang/';
import { avklartefaktaSelectors, avklartefaktaOperations } from '../../ducks/avklartefakta/';
import { soknadOperations } from '../../ducks/soknad/';
import { formSelectors } from '../../ducks/form/';

import './vilkarsveileder.css';

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

  /** Sjekker om det aktive steget som saksbehandler har klikket seg inn på
   * er det siste steget, altså Vedtak.
   */
  erDetteSisteSteg = totaltAntallSteg => (this.state.aktivtStegNummer === totaltAntallSteg - 1);

  fattVedtak = () => {
    /* eslint-disable no-alert */
    alert('Denne funksjonen er ikke ferdig implementert.');
    /* eslint-enable */
    // this.props.fattVedtakHandler();
  };

  beOmVurdering = () => {
    this.props.beOmVurderingHandler();
    this.tilSteg(this.beregnNesteSteg());
  };

  /** Her vil validering på hver enkelt felt / fane kunne åpne
   * opp for nye tilgjengelige faner etter at saksbehandler
   * har bekreftet valgene.
   */
  bekreftOgFortsett = () => {
    this.tilSteg(this.beregnNesteSteg());
  };

  oppdaterAktuelleSteg = props => {
    const { erDetteSisteSteg } = this;
    const tilgjengeligeHandlers = {
      bekreftOgFortsett: this.bekreftOgFortsett,
      fattVedtak: this.fattVedtak,
      beOmVurdering: this.beOmVurdering,
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

    if (erDetteSisteSteg()) {
      this.props.hentVurdering(this.props.oppsummering.behandlingID);
    }

    this.setState({ aktuelleSteg });
    return aktuelleSteg;
  };

  /** Gå til et konkret steg i steglisten, angitt av en indeks
   * som begynnner med 0.
   * @param nyttStegNummer Number Steget som det skal byttes til.
   */
  tilSteg = nyttStegNummer => {
    this.setState({ aktivtStegNummer: nyttStegNummer });
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
  beOmVurderingHandler: PT.func.isRequired,
  avklartefakta: PT.object,
  fattVedtakHandler: PT.func.isRequired,
  hentBosted: PT.func.isRequired,
  hentInngang: PT.func.isRequired,
  hentVurdering: PT.func.isRequired,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  oppdaterAvklartefaktaState: PT.func.isRequired,
  oppsummering: MPT.Oppsummering,
  begrunnelser: PT.object,
  landkoder: PT.arrayOf(MPT.Kodeverk),
  inngang: PT.object,
  saksopplysninger: PT.object.isRequired,
  sendSoknad: PT.func.isRequired,
  skjema: PT.object.isRequired,
  valgteArbeidsgivere: PT.array,
};

Vilkarsveileder.defaultProps = {
  arbeidsgivereIPerioden: [],
  begrunnelser: {},
  avklartefakta: {},
  inngang: {},
  oppsummering: [],
  valgteArbeidsgivere: [],
  landkoder: [],
};

const mapStateToProps = state => ({
  arbeidsgivereIPerioden: avklartefaktaSelectors.ArbeidsgivereIPeriodenSelector(state),
  begrunnelser: KodeverkSelectors.begrunnelserSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  inngang: inngangSelectors.InngangSelector(state),
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  saksopplysninger: fagsakSelectors.SaksopplysningerSelector(state),
  landkoder: KodeverkSelectors.landkoderSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
  valgteArbeidsgivere: avklartefaktaSelectors.AvklartefaktaValgteArbeidsgivereSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentBosted: behandlingID => dispatch(avklartefaktaOperations.hentBosted(behandlingID)),
  hentInngang: snr => dispatch(inngangOperations.hent(snr)),
  hentVurdering: behandlingID => dispatch(vurderingOperations.hent(behandlingID)),
  oppdaterAvklartefaktaState: skjema => dispatch(avklartefaktaOperations.oppdaterAvklartefaktaState(skjema)),
  sendSoknad: (behandlingID, soknad) => dispatch(soknadOperations.send(behandlingID, soknad)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Vilkarsveileder));
