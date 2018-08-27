import React, { Component } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';
import { connect } from 'react-redux';

import * as MPT from '../../../proptypes';

import { kodeverkObjektTilTerm, kodeverkObjektTilKode } from '../../../utils/kodeverk';

import './landvelger.css';
import { KodeverkSelectors } from '../../../ducks/kodeverk';

import EnkeltLand from './enkeltLand';
import MultiLand from './multiLand';

/** Hjelpere som deles av hovedkomponent og subkomponentene EnkeltLand og MultiLand */
const landTekstFormat = landObjekt => (`${kodeverkObjektTilTerm(landObjekt)} (${kodeverkObjektTilKode(landObjekt)})`);
const kodeTilObjekt = (kode, alleLandkoder) => alleLandkoder.find(enkeltKode => enkeltKode.kode === kode);

const ValgtLand = ({ landObjekt, slettLand, disabled }) => (
  <div className="landliste__linje">
    <div className="landliste__linje__navn">{landTekstFormat(landObjekt)}</div>
    <button className="landliste__linje__knapp" disabled={disabled} onClick={e => slettLand(e, kodeverkObjektTilKode(landObjekt))}>-</button>
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
    error: null,
  }

  componentDidMount = () => {
    const { multiLand } = this.props;
    if (!multiLand) {
      this.setState({ inputVerdi: this.reduxHentInitiellLandTekst() });
    }
  }

  reduxHentInitiellLandTekst = () => {
    const { fields, landkoder } = this.props;
    const ettLand = fields.getAll() && fields.getAll()[0];
    const landKodeObjekt = ettLand && kodeTilObjekt(ettLand, landkoder);
    return ettLand ? landTekstFormat(landKodeObjekt) : '';
  }

  reduxLeggTilLand = landKode => {
    const { fields } = this.props;
    const valgteLand = fields.getAll() || [];

    if (!landKode) throw new Error('landKode må inneholde verdi.');

    if (!valgteLand.includes(landKode)) {
      fields.push(landKode);
    }
  };

  reduxErstattLand = landKode => {
    const { fields } = this.props;

    if (!landKode) throw new Error('landKode må inneholde verdi.');

    fields.removeAll();
    fields.push(landKode);
  };

  /** Sletter et land fra Redux og dermed fra listen.
   *
   * @param landKode Koden på landet som skal slettes.
   */
  reduxSlettEnkeltLand = landKode => {
    const index = this.props.fields.getAll().findIndex(item => item === landKode);
    return (index > -1 && this.props.fields.remove(index));
  };

  finnLand = inputVerdi => {
    const { landkoder } = this.props;
    return landkoder.filter(land => (
      landTekstFormat(land)
        .toLowerCase()
        .includes(inputVerdi.toLowerCase())
    ));
  }

  finnEttLand = inputVerdi => {
    const landListe = this.finnLand(inputVerdi);
    return landListe.length === 1 ? landListe[0] : false;
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
    this.reduxSlettEnkeltLand(landKode);
  }

  inputTastNedHandler = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      const { multiLand } = this.props;
      if (multiLand) {
        this.multiLandFokusUtHandler();
      } else {
        this.enkeltLandFokusUtHandler();
      }
    }
  }

  multiLandFokusUtHandler = () => {
    const { inputVerdi } = this.state;

    if (!inputVerdi) {
      this.tomFeilmelding();
      return;
    }

    const landKodeObjekt = this.finnEttLand(inputVerdi);
    if (landKodeObjekt) {
      this.reduxLeggTilLand(landKodeObjekt.kode);
      this.setState({ inputVerdi: '', error: null });
    } else {
      this.setState({ error: 'Finner ikke landet du har skrevet inn.' });
    }
  }

  enkeltLandFokusUtHandler = () => {
    const { inputVerdi } = this.state;

    if (!inputVerdi) {
      this.tomFeilmelding();
      return;
    }

    const landKodeObjekt = this.finnEttLand(inputVerdi);
    if (landKodeObjekt) {
      this.reduxErstattLand(landKodeObjekt.kode);
      this.setState({ inputVerdi: landTekstFormat(landKodeObjekt), error: null });
    } else {
      this.setState({ error: 'Finner ikke landet du har skrevet inn.' });
    }
  };

  tomFeilmelding = () => {
    this.setState({ error: null });
  }

  /** Håndter endringer slik at inntasting oppdateres til lokal state. Denne staten er knyttet til
   * det faktiske input-feltet gjennom "value"-attributt.
   * @param e SyntetiskEvent React syntetisk event ved onChange.
   */
  inputEndringHandler = e => {
    const inputVerdi = e.target.value;
    this.setState({ inputVerdi });
  }

  render () {
    const {
      landkoder, fields, multiLand, meta,
    } = this.props;

    const {
      multiLandFokusUtHandler, enkeltLandFokusUtHandler, inputEndringHandler, inputTastNedHandler, slettLandHandler,
    } = this;

    const { inputVerdi } = this.state;
    const { error: skjemaError = '' } = meta;
    const { error: landError = '' } = this.state;

    const feilObjekt = skjemaError || landError ? { feilmelding: `${skjemaError} ${landError}` } : null;
    const valgteLand = fields.getAll() || [];

    return (
      <div className="landliste">
        { multiLand ?
          <MultiLand
            slettLand={this.slettLandHandler}
            valgteLand={valgteLand}
            alleLand={landkoder}
            inputVerdi={inputVerdi}
            fokusUtHandler={multiLandFokusUtHandler}
            inputEndringHandler={inputEndringHandler}
            inputTastNedHandler={inputTastNedHandler}
            slettLandHandler={slettLandHandler}
            feil={feilObjekt}
            {...this.props}
          />
          :
          <EnkeltLand
            alleLand={landkoder}
            inputVerdi={inputVerdi}
            fokusUtHandler={enkeltLandFokusUtHandler}
            inputEndringHandler={inputEndringHandler}
            inputTastNedHandler={inputTastNedHandler}
            feil={feilObjekt}
            {...this.props}
          />
        }
        <div className="landliste__dataliste">
          <datalist id="alleLand">
            {landkoder.map(item => (<option key={kodeverkObjektTilKode(item)} value={landTekstFormat(item)} />))}
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
  label: PT.string,
  meta: PT.object.isRequired,
  disabled: PT.bool,
};

CustomLandVelger.defaultProps = {
  disabled: false,
  label: undefined,
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
  label: undefined,
};

export { kodeTilObjekt, landTekstFormat };

export default connect(mapStateToProps)(LandVelger);
