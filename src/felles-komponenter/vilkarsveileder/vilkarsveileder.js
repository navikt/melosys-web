import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as Ikon from '../../resources/images';
import * as MPT from '../../proptypes/';

import StegLinje from './komponenter/stegLinje';
import StegFane from './komponenter/stegFane';

import OppretteSak from './faneinnhold/oppretteSak';
import StartBehandling from './faneinnhold/startBehandling';
import VurderingArbeidstype from './faneinnhold/vurderingArbeidstype';
import VurderingSektor from './faneinnhold/vurderingSektor';
import VurderingLand from './faneinnhold/vurderingLand';
import Vedtak from './faneinnhold/vedtak';

import './vilkarsveileder.css';

class Vilkarsveileder extends Component {
  static propTypes = {
    history: PT.object.isRequired,
    person: MPT.Person.isRequired,
  };

  static defaultProps = {
    history: {},
  };

  /** Hver fane kan ha en rekke forskjellige statuser som er ment å indikere
   * feil eller varsler som saksbehandleren må håndtere.
   *
   * @type {{UBEHANDLET: string, AKTIV: string, BEHANDLET: string, ADVARSEL: string, FEIL: string}}
   */
  static status = {
    UBEHANDLET: 'UBEHANDLET',
    AKTIV: 'AKTIV',
    BEHANDLET: 'BEHANDLET',
    ADVARSEL: 'ADVARSEL',
    FEIL: 'FEIL',
  };

  /** Avhengig av status viser StegLinjen (med StegIkon) tilhørende status-ikon.
   *
   * @type {{UBEHANDLET, AKTIV, BEHANDLET, ADVARSEL, FEIL}}
   */
  static stegIkoner = {
    UBEHANDLET: Ikon.Ubehandlet,
    AKTIV: Ikon.Aktivt,
    BEHANDLET: Ikon.Ferdig,
    ADVARSEL: Ikon.Varsel,
    FEIL: Ikon.Feil,
  };

  /** Vedtak (siste fane) har egne ikonsett
   *
   * @type {{UBEHANDLET, AKTIV, BEHANDLET, ADVARSEL, FEIL}}
   */
  static vedtakIkoner = {
    UBEHANDLET: Ikon.VedakUbehandlet,
    AKTIV: Ikon.VedtakGodkjent,
    BEHANDLET: Ikon.VedtakGodkjent,
    ADVARSEL: Ikon.VedtakAvslatt,
    FEIL: Ikon.VedtakAvslatt,
  };

  componentWillMount() {
    this.setState({
      aktivtSteg: 0,
      steg: [
        { status: Vilkarsveileder.status.AKTIV, id: 0, ikoner: Vilkarsveileder.stegIkoner, tilgjengelig: true },
        { status: Vilkarsveileder.status.UBEHANDLET, id: 1, ikoner: Vilkarsveileder.stegIkoner, tilgjengelig: false },
        { status: Vilkarsveileder.status.UBEHANDLET, id: 2, ikoner: Vilkarsveileder.stegIkoner, tilgjengelig: false },
        { status: Vilkarsveileder.status.FEIL, id: 3, ikoner: Vilkarsveileder.stegIkoner, tilgjengelig: false },
        { status: Vilkarsveileder.status.UBEHANDLET, id: 4, ikoner: Vilkarsveileder.stegIkoner, tilgjengelig: false },
        { status: Vilkarsveileder.status.UBEHANDLET, id: 5, ikoner: Vilkarsveileder.vedtakIkoner, tilgjengelig: false },
      ] });
  }

  /** Her vil validering på hver enkelt felt / fane kunne åpne
   * opp for nye tilgjengelige faner etter at saksbehandler
   * har bekreftet valgene.
   */
  bekreftOgFortsett = () => {
    // 'this' for å henvise til class.
    this.nesteSteg();
  }

  /** Setter igang behandling av en ny sak. Her vil vi legge inn
   * evt action dispatch for async API requests, men TBA enn så lenge.
   *
   */
  startBehandling = () => {
    this.nesteSteg();
  }

  avbrytOpprettSak = () => {
    this.props.history.push(`/?fnr=${this.props.person.fnr}`);
  }

  /** Gå til et konkret steg i steglisten, angitt av en indeks
   * som begynnner med 0.
   * @param nyttSteg Number Steget som det skal byttes til.
   */
  tilSteg = nyttStegNummer => {
    const nyStegIkonState = { ...this.state.steg[nyttStegNummer] };
    const gammelStegIkonState = { ...this.state.steg[this.state.aktivtSteg] };
    nyStegIkonState.status = Vilkarsveileder.status.AKTIV;
    nyStegIkonState.tilgjengelig = true;
    gammelStegIkonState.status = Vilkarsveileder.status.BEHANDLET;

    const nyeSteg = [...this.state.steg];
    nyeSteg[this.state.aktivtSteg] = gammelStegIkonState;
    nyeSteg[nyttStegNummer] = nyStegIkonState;

    this.setState({ steg: nyeSteg });
    this.setState({ aktivtSteg: nyttStegNummer });
  }

  /** Gå til neste steg i rekken, men ikke lenger enn
   * maks antall steg. Ved forsøk på å gå ytterligere steg
   * enn hva som er mulig skal funksjonen defaulte til siste steg.
   */
  nesteSteg = () => {
    const maksSteg = this.state.steg.length;
    const nyttSteg = (this.state.aktivtSteg + 1 < maksSteg) ? this.state.aktivtSteg + 1 : this.state.aktivtSteg;
    this.tilSteg(nyttSteg);
  }

  render() {
    const { aktivtSteg } = this.state;

    return (
      <div className="vilkarsveileder panelSeksjon">
        <StegLinje steg={this.state.steg} stegKlikk={this.tilSteg} />
        <StegFane stegNummer={0} aktivtSteg={aktivtSteg}>
          <OppretteSak
            bekreftOgFortsett={this.bekreftOgFortsett}
            avbrytOpprettSak={this.avbrytOpprettSak}
          />
        </StegFane>
        <StegFane stegNummer={1} aktivtSteg={aktivtSteg}>
          <StartBehandling
            startBehandling={this.startBehandling}
          />
        </StegFane>
        <StegFane stegNummer={2} aktivtSteg={aktivtSteg}>
          <VurderingArbeidstype
            bekreftOgFortsett={this.bekreftOgFortsett}
          />
        </StegFane>
        <StegFane stegNummer={3} aktivtSteg={aktivtSteg}>
          <VurderingSektor
            bekreftOgFortsett={this.bekreftOgFortsett}
          />
        </StegFane>
        <StegFane stegNummer={4} aktivtSteg={aktivtSteg}>
          <VurderingLand
            bekreftOgFortsett={this.bekreftOgFortsett}
          />
        </StegFane>
        <StegFane stegNummer={5} aktivtSteg={aktivtSteg}>
          <Vedtak />
        </StegFane>
      </div>
    );
  }
}

export default withRouter(Vilkarsveileder);
