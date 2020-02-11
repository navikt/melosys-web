import React, { Component } from 'react';
import { connect } from 'react-redux';

import PT from 'prop-types';

import * as Utils from '../../utils';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';
import * as KV from '../../kodeverk';

import * as Ikoner from '../../resources/images';
import { redigerbartSelectors } from '../../ducks/redigerbart';
import { soknadSelectors, soknadOperations } from '../../ducks/soknad';
import PanelHeader from '../panelHeader/panelHeader';

import './soknadsperiode.css';

export const SoknadsperiodeEndring = props => {
  const {
    soknadsperiodeNyFom,
    soknadsperiodeNyTom,
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
                value={soknadsperiodeNyFom}
                onChange={event => vedFeltEndring('soknadsperiodeNyFom', event.target.value)}
                onBlur={() => vedFeltFokusUt('soknadsperiodeNyFom')}
              />
            </Nav.Column>
            <Nav.Column xs="3">
              <Nav.Input
                bredde="S"
                label="Til og med:"
                value={soknadsperiodeNyTom}
                onChange={event => vedFeltEndring('soknadsperiodeNyTom', event.target.value)}
                onBlur={() => vedFeltFokusUt('soknadsperiodeNyTom')}
              />
            </Nav.Column>
            <Nav.Column xs="12">
              <Nav.Hovedknapp disabled={!erDatoerGyldig} onClick={oppdaterPeriode}>Oppdater registeropplysningene</Nav.Hovedknapp>
              <Nav.Knapp onClick={avbryt}>Avbryt</Nav.Knapp>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>
  );
};

SoknadsperiodeEndring.propTypes = {
  avbryt: PT.func.isRequired,
  oppdaterPeriode: PT.func.isRequired,
  soknadsperiodeNyFom: PT.string.isRequired,
  soknadsperiodeNyTom: PT.string.isRequired,
  vedFeltEndring: PT.func.isRequired,
  vedFeltFokusUt: PT.func.isRequired,
  erDatoerGyldig: PT.bool.isRequired,
};

class Soknadsperiode extends Component {
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
    const panelIkon = Ikoner.Ferdig;
    const { redigerbart, soknadsperiodeFom, soknadsperiodeTom } = this.props;
    const {
      visEndrePeriode, skjulEndrePeriode, validerFelter, oppdaterPeriode, oppdaterFelt, avbryt,
    } = this;

    const {
      erEndrePeriodeSynlig, soknadsperiodeNyFom, soknadsperiodeNyTom,
    } = this.state;

    return (
      <div className="soknadsperiode panelSeksjon">
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={panelIkon} tittel={KV.Paneltitler.soknadsPeriode} undertittel={`${soknadsperiodeFom} - ${soknadsperiodeTom}`} />}
          ariaTittel="Panel for søknadsperiode">
          <Nav.Container fluid>
            {
              !erEndrePeriodeSynlig && (
                <Nav.Row>
                  <Nav.Column xs="12">
                    <p>Dersom søkeren har opplyst at søknadsperioden er endret, legger du inn den korrigerte perioden her og oppdaterer saksopplysningene.</p>
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
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
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

Soknadsperiode.propTypes = {
  soknadVerdier: MPT.SoknadForm,
};

Soknadsperiode.defaultProps = {
  soknadVerdier: {},
};

const mapStateToProps = state => ({
  soknadsperiodeFom: Utils.dato.formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).fom),
  soknadsperiodeTom: Utils.dato.formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).tom),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterPeriode: periode => dispatch(soknadOperations.oppdaterPeriode(periode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Soknadsperiode);
