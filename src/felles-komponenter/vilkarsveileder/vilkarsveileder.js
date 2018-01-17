import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as Ikon from '../../resources/images';
import * as MPT from '../../proptypes/';

import StegLinje from './komponenter/stegLinje';
import StegFane from './komponenter/stegFane';

import VurderingArbeidsforhold from './faneinnhold/vurderingArbeidsforhold';
import VurderingUtsending from './faneinnhold/vurderingUtsending';
import VurderingArbeidstype from './faneinnhold/vurderingArbeidstype';
import VurderingSektor from './faneinnhold/vurderingSektor';
import VurderingVirksomhet from './faneinnhold/vurderingVirksomhet';
import Vedtak from './faneinnhold/vedtak';

import { OppsummeringSelector } from '../../ducks/fagsaker';

import './vilkarsveileder.css';

class Vilkarsveileder extends Component {
  componentWillMount() {
    this.setState({
      aktivtSteg: 4,
      steg: [
        {
          id: 'VURDERING_ARBEIDSTYPE',
          komponent: VurderingArbeidstype,
          data: {},
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: this.FANE_STATUS.BEHANDLET,
          ikoner: this.IKONER.STEG,
          tilgjengelig: true,
        },
        {
          id: 'VURDERING_ARBEIDSFORHOLD',
          komponent: VurderingArbeidsforhold,
          data: {
            arbeidsforholdene: this.props.arbeidsforholdene,
          },
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: this.FANE_STATUS.BEHANDLET,
          ikoner: this.IKONER.STEG,
          tilgjengelig: true,
        },
        {
          id: 'VURDERING_UTSENDING',
          komponent: VurderingUtsending,
          data: {},
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: this.FANE_STATUS.BEHANDLET,
          ikoner: this.IKONER.STEG,
          tilgjengelig: true,
        },
        {
          id: 'VURDERING_SEKTOR',
          komponent: VurderingSektor,
          data: {},
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: this.FANE_STATUS.BEHANDLET,
          ikoner: this.IKONER.STEG,
          tilgjengelig: true,
        },
        {
          id: 'VURDERING_VIRKSOMHET',
          komponent: VurderingVirksomhet,
          data: {},
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: this.FANE_STATUS.AKTIV,
          ikoner: this.IKONER.STEG,
          tilgjengelig: true,
          aktivtSteg: true,
        },
        {
          id: 'VEDTAK',
          komponent: Vedtak,
          data: {},
          handlers: {
            fattVedtakHandler: this.fattVedtak,
          },
          status: this.FANE_STATUS.UBEHANDLET,
          ikoner: this.IKONER.VEDTAK,
          tilgjengelig: false,
        },
      ],
    });
  }

  componentDidMount() {
    this.tilSteg(4);
  }

  /** Hver fane kan ha en rekke forskjellige statuser som er ment å indikere
   * feil eller varsler som saksbehandleren må håndtere.
   *
   * @type {{UBEHANDLET: string, AKTIV: string, BEHANDLET: string, ADVARSEL: string, FEIL: string}}
   */
  FANE_STATUS = {
    UBEHANDLET: 'UBEHANDLET',
    AKTIV: 'AKTIV',
    BEHANDLET: 'BEHANDLET',
    ADVARSEL: 'ADVARSEL',
    FEIL: 'FEIL',
  };

  /** Avhengig av status viser StegLinjen (med StegIkon) tilhørende status-ikon.
   *
   */
  IKONER = {
    STEG: {
      UBEHANDLET: Ikon.Ubehandlet,
      AKTIV: Ikon.Aktivt,
      BEHANDLET: Ikon.Ferdig,
      ADVARSEL: Ikon.Varsel,
      FEIL: Ikon.Feil,
    },
    VEDTAK: {
      UBEHANDLET: Ikon.VedakUbehandlet,
      AKTIV: Ikon.VedtakGodkjent,
      BEHANDLET: Ikon.VedtakGodkjent,
      ADVARSEL: Ikon.VedtakAvslatt,
      FEIL: Ikon.VedtakAvslatt,
    },
  }

  fattVedtak = () => {
    this.props.fattVedtakHandler();
  }

  /** Her vil validering på hver enkelt felt / fane kunne åpne
   * opp for nye tilgjengelige faner etter at saksbehandler
   * har bekreftet valgene.
   */
  bekreftOgFortsett = () => {
    // 'this' for å henvise til class.
    this.nesteSteg();
  }

  /** Saken er allerede opprettet, så denne funksjonen router kun brukeren tilbake til søket
   * på forsiden uten å sende request til backend om at saksbehandlingen ble avbrutt. (Avgjørelse for V0 pr des2017)
   */
  avbrytVurdering = () => {
    this.props.history.push(`/?fnr=${this.props.person.fnr}`);
  }


  /** Gå til et konkret steg i steglisten, angitt av en indeks
   * som begynnner med 0.
   * @param nyttStegNummer Number Steget som det skal byttes til.
   */
  tilSteg = nyttStegNummer => {
    const nyeSteg = [...this.state.steg];

    // Oppdater både aktivt stegobjekt og nytt stegobjekt. Disse er allerede linket inn som props
    // til child components og gjør at hver enkelt fane oppdaterer tilsvarende. Det samme gjelder
    // StegLinje som viser ikonene ovenfor hver fane.
    nyeSteg[this.state.aktivtSteg].aktivtSteg = false;
    nyeSteg[this.state.aktivtSteg].status = this.FANE_STATUS.BEHANDLET;
    nyeSteg[nyttStegNummer].aktivtSteg = true;
    nyeSteg[nyttStegNummer].stegPosisjon = nyttStegNummer;
    nyeSteg[nyttStegNummer].status = this.FANE_STATUS.AKTIV;
    nyeSteg[nyttStegNummer].tilgjengelig = true;

    this.setState({ steg: nyeSteg });
    this.setState({ aktivtSteg: nyttStegNummer });
  }

  /** Gå til neste steg i rekken, men ikke lenger enn
   * maks antall steg (til og med vedtak). Ved forsøk på å gå ytterligere steg
   * enn hva som er mulig skal funksjonen defaulte til siste steg.
   */
  nesteSteg = () => {
    const maksSteg = this.state.steg.length;
    const nyttSteg = (this.state.aktivtSteg + 1 < maksSteg) ? this.state.aktivtSteg + 1 : this.state.aktivtSteg;
    this.tilSteg(nyttSteg);
  }

  render() {
    return (
      <div className="vilkarsveileder panelSeksjon">
        <StegLinje steg={this.state.steg} stegKlikk={this.tilSteg} />
        {
          this.state.steg.map(item => <StegFane key={item.id} faneData={item} />)
        }
      </div>
    );
  }
}

Vilkarsveileder.propTypes = {
  history: PT.object.isRequired,
  person: MPT.Person.isRequired,
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  fattVedtakHandler: PT.func.isRequired,
  oppsummering: MPT.Oppsummering,
};

Vilkarsveileder.defaultProps = {
  oppsummering: [],
};

const mapStateToProps = state => ({
  oppsummering: OppsummeringSelector(state),
});

export default withRouter(connect(mapStateToProps)(Vilkarsveileder));
