import React, { Component } from 'react';
import { connect } from 'react-redux';

import PT from 'prop-types';

import * as Utils from '../../../../utils';
import * as Nav from '../../../../utils/navFrontend';

import { redigerbartSelectors } from '../../../../ducks/redigerbart';
import { behandlingsgrunnlagSelectors, behandlingsgrunnlagOperations } from '../../../../ducks/behandlingsgrunnlag';

import SoknadsperiodeEndring from './soknadsperiodeEndring';

import './soknadsperiode.css';

export class Soknadsperiode extends Component {
  state = {
    erEndrePeriodeSynlig: false,
    erPeriodeOppdatertOgGyldig: false,
    soknadsperiodeNyFom: '',
    soknadsperiodeNyTom: '',
  };

  componentDidUpdate(prevProps) {
    const { soknadsperiodeFom, soknadsperiodeTom } = this.props;
    if (prevProps.soknadsperiodeFom === soknadsperiodeFom && prevProps.soknadsperiodeTom === soknadsperiodeTom) {
      return;
    }

    this.kopierPeriodeTilLokalState(soknadsperiodeFom, soknadsperiodeTom);
  }

  kopierPeriodeTilLokalState = (soknadsperiodeNyFom, soknadsperiodeNyTom) => {
    this.setState(state => ({
      ...state,
      soknadsperiodeNyFom,
      soknadsperiodeNyTom,
    }));
  };

  visEndrePeriode = () => {
    const { soknadsperiodeFom, soknadsperiodeTom } = this.props;

    this.kopierPeriodeTilLokalState(soknadsperiodeFom, soknadsperiodeTom);
    this.setState({ erEndrePeriodeSynlig: true });
  };

  skjulEndrePeriode = () => this.setState({ erEndrePeriodeSynlig: false });

  oppdaterFelt = (feltNavn, verdi) => {
    this.setState({ [feltNavn]: verdi });

    const erPeriodeOppdatertOgGyldig = this.validerDato('soknadsperiodeNyFom') && this.validerDato('soknadsperiodeNyTom');
    this.setState({ erPeriodeOppdatertOgGyldig });
  };

  validerDato = feltNavn => {
    const verdi = this.state[feltNavn];
    const vasketVerdi = Utils.dato.vaskInputDato(verdi);
    return vasketVerdi !== false;
  };

  validerFelter = () => {
    const erPeriodeOppdatertOgGyldig = this.vaskOgValiderDato('soknadsperiodeNyFom') &&
                                       this.vaskOgValiderDato('soknadsperiodeNyTom') &&
      Utils.dato.erGyldigPeriode(this.state.soknadsperiodeNyFom, this.state.soknadsperiodeNyTom);

    this.setState({ erPeriodeOppdatertOgGyldig });
  };

  vaskOgValiderDato = feltNavn => {
    const gyldigDato = this.validerDato(feltNavn);
    if (gyldigDato) {
      const verdi = this.state[feltNavn];
      const vasketVerdi = Utils.dato.vaskInputDato(verdi);
      this.setState({ [feltNavn]: vasketVerdi });
    } else {
      this.setState({ [feltNavn]: 'Ugyldig' });
    }
    return gyldigDato;
  };

  oppdaterPeriode = event => {
    event.preventDefault();
    const { soknadsperiodeNyFom, soknadsperiodeNyTom } = this.state;
    const periode = { fom: Utils.dato.formatterDatoTilISO(soknadsperiodeNyFom), tom: Utils.dato.formatterDatoTilISO(soknadsperiodeNyTom) };
    this.props.oppdaterPeriode(periode);
    // Todo: Denne er hacky. Bakgrunn: oppdatert soknad rekker ikke å re-propagate til parent før
    // funksjonen nedenfor kalles. Vurder å skrive om til en async await-aktig løsning.
    setTimeout(() => this.props.lagreSoknadOgOppfriskSaksopplysninger(), 0);
  };

  avbryt = event => {
    event.preventDefault();
    const { soknadsperiodeFom, soknadsperiodeTom } = this.props;
    this.setState(state => ({
      ...state,
      soknadsperiodeNyFom: soknadsperiodeFom,
      soknadsperiodeNyTom: soknadsperiodeTom,
    }));
    this.skjulEndrePeriode();
  };

  render () {
    const { redigerbart, soknadsperiodeFom, soknadsperiodeTom } = this.props;
    const {
      visEndrePeriode, skjulEndrePeriode, validerFelter, oppdaterPeriode, oppdaterFelt, avbryt,
    } = this;

    const {
      erEndrePeriodeSynlig, soknadsperiodeNyFom, soknadsperiodeNyTom,
    } = this.state;

    return (
      <div className="soknadsperiode">
        {
          !erEndrePeriodeSynlig && (
            <Nav.Row>
              <Nav.Column xs="12">
                <Nav.typo.Element>{soknadsperiodeFom} - {soknadsperiodeTom}</Nav.typo.Element>
                <p>Dersom søkeren har meldt inn en endring i søknadsperioden, kan du endre og oppdatere saksopplysningene her:</p>
                <div className="knapper">
                  <Nav.Hovedknapp disabled={!redigerbart} onClick={visEndrePeriode}>Endre søknadsperioden</Nav.Hovedknapp>
                </div>
              </Nav.Column>
            </Nav.Row>
          )
        }
        {
          erEndrePeriodeSynlig &&
          <SoknadsperiodeEndring
            soknadsperiodeNyFom={soknadsperiodeNyFom}
            soknadsperiodeNyTom={soknadsperiodeNyTom}
            skjulEndrePeriode={skjulEndrePeriode}
            oppdaterPeriode={oppdaterPeriode}
            vedFeltEndring={oppdaterFelt}
            vedFeltFokusUt={validerFelter}
            erDatoerGyldig={this.state.erPeriodeOppdatertOgGyldig}
            avbryt={avbryt}
          />
        }
      </div>
    );
  }
}

Soknadsperiode.propTypes = {
  redigerbart: PT.bool.isRequired,
  oppdaterPeriode: PT.func.isRequired,
  lagreSoknadOgOppfriskSaksopplysninger: PT.func.isRequired,
  soknadsperiodeFom: PT.string.isRequired,
  soknadsperiodeTom: PT.string.isRequired,
};

const mapStateToProps = state => ({
  soknadsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).fom),
  soknadsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).tom),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterPeriode: periode => dispatch(behandlingsgrunnlagOperations.oppdaterPeriode(periode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Soknadsperiode);
