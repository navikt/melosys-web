import React, { Component } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';
import { connect } from 'react-redux';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import './landvelger.css';
import { KodeverkSelectors } from '../../../ducks/kodeverk';

import EnkeltLand from './enkeltLand';
import MultiLand from './multiLand';

const landTekstFormat = landObjekt => (`${landObjekt.term} (${landObjekt.kode})`);

const ValgtLand = ({ landObjekt = {}, slettLand, disabled }) => (
  <div className="landliste__linje">
    <div className="landliste__linje__navn">{landTekstFormat(landObjekt)}</div><button className="landliste__linje__knapp" disabled={disabled} onClick={e => slettLand(e, landObjekt.kode)}>-</button>
  </div>
);

ValgtLand.propTypes = {
  landObjekt: PT.object.isRequired,
  slettLand: PT.func.isRequired,
  disabled: PT.bool,
};

ValgtLand.defaultProps = {
  disabled: false,
};

class CustomLandVelger extends Component {
  state = {
    inputVerdi: '',
  }

  /** Legg til land i redux-arrayen.
   *
   * @param landKode Landkoden som skal legges til
   */
  leggTilLand = (landKode, multiLand) => {
    const { fields } = this.props;
    const valgteLand = fields.getAll() || [];

    if (!landKode) throw new Error('landKode må inneholde verdi.');

    if (multiLand) {
      if (!valgteLand.includes(landKode)) {
        fields.push(landKode);
      }
    } else {
      fields.removeAll();
      fields.push(landKode);
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

  /** Sletter et land fra listen.
   *
   * @param landKode Koden på landet som skal slettes.
   */
  slettAlleLand = () => {
    this.props.fields.removeAll();
  }

  /**
   * * For å kunne søke på både landkode og land-navnslik det står i listen, feks "Storbrittannia (GB)",
   * brukes 'landTekstFormat' for å sette sammen dette til en string før det søkes i denne stringen.
   *
   * @param landkoder Array Liste over alle tilgjengelige land, bestående av landobjekt.
   * @param inputVerdi String Verdien det skal søkes etter.
   * @return Array med landObjekter som matcher.
   */
  finnLand = (landkoder, inputVerdi) => (
    landkoder.filter(land => (
      landTekstFormat(land)
        .toLowerCase()
        .includes(inputVerdi.toLowerCase())
    ))
  );

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
   * @param e SyntetiskEvent React syntetisk event ved KeyDown.
   */
  inputTastNedHandler = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      const { inputVerdi } = this.state;
      const { landkoder } = this.props;

      e.target.blur(); // Blur og refocus for å fjerne dropdown.
      e.target.focus();

      //this.finnLandOgLeggTil(landkoder, inputVerdi);
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

    const landSomInneholderInntastetVerdi = this.finnLand(landkoder, inputVerdi);
    if (landSomInneholderInntastetVerdi.length === 1) {
      this.leggTilLand(landSomInneholderInntastetVerdi[0].kode);
      this.setState({ inputVerdi: landTekstFormat(landSomInneholderInntastetVerdi[0]) });
    }
  }

  finnLandOgLeggTil = (landkoder, inputVerdi) => {
    const landSomInneholderInntastetVerdi = this.finnLand(landkoder, inputVerdi);

    if (landSomInneholderInntastetVerdi.length === 1) {
      this.leggTilLand(landSomInneholderInntastetVerdi[0].kode);
    } else if (landSomInneholderInntastetVerdi.length === 0) {
      // Inntastet finnes ikke
    } else {
      // For mange land
    }
  }

  fokusUtHandler = e => {
    const { landkoder, multiLand } = this.props;
    const inputVerdi = e.target.value;

    if (!inputVerdi && !multiLand) {
      this.slettAlleLand();
    }

    this.finnLandOgLeggTil(landkoder, inputVerdi);
  }

  /** Håndter endringer slik at inntasting oppdateres til lokal state. Denne staten er knyttet til
   * det faktiske input-feltet gjennom "value"-attributt.
   * @param e SyntetiskEvent React syntetisk event ved onChange.
   */
  inputEndringHandler = e => {
    this.setState({ inputVerdi: e.target.value });
  }

  oppslagLandkoderTilKodeverk = (koder = []) => {
    const { landkoder: kodeverkLandkoder } = this.props;

    const oppslattKoder = koder.reduce((samling, landkode) => {
      const funnetLandkode = kodeverkLandkoder.find(land => (land.kode === landkode));
      return funnetLandkode ? [...samling, funnetLandkode] : [...samling];
    }, []);

    return oppslattKoder;
  }

  render () {
    const {
      landkoder, label, fields, multiLand, meta, disabled,
    } = this.props;

    const { fokusUtHandler, inputEndringHandler, inputTastNedHandler } = this;

    const { inputVerdi } = this.state;

    const feil = meta.error ? { feilmelding: meta.error } : null;

    const valgteLand = fields.getAll() || [];

    return (
      <div className="landliste">
        { multiLand ?
          <MultiLand
            slettLand={this.slettLandHandler}
            valgteLand={valgteLand}
            {...this.props}
          />
          :
          <EnkeltLand
            alleLand={landkoder}
            inputVerdi={inputVerdi}
            fokusUtHandler={fokusUtHandler}
            inputEndringHandler={inputEndringHandler}
            inputTastNedHandler={inputTastNedHandler}
            {...this.props}
          />
        }
        <div className="landliste__linje">
          <datalist id="alleLand">
            {landkoder.map(item => (<option key={item.kode} value={landTekstFormat(item)} />))}
          </datalist>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  landkoder: KodeverkSelectors.landkoderSelector(state),
});

CustomLandVelger.propTypes = {
  fields: PT.object.isRequired,
  multiLand: PT.bool.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  label: PT.string.isRequired,
  meta: PT.object.isRequired,
  disabled: PT.bool,
};

CustomLandVelger.defaultProps = {
  disabled: false,
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
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  label: PT.string,
};

LandVelger.defaultProps = {
  multiLand: false,
  label: 'Tast inn land',
};

export default connect(mapStateToProps)(LandVelger);
