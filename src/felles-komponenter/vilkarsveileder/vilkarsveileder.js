import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as MPT from '../../proptypes/';

import StegLinje from './felles/stegLinje';
import StegFane from './felles/stegFane';
import StegLogikk from './stegLogikk/stegLogikk';
import TilstandsLogikk from './stegLogikk/tilstandsLogikk';

import { FANE_STATUS } from './stegLogikk/typer';

// Importer alle fanene
import VurderingPeriode from './vurderinger/vurderingPeriode';
import VurderingArbeidsforhold from './vurderinger/vurderingArbeidsforhold';
import VurderingAktivitet from './vurderinger/vurderingAktivitet';
import VurderingUtsending from './vurderinger/vurderingUtsending';
import VurderingSysselsetting from './vurderinger/vurderingSysselsetting';
import VurderingSektor from './vurderinger/vurderingSektor';
import VurderingVirksomhet from './vurderinger/vurderingVirksomhet';
import VurderingBostedsland from './vurderinger/vurderingBostedsland';
import VurderingTjenestemann from './vurderinger/vurderingTjenestemann';
import VurderingVedtak from './vurderinger/vurderingVedtak';

import { OppsummeringSelector } from '../../ducks/fagsaker';
import { FaktaavklaringSelector } from '../../ducks/faktaavklaring';
import { SoknadenFormSelector } from '../../ducks/form';

import './vilkarsveileder.css';

class Vilkarsveileder extends Component {
  componentWillMount() {
    this.setState({
      aktivtStegNummer: 0,
      aktuelleSteg: [],
      alleSteg: [
        {
          id: 'PERIODE',
          komponent: VurderingPeriode,
          data: {},
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
          aktivtSteg: true,
        },
        {
          id: 'SYSSELSETTING',
          komponent: VurderingSysselsetting,
          data: {},
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
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
          status: FANE_STATUS.OK,
        },
        {
          id: 'AKTIVITET',
          komponent: VurderingAktivitet,
          data: {
          },
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'UTSENDING',
          komponent: VurderingUtsending,
          data: {},
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'SEKTOR',
          komponent: VurderingSektor,
          data: {},
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'BOSTEDSLAND',
          komponent: VurderingBostedsland,
          data: {},
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'TJENESTEMANN',
          komponent: VurderingTjenestemann,
          data: {},
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'VIRKSOMHET',
          komponent: VurderingVirksomhet,
          data: {},
          handlers: {
            bekreftOgFortsett: this.beOmVurdering,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'VEDTAK',
          komponent: VurderingVedtak,
          data: {},
          handlers: {
            fattVedtakHandler: this.fattVedtak,
          },
          status: FANE_STATUS.OK,
        },
      ],
    });
  }

  componentWillReceiveProps(nextProps) {
    if (Object.keys(nextProps.faktaavklaring).length > 0) {
      this.oppdaterAktuelleSteg(nextProps.faktaavklaring, nextProps.skjema);
    }
  }

  fattVedtak = () => {
    this.props.fattVedtakHandler();
  }

  beOmVurdering = () => {
    this.props.beOmVurderingHandler();
    this.tilSteg(this.beregnNesteSteg());
  }

  /** Her vil validering på hver enkelt felt / fane kunne åpne
   * opp for nye tilgjengelige faner etter at saksbehandler
   * har bekreftet valgene.
   */
  bekreftOgFortsett = () => {
    this.tilSteg(this.beregnNesteSteg());
  }

  oppdaterAktuelleSteg = (faktaavklaring, skjema) => {
    const beregnedeSteg = StegLogikk.beregnAlleSteg(faktaavklaring);

    const aktuelleSteg = beregnedeSteg
      .map(aktueltSteg => this.state.alleSteg.find(steg => steg.id === aktueltSteg))
      .map((steg, index) => ({
        ...steg,
        stegPosisjon: index,
        aktivtSteg: false,
        data: { ...steg.data, tilstand: TilstandsLogikk.beregnTilstand(steg.id, skjema) },
      }));

    aktuelleSteg[this.state.aktivtStegNummer].aktivtSteg = true;
    aktuelleSteg[this.state.aktivtStegNummer].status = FANE_STATUS.AKTIV;

    this.setState({ aktuelleSteg });
    return aktuelleSteg;
  }

  /** Gå til et konkret steg i steglisten, angitt av en indeks
   * som begynnner med 0.
   * @param nyttStegNummer Number Steget som det skal byttes til.
   */
  tilSteg = nyttStegNummer => {
    this.setState({ aktivtStegNummer: nyttStegNummer });
  }

  /** Beregn neste steg i rekken, men ikke lenger enn
   * maks antall steg (til og med vedtak). Ved forsøk på å gå ytterligere steg
   * enn hva som er mulig skal funksjonen defaulte til det aktive stegnummeret.
   */
  beregnNesteSteg = () => {
    const maksSteg = this.state.aktuelleSteg.length;
    const { aktivtStegNummer } = this.state;
    return (aktivtStegNummer + 1 < maksSteg) ? aktivtStegNummer + 1 : aktivtStegNummer;
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
  skjema: PT.object.isRequired,
};

Vilkarsveileder.defaultProps = {
  oppsummering: [],
  faktaavklaring: {},
};

const mapStateToProps = state => ({
  oppsummering: OppsummeringSelector(state),
  faktaavklaring: FaktaavklaringSelector(state).faktaavklaring,
  skjema: SoknadenFormSelector(state).values,
});

export default withRouter(connect(mapStateToProps)(Vilkarsveileder));
