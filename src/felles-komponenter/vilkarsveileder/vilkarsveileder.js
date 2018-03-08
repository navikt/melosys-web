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
import VurderingYrkesaktivitetFordeling from './vurderinger/vurderingYrkesaktivitetFordeling';
import VurderingAktivitet from './vurderinger/vurderingAktivitet';
import VurderingUtsending from './vurderinger/vurderingUtsending';
import VurderingSysselsetting from './vurderinger/vurderingSysselsetting';
import VurderingSektor from './vurderinger/vurderingSektor';
import VurderingVirksomhet from './vurderinger/vurderingVirksomhet';
import VurderingBostedsland from './vurderinger/vurderingBostedsland';
import VurderingTjenestemann from './vurderinger/vurderingTjenestemann';
import VurderingForretningssted from './vurderinger/vurderingForretningssted';
import VurderingVedtak from './vurderinger/vurderingVedtak';

import { OppsummeringSelector, ArbeidsforholdeneSelector } from '../../ducks/fagsaker';
import { hentVurdering } from '../../ducks/vurdering';
import { FaktaavklaringSelector, FaktaavklaringValgteArbeidsforholdDetaljerSelector, RelevanteArbeidsforholdeneSelector, oppdaterFaktaavklaringState } from '../../ducks/faktaavklaring';
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
          dataHenter: () => ({}),
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
          aktivtSteg: true,
        },
        {
          id: 'SYSSELSETTING',
          komponent: VurderingSysselsetting,
          dataHenter: () => ({}),
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
          aktivtSteg: true,
        },
        {
          id: 'ARBEIDSFORHOLD',
          komponent: VurderingArbeidsforhold,
          dataHenter: props => ({ relevanteArbeidsforholdene: props.relevanteArbeidsforholdene }),
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'YRKESAKTIVITET_FORDELING',
          komponent: VurderingYrkesaktivitetFordeling,
          dataHenter: () => ({}),
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'AKTIVITET',
          komponent: VurderingAktivitet,
          dataHenter: () => ({}),
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'UTSENDING',
          komponent: VurderingUtsending,
          dataHenter: () => ({}),
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'SEKTOR',
          komponent: VurderingSektor,
          dataHenter: () => ({}),
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'BOSTEDSLAND',
          komponent: VurderingBostedsland,
          dataHenter: () => ({}),
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'FORRETNINGSSTED',
          komponent: VurderingForretningssted,
          dataHenter: props => ({ valgteArbeidsforhold: props.valgteArbeidsforhold }),
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'TJENESTEMANN',
          komponent: VurderingTjenestemann,
          dataHenter: () => ({}),
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'VIRKSOMHET',
          komponent: VurderingVirksomhet,
          dataHenter: () => ({}),
          handlers: {
            bekreftOgFortsett: this.bekreftOgFortsett,
          },
          status: FANE_STATUS.OK,
        },
        {
          id: 'VEDTAK',
          komponent: VurderingVedtak,
          dataHenter: () => ({}),
          handlers: {
            fattVedtakHandler: () => { this.fattVedtak(); this.beOmVurdering(); },
          },
          status: FANE_STATUS.OK,
        },
      ],
    });
  }

  componentWillReceiveProps(nextProps) {
    if (Object.keys(nextProps.faktaavklaring).length > 0) {
      this.oppdaterAktuelleSteg(nextProps);
    }
  }

  /** Sjekker om det aktive steget som saksbehandler har klikket seg inn på
   * er det siste steget, altså Vedtak.
   */
  erDetteSisteSteg = totaltAntallSteg => (this.state.aktivtStegNummer === totaltAntallSteg - 1);

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

  oppdaterAktuelleSteg = props => {
    const { faktaavklaring, skjema } = props;
    const { erDetteSisteSteg } = this;
    const beregnedeSteg = StegLogikk.beregnAlleSteg(faktaavklaring);

    const aktuelleSteg = beregnedeSteg
      .map(aktueltSteg => this.state.alleSteg.find(steg => steg.id === aktueltSteg))
      .map((steg, index) => ({
        ...steg,
        stegPosisjon: index,
        aktivtSteg: false,
        data: { ...steg.dataHenter(props), tilstand: TilstandsLogikk.beregnTilstand(steg.id, skjema) },
      }));

    aktuelleSteg[this.state.aktivtStegNummer].aktivtSteg = true;

    if (erDetteSisteSteg()) {
      this.props.hentVurdering(this.props.oppsummering.behandlingID);
    }

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
  arbeidsforholdene: MPT.Arbeidsforholdene,
  relevanteArbeidsforholdene: MPT.Arbeidsforholdene,
  fattVedtakHandler: PT.func.isRequired,
  beOmVurderingHandler: PT.func.isRequired,
  oppsummering: MPT.Oppsummering,
  faktaavklaring: PT.object,
  skjema: PT.object.isRequired,
  valgteArbeidsforhold: PT.array,
  oppdaterFaktaavklaringState: PT.func.isRequired,
  hentVurdering: PT.func.isRequired,
};

Vilkarsveileder.defaultProps = {
  oppsummering: [],
  faktaavklaring: {},
  arbeidsforholdene: [],
  relevanteArbeidsforholdene: [],
  valgteArbeidsforhold: {},
};

const mapStateToProps = state => ({
  oppsummering: OppsummeringSelector(state),
  faktaavklaring: FaktaavklaringSelector(state).faktaavklaring,
  valgteArbeidsforhold: FaktaavklaringValgteArbeidsforholdDetaljerSelector(state),
  arbeidsforholdene: ArbeidsforholdeneSelector(state),
  relevanteArbeidsforholdene: RelevanteArbeidsforholdeneSelector(state),
  skjema: SoknadenFormSelector(state).values,
});

const mapDispatchToProps = dispatch => ({
  oppdaterFaktaavklaringState: skjema => dispatch(oppdaterFaktaavklaringState(skjema)),
  hentVurdering: behandlingID => dispatch(hentVurdering(behandlingID)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Vilkarsveileder));
