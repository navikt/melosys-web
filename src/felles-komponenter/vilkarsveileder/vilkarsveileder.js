import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as Ikon from '../../resources/images';
import * as MPT from '../../proptypes/';

import StegLinje from './felles/stegLinje';
import StegFane from './felles/stegFane';
import Motor from './stegLogikk/stegLogikk';

// Importer alle fanene
import VurderingArbeidsforhold from './vurderinger/vurderingArbeidsforhold';
import VurderingUtsending from './vurderinger/vurderingUtsending';
import VurderingSysselsetting from './vurderinger/vurderingSysselsetting';
import VurderingSektor from './vurderinger/vurderingSektor';
import VurderingVirksomhet from './vurderinger/vurderingVirksomhet';
import VurderingVedtak from './vurderinger/vurderingVedtak';

import { OppsummeringSelector } from '../../ducks/fagsaker';
import { FaktaavklaringSelector } from '../../ducks/faktaavklaring';

import './vilkarsveileder.css';

class Vilkarsveileder extends Component {
  componentWillMount() {
    this.setState({
      aktivtStegNummer: 0,
      aktuelleSteg: [],
      alleSteg: [
        {
          id: 'SYSSELSETTING',
          komponent: VurderingSysselsetting,
          data: {},
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: this.FANE_STATUS.BEHANDLET,
          ikoner: this.IKONER.STEG,
          tilgjengelig: true,
          aktivtSteg: true,
        },
        {
          id: 'ARBEIDSFORHOLD',
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
          id: 'UTSENDING',
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
          id: 'SEKTOR',
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
          id: 'VIRKSOMHET',
          komponent: VurderingVirksomhet,
          data: {},
          handlers: {
            bekreftOgFortsett: this.beOmVurdering,
          },
          status: this.FANE_STATUS.AKTIV,
          ikoner: this.IKONER.STEG,
          tilgjengelig: true,
        },
        {
          id: 'VEDTAK',
          komponent: VurderingVedtak,
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

  componentWillUpdate(nextProps) {
    if (JSON.stringify(this.props.faktaavklaring) !== JSON.stringify(nextProps.faktaavklaring)) {
      this.oppdaterAktuelleSteg(nextProps.faktaavklaring);
    }
  }

  /** Komponenten får ikke props fra faktaavklaring før den er lastet fra backend. Dvs at den er mountet
   * en god stund før dataene faktisk kommer. Lytt derfor til nye props, men bygg veilederen
   * kun én gang, men kjør oppdatering dersom faktaavklaring har endret seg siden sist.
   */
  componentDidUpdate(prevProps) {
    if (Object.keys(prevProps.faktaavklaring).length === 0 && Object.keys(this.props.faktaavklaring).length > 0) {
      this.tilSteg(0);
    }
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

  beOmVurdering = () => {
    this.props.beOmVurderingHandler();
    this.nesteSteg();
  }

  /** Her vil validering på hver enkelt felt / fane kunne åpne
   * opp for nye tilgjengelige faner etter at saksbehandler
   * har bekreftet valgene.
   */
  bekreftOgFortsett = () => {
    this.nesteSteg();
  }

  oppdaterAktuelleSteg = faktaavklaring => {
    const aktuelleSteg = this.state.alleSteg
      .filter(steg => Motor.beregnAlleSteg(faktaavklaring).includes(steg.id))
      .map((steg, index) => ({ ...steg, stegPosisjon: index, aktivtSteg: false }));

    aktuelleSteg[this.state.aktivtStegNummer].aktivtSteg = true;

    this.setState({ aktuelleSteg });
    return aktuelleSteg;
  }

  oppdaterNyttSteg = (forrigeStegNummer, nyttStegNummmer) => {
    const aktuelleSteg = [...this.state.aktuelleSteg];

    if (forrigeStegNummer) { aktuelleSteg[forrigeStegNummer].aktivtSteg = false; }
    if (forrigeStegNummer) { aktuelleSteg[forrigeStegNummer].status = this.FANE_STATUS.BEHANDLET; }
    aktuelleSteg[nyttStegNummmer].aktivtSteg = true;
    aktuelleSteg[nyttStegNummmer].stegPosisjon = nyttStegNummmer;
    aktuelleSteg[nyttStegNummmer].status = this.FANE_STATUS.AKTIV;
    aktuelleSteg[nyttStegNummmer].tilgjengelig = true;
  }

  /** Gå til et konkret steg i steglisten, angitt av en indeks
   * som begynnner med 0.
   * @param tilStegNummer Number Steget som det skal byttes til.
   */
  tilSteg = tilStegNummer => {
    const { aktivtStegNummer } = this.state;
    const aktuelleSteg = [...this.state.aktuelleSteg];

    if (aktuelleSteg.length === 0) { return; }

    this.oppdaterNyttSteg(aktivtStegNummer, tilStegNummer);

    this.setState({ aktuelleSteg });
    this.setState({ aktivtStegNummer: tilStegNummer });
  }

  /** Gå til neste steg i rekken, men ikke lenger enn
   * maks antall steg (til og med vedtak). Ved forsøk på å gå ytterligere steg
   * enn hva som er mulig skal funksjonen defaulte til siste steg.
   */
  nesteSteg = () => {
    // 1. Beregn kommende steg basert på valget som er gjort.
    const maksSteg = this.state.aktuelleSteg.length;
    const { aktivtStegNummer } = this.state;
    const nesteStegNummmer = (aktivtStegNummer + 1 < maksSteg) ? aktivtStegNummer + 1 : aktivtStegNummer;
    console.log('nesteStegNummmer', nesteStegNummmer);
    this.tilSteg(nesteStegNummmer);
  }

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
  history: PT.object.isRequired,
  person: MPT.Person.isRequired,
  vurdering: PT.object.isRequired,
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  fattVedtakHandler: PT.func.isRequired,
  beOmVurderingHandler: PT.func.isRequired,
  oppsummering: MPT.Oppsummering,
  faktaavklaring: PT.object,
};

Vilkarsveileder.defaultProps = {
  oppsummering: [],
  faktaavklaring: {},
};

const mapStateToProps = state => ({
  oppsummering: OppsummeringSelector(state),
  faktaavklaring: FaktaavklaringSelector(state).faktaavklaring,
});

export default withRouter(connect(mapStateToProps)(Vilkarsveileder));
