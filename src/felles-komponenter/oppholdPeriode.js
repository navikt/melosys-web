import React, { Component } from 'react';
import { connect } from 'react-redux';

import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import { soknadSelectors, soknadOperations } from '../ducks/soknad';
import { KodeverkSelectors } from '../ducks/kodeverk';
import { fagsakOperations } from '../ducks/fagsaker';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import { formatterDatoTilNorsk, vaskInputDato, formatterDatoTilISO } from '../utils/dato';
import { verdiTilKode } from '../utils/kodeverk';

import './oppholdPeriode.css';
import ListevelgerEnkelt from './skjema/listevelger/listevelgerEnkelt';

const OppholdEndring = props => {
  const {
    oppholdUtlandNyFom,
    oppholdUtlandNyTom,
    oppholdsPeriodeEndringsBegrunnelse,
    vedFeltEndring,
    avbryt,
    oppdaterPeriode,
    alleBegrunnelser,
    vedFeltFokutUt,
  } = props;

  return (
    <Nav.Row>
      <Nav.Column xs="12">
        <Nav.Fieldset legend="Skriv inn korrigert søknadsperiode:">
          <Nav.Row>
            <Nav.Column xs="3">
              <Nav.Input
                bredde="S"
                label="Fra og med:"
                value={oppholdUtlandNyFom}
                onChange={event => vedFeltEndring('oppholdUtlandNyFom', event.target.value)}
                onBlur={() => vedFeltFokutUt('oppholdUtlandNyFom')}
              />
            </Nav.Column>
            <Nav.Column xs="3">
              <Nav.Input
                bredde="S"
                label="Til og med:"
                value={oppholdUtlandNyTom}
                onChange={event => vedFeltEndring('oppholdUtlandNyTom', event.target.value)}
                onBlur={() => vedFeltFokutUt('oppholdUtlandNyFom')}
              />
            </Nav.Column>
            <Nav.Column xs="6">
              <ListevelgerEnkelt
                label="Begrunnelse:"
                value={oppholdsPeriodeEndringsBegrunnelse}
                muligeValg={alleBegrunnelser}
                meta={{}}
                bredde="XL"
                tillatFritekst={false}
                onChange={event => vedFeltEndring('oppholdsPeriodeEndringsBegrunnelse', event.target.value)}
                onBlur={() => vedFeltFokutUt('oppholdsPeriodeEndringsBegrunnelse')}
              />
            </Nav.Column>
            <Nav.Column xs="12">
              <Nav.Hovedknapp onClick={oppdaterPeriode}>Oppdater saksopplysningene</Nav.Hovedknapp>
              <Nav.Knapp onClick={avbryt}>Avbryt</Nav.Knapp>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>
  );
};

OppholdEndring.propTypes = {
  alleBegrunnelser: PT.array.isRequired,
  avbryt: PT.func.isRequired,
  oppdaterPeriode: PT.func.isRequired,
  oppholdsPeriodeEndringsBegrunnelse: PT.string.isRequired,
  oppholdUtlandNyFom: PT.string.isRequired,
  oppholdUtlandNyTom: PT.string.isRequired,
  vedFeltEndring: PT.func.isRequired,
  vedFeltFokutUt: PT.func.isRequired,
};

class OppholdPeriode extends Component {
  state = {
    erEndrePeriodeSynlig: false,
    oppholdUtlandNyFom: '',
    oppholdUtlandNyTom: '',
    oppholdsPeriodeEndringsBegrunnelse: '',
  };

  componentDidUpdate(prevProps) {
    const { oppholdUtlandFom, oppholdUtlandTom } = this.props;
    if (prevProps.oppholdUtlandFom === oppholdUtlandFom && prevProps.oppholdUtlandTom === oppholdUtlandTom) {
      return;
    }

    this.kopierPeriodeTilLokalState(oppholdUtlandFom, oppholdUtlandTom);
  }

  kopierPeriodeTilLokalState = (oppholdUtlandNyFom, oppholdUtlandNyTom) => {
    this.setState(state => ({
      ...state,
      oppholdUtlandNyFom,
      oppholdUtlandNyTom,
    }));
  };

  visEndrePeriode = () => this.setState({ erEndrePeriodeSynlig: true });
  skjulEndrePeriode = () => this.setState({ erEndrePeriodeSynlig: false });

  vedFeltEndring = (feltNavn, verdi) => {
    this.setState({ [feltNavn]: verdi });
  };

  vedFeltFokutUt = feltNavn => {
    const verdi = this.state[feltNavn];
    const vasketVerdi = feltNavn === 'oppholdtUtlandNyTom' || feltNavn === 'oppholdUtlandNyFom' ? vaskInputDato(verdi) : verdi;
    this.setState({ [feltNavn]: vasketVerdi });
  };

  oppdaterPeriode = event => {
    event.preventDefault();
    const { alleBegrunnelser } = this.props;
    const { oppholdUtlandNyFom, oppholdUtlandNyTom } = this.state;
    const oppholdsPeriodeEndringsBegrunnelse = verdiTilKode(this.state.oppholdsPeriodeEndringsBegrunnelse, alleBegrunnelser);
    const periode = { fom: formatterDatoTilISO(oppholdUtlandNyFom), tom: formatterDatoTilISO(oppholdUtlandNyTom) };
    this.props.oppdaterPeriode(periode, oppholdsPeriodeEndringsBegrunnelse);
    this.props.oppfriskSaksopplysninger();
  };

  avbryt = event => {
    event.preventDefault();
    const { oppholdUtlandFom, oppholdUtlandTom } = this.props;
    this.setState(state => ({
      ...state,
      oppholdUtlandNyFom: oppholdUtlandFom,
      oppholdUtlandNyTom: oppholdUtlandTom,
      oppholdsPeriodeEndringsBegrunnelse: '',
    }));
    this.skjulEndrePeriode();
  };

  render () {
    const panelIkon = Ikoner.Ferdig;
    const { alleBegrunnelser, oppholdUtlandFom, oppholdUtlandTom } = this.props;
    const {
      visEndrePeriode, skjulEndrePeriode, vedFeltFokutUt, oppdaterPeriode, vedFeltEndring, avbryt,
    } = this;

    const {
      erEndrePeriodeSynlig, oppholdUtlandNyFom, oppholdUtlandNyTom, oppholdsPeriodeEndringsBegrunnelse,
    } = this.state;

    return (
      <div className="oppholdPeriode panelSeksjon">
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={panelIkon} tittel="Søknadsperiode" undertittel={`${oppholdUtlandFom} - ${oppholdUtlandTom}`} />}
          ariaTittel="Panel for søknadsperiode">
          <Nav.Container fluid>
            {
              !erEndrePeriodeSynlig && (
                <Nav.Row>
                  <Nav.Column xs="12">
                    <p>Dersom søker har meldt inn en endring i søknadsperioden, kan du gjøre dette her og deretter oppdatere saksopplysningene:</p>
                    <div className="knapper">
                      <Nav.Hovedknapp onClick={visEndrePeriode}>Endre søknadsperioden</Nav.Hovedknapp>
                    </div>
                  </Nav.Column>
                </Nav.Row>
              )
            }
            {
              erEndrePeriodeSynlig && <OppholdEndring
                oppholdUtlandNyFom={oppholdUtlandNyFom}
                oppholdUtlandNyTom={oppholdUtlandNyTom}
                oppholdsPeriodeEndringsBegrunnelse={oppholdsPeriodeEndringsBegrunnelse}
                skjulEndrePeriode={skjulEndrePeriode}
                alleBegrunnelser={alleBegrunnelser}
                oppdaterPeriode={oppdaterPeriode}
                vedFeltEndring={vedFeltEndring}
                vedFeltFokutUt={vedFeltFokutUt}
                avbryt={avbryt}
              />
            }
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

OppholdPeriode.propTypes = {
  oppdaterPeriode: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  oppholdUtlandFom: PT.string.isRequired,
  oppholdUtlandTom: PT.string.isRequired,
  oppholdsPeriodeEndringsBegrunnelse: PT.string.isRequired,
  alleBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
};

OppholdPeriode.propTypes = {
  soknadVerdier: MPT.SoknadForm,
};

OppholdPeriode.defaultProps = {
  soknadVerdier: {},
};

const mapStateToProps = state => ({
  oppholdUtlandFom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).fom),
  oppholdUtlandTom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).tom),
  oppholdsPeriodeEndringsBegrunnelse: soknadSelectors.OppholdUtlandSelector(state).oppholdsPeriodeEndringsBegrunnelse,
  alleBegrunnelser: KodeverkSelectors.begrunnelserSelector(state).opphold,
});

const mapDispatchToProps = dispatch => ({
  oppdaterPeriode: (periode, begrunnelse) => dispatch(soknadOperations.oppdaterPeriode(periode, begrunnelse)),
  oppfriskFagsaker: saksnummer => fagsakOperations.oppfrisk(saksnummer),
});

export default connect(mapStateToProps, mapDispatchToProps)(OppholdPeriode);
