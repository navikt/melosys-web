import React, { Component } from 'react';
import { connect } from 'react-redux';

import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import { soknadSelectors, soknadOperations } from '../ducks/soknad';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import { formatterDatoTilNorsk, vaskInputDato, formatterDatoTilISO } from '../utils/dato';

import './oppholdPeriode.css';

const OppholdEndring = props => {
  const {
    oppholdUtlandNyFom,
    oppholdUtlandNyTom,
    vedFeltEndring,
    avbryt,
    oppdaterPeriode,
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
                onBlur={() => vedFeltFokutUt('oppholdUtlandNyTom')}
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
  avbryt: PT.func.isRequired,
  oppdaterPeriode: PT.func.isRequired,
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

  visEndrePeriode = () => {
    const { oppholdUtlandFom, oppholdUtlandTom } = this.props;

    this.kopierPeriodeTilLokalState(oppholdUtlandFom, oppholdUtlandTom);
    this.setState({ erEndrePeriodeSynlig: true });
  };

  skjulEndrePeriode = () => this.setState({ erEndrePeriodeSynlig: false });

  vedFeltEndring = (feltNavn, verdi) => {
    this.setState({ [feltNavn]: verdi });
  };

  vedFeltFokutUt = feltNavn => {
    const verdi = this.state[feltNavn];
    const vasketVerdi = (feltNavn === 'oppholdUtlandNyFom' || feltNavn === 'oppholdUtlandNyTom') ? vaskInputDato(verdi) : verdi;
    this.setState({ [feltNavn]: vasketVerdi });
  };

  oppdaterPeriode = event => {
    event.preventDefault();
    const { oppholdUtlandNyFom, oppholdUtlandNyTom } = this.state;
    const periode = { fom: formatterDatoTilISO(oppholdUtlandNyFom), tom: formatterDatoTilISO(oppholdUtlandNyTom) };
    this.props.oppdaterPeriode(periode);
    // Todo: Denne er hacky. Bakgrunn: oppdatert soknad rekker ikke å re-propagate til parent før
    // funksjonen nedenfor kalles. Vurder å skrive om til en async await-aktig løsning.
    setTimeout(() => this.props.lagreSoknadOgOppfriskSaksopplysninger(), 0);
  };

  avbryt = event => {
    event.preventDefault();
    const { oppholdUtlandFom, oppholdUtlandTom } = this.props;
    this.setState(state => ({
      ...state,
      oppholdUtlandNyFom: oppholdUtlandFom,
      oppholdUtlandNyTom: oppholdUtlandTom,
    }));
    this.skjulEndrePeriode();
  };

  render () {
    const panelIkon = Ikoner.Ferdig;
    const { oppholdUtlandFom, oppholdUtlandTom } = this.props;
    const {
      visEndrePeriode, skjulEndrePeriode, vedFeltFokutUt, oppdaterPeriode, vedFeltEndring, avbryt,
    } = this;

    const {
      erEndrePeriodeSynlig, oppholdUtlandNyFom, oppholdUtlandNyTom,
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
                skjulEndrePeriode={skjulEndrePeriode}
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
  lagreSoknadOgOppfriskSaksopplysninger: PT.func.isRequired,
  oppholdUtlandFom: PT.string.isRequired,
  oppholdUtlandTom: PT.string.isRequired,
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
});

const mapDispatchToProps = dispatch => ({
  oppdaterPeriode: periode => dispatch(soknadOperations.oppdaterPeriode(periode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OppholdPeriode);
