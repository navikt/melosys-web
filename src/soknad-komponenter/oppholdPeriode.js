import React, { Component } from 'react';
import { connect } from 'react-redux';

import PT from 'prop-types';

import * as Utils from '../utils';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import * as Ikoner from '../resources/images';
import { fagsakSelectors } from '../ducks/fagsaker/';

import { soknadSelectors, soknadOperations } from '../ducks/soknad';
import PanelHeader from '../komponenter/panelHeader/panelHeader';

import './oppholdPeriode.css';

export const OppholdEndring = props => {
  const {
    oppholdUtlandNyFom,
    oppholdUtlandNyTom,
    vedFeltEndring,
    avbryt,
    oppdaterPeriode,
    vedFeltFokusUt,
    erDatoerGyldig,
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
                onBlur={() => vedFeltFokusUt('oppholdUtlandNyFom')}
              />
            </Nav.Column>
            <Nav.Column xs="3">
              <Nav.Input
                bredde="S"
                label="Til og med:"
                value={oppholdUtlandNyTom}
                onChange={event => vedFeltEndring('oppholdUtlandNyTom', event.target.value)}
                onBlur={() => vedFeltFokusUt('oppholdUtlandNyTom')}
              />
            </Nav.Column>
            <Nav.Column xs="12">
              <Nav.Hovedknapp disabled={!erDatoerGyldig} onClick={oppdaterPeriode}>Oppdater saksopplysningene</Nav.Hovedknapp>
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
  vedFeltFokusUt: PT.func.isRequired,
  erDatoerGyldig: PT.bool.isRequired,
};

class OppholdPeriode extends Component {
  state = {
    erEndrePeriodeSynlig: false,
    erPeriodeOppdatertOgGyldig: false,
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

  oppdaterFelt = (feltNavn, verdi) => {
    this.setState({ [feltNavn]: verdi });

    const erPeriodeOppdatertOgGyldig = this.validerDato('oppholdUtlandNyFom') && this.validerDato('oppholdUtlandNyTom');
    this.setState({ erPeriodeOppdatertOgGyldig });
  };

  validerDato = feltNavn => {
    const verdi = this.state[feltNavn];
    const vasketVerdi = Utils.dato.vaskInputDato(verdi);
    return vasketVerdi !== false;
  };

  validerFelter = () => {
    const erPeriodeOppdatertOgGyldig = this.vaskOgValiderDato('oppholdUtlandNyFom') &&
                                       this.vaskOgValiderDato('oppholdUtlandNyTom') &&
      Utils.dato.erGyldigPeriode(this.state.oppholdUtlandNyFom, this.state.oppholdUtlandNyTom);

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
    const { oppholdUtlandNyFom, oppholdUtlandNyTom } = this.state;
    const periode = { fom: Utils.dato.formatterDatoTilISO(oppholdUtlandNyFom), tom: Utils.dato.formatterDatoTilISO(oppholdUtlandNyTom) };
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
    const { redigerbart, oppholdUtlandFom, oppholdUtlandTom } = this.props;
    const {
      visEndrePeriode, skjulEndrePeriode, validerFelter, oppdaterPeriode, oppdaterFelt, avbryt,
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
                      <Nav.Hovedknapp disabled={!redigerbart} onClick={visEndrePeriode}>Endre søknadsperioden</Nav.Hovedknapp>
                    </div>
                  </Nav.Column>
                </Nav.Row>
              )
            }
            {
              erEndrePeriodeSynlig &&
              <OppholdEndring
                oppholdUtlandNyFom={oppholdUtlandNyFom}
                oppholdUtlandNyTom={oppholdUtlandNyTom}
                skjulEndrePeriode={skjulEndrePeriode}
                oppdaterPeriode={oppdaterPeriode}
                vedFeltEndring={oppdaterFelt}
                vedFeltFokusUt={validerFelter}
                erDatoerGyldig={this.state.erPeriodeOppdatertOgGyldig}
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
  redigerbart: PT.bool.isRequired,
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
  oppholdUtlandFom: Utils.dato.formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).fom),
  oppholdUtlandTom: Utils.dato.formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).tom),
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterPeriode: periode => dispatch(soknadOperations.oppdaterPeriode(periode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OppholdPeriode);
