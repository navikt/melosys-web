import React, { Component } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';
import { connect } from 'react-redux';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import './landvelger.css';
import { LandkoderSelector } from '../../../ducks/landkoder';

const landTekstFormat = landObjekt => (`${landObjekt.term} (${landObjekt.kode})`);

const ValgtLand = ({ landObjekt, slettLand }) => (
  <div className="landliste__linje">
    <div className="landliste__linje__navn">{landTekstFormat(landObjekt)}</div><button className="landliste__linje__knapp" onClick={e => slettLand(e, landObjekt.kode)}>-</button>
  </div>
);

ValgtLand.propTypes = {
  landObjekt: PT.object.isRequired,
  slettLand: PT.func.isRequired,
};

class CustomLandVelger extends Component {
  state = {
    inputVerdi: '',
  }

  /** Legg til land i redux-arrayen.
   *
   * @param landKode Landkoden som skal legges til
   */
  leggTilLand = landKode => {
    const { fields } = this.props;
    const valgteLand = fields.getAll() || [];

    if (!valgteLand.includes(landKode)) {
      fields.push(landKode);
    }
  }

  /**
   * * For å kunne søke på både landkode og land-navnslik det står i listen, feks "Storbrittannia (GB)",
   * brukes 'landTekstFormat' for å sette sammen dette til en string før det søkes i denne stringen.
   *
   * @param landkoder Array Liste over alle tilgjengelige land, bestående av landobjekt.
   * @param inputVerdi String Verdien det skal søkes etter.
   * @return Array med landObjekter som matcher.
   */
  finnLandOgLeggTil = (landkoder, inputVerdi) => {
    const landSomInneholderInntastetVerdi = landkoder.filter(land => (
      landTekstFormat(land)
        .toLowerCase()
        .includes(inputVerdi.toLowerCase())
    ));

    if (landSomInneholderInntastetVerdi.length === 1) {
      this.leggTilLand(landSomInneholderInntastetVerdi[0].kode);
      this.setState({ inputVerdi: '' });
    }
  }

  /** Sletter et land fra listen.
   *
   * @param landKode Koden på landet som skal slettes.
   */
  slettLand = landKode => {
    const index = this.props.fields.getAll().findIndex(item => item === landKode);
    return (index > -1 && this.props.fields.remove(index));
  }

  /** ----------------------------------------------------------------------
   *                           EVENT HANDLERS
   * -----------------------------------------------------------------------
   */

  /** Håndterer klikk på sletteknapp.
   *
   * @param e Syntetisk event
   * @param landKode Koden på landet som skal slettes.
   */
  slettLandHandler = (e, landKode) => {
    e.preventDefault();
    this.slettLand(landKode);
  }

  /** Hvis brukeren har skrevet inn deler av et land og trykket ENTER ønsker vi å
   * sjekke om kun ETT land vises i listen. I såfall skal dette landet legges til på samme måte
   * som om brukeren klikket på landet var listen og deretter klikket "+"-knappen.
   *
   *
   * @param e SyntetiskEvent React syntetisk event ved KeyDown.
   */
  inputTastNedHandler = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      const { inputVerdi } = this.state;
      const { landkoder } = this.props;

      this.finnLandOgLeggTil(landkoder, inputVerdi);
    }
  }

  /** Håndterer klikk på pluss-knappen ved land dersom brukeren har valgt et land manuelt.
   *
   * @param e
   */
  leggTilLandHandler = e => {
    e.preventDefault();
    const { inputVerdi } = this.state;
    const { landkoder } = this.props;

    this.finnLandOgLeggTil(landkoder, inputVerdi);
  }

  /** Håndter endringer slik at inntasting oppdateres til lokal state. Denne staten er knyttet til
   * det faktiske input-feltet gjennom "value"-attributt.
   * @param e SyntetiskEvent React syntetisk event ved onChange.
   */
  inputEndringHandler = e => {
    this.setState({ inputVerdi: e.target.value });
  }

  /** Enkelte brukertester har vist at saksbehandlere velger land fra listen uten å faktisk
   * legge de til (enten via ENTER eller pluss-knapp). Derfor legg til det som evt ligger i
   * input-feltet ved blur.
   * @param e
   */
  fokusUtHandler = e => {
    const { landkoder } = this.props;
    const inputVerdi = e.target.value;

    this.finnLandOgLeggTil(landkoder, inputVerdi);
  }

  render () {
    const { landkoder, label } = this.props;
    const { fields, multiLand } = this.props;

    const valgteLand = fields.getAll() || [];

    const tilgjengeligeLandListe = (multiLand || valgteLand.length === 0)
      ?
      (
        <div className="landliste__linje">
          <Nav.Input
            list="alleLand"
            label={label}
            bredde="XXL"
            className="landliste__linje__input"
            value={this.state.inputVerdi}
            onBlur={this.fokusUtHandler}
            onChange={this.inputEndringHandler}
            onKeyDown={this.inputTastNedHandler}
          />
          <button
            className="landliste__linje__knapp landliste__linje__knapp--leggtil"
            onClick={this.leggTilLandHandler}>+
          </button>
          <datalist id="alleLand">
            {landkoder.map(item => (!valgteLand.includes(item) ? <option key={item.kode} value={landTekstFormat(item)} /> : ''))}
          </datalist>
        </div>
      )
      :
      null;

    return (
      <div className="landliste">
        {!multiLand && valgteLand.length > 0 && label}
        {valgteLand.map(valgtLand => (
          <ValgtLand
            key={valgtLand}
            landObjekt={this.props.landkoder.find(land => land.kode === valgtLand)}
            slettLand={this.slettLandHandler}
          />
        ))
        }
        {tilgjengeligeLandListe}
      </div>
    );
  }
}
const mapStateToProps = state => ({
  landkoder: LandkoderSelector(state),
});

CustomLandVelger.propTypes = {
  fields: PT.object.isRequired,
  multiLand: PT.bool.isRequired,
  landkoder: MPT.Landkoder.isRequired,
  label: PT.string.isRequired,
};

/** Dette er bootstrapper-komponenten som eksponeres utenfor pakken. Komponenten forventer et feltNavn for å kunne vite
 * hvilket felt i redux form den skal hekte seg på. Deretter er det Redux Forms FieldArray som gjør selve connect-jobben
 * under panseret. Det er derfor ingen HOC som feks connecter komponenten til Redux.
 * @param props
 */
const LandVelger = props => (
  <div><FieldArray name={props.feltNavn} multiLand={props.multiLand} component={CustomLandVelger} {...props} /></div>
);

LandVelger.propTypes = {
  feltNavn: PT.string.isRequired,
  multiLand: PT.bool,
  landkoder: MPT.Landkoder,
  label: PT.string,
};

LandVelger.defaultProps = {
  multiLand: false,
  landkoder: [],
  label: 'Tast inn land',
};

export default connect(mapStateToProps)(LandVelger);
