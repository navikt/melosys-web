import React, { Component } from 'react';
import PT from 'prop-types';
import { Input as NavInput } from 'nav-frontend-skjema';
import { Field, FieldArray } from 'redux-form';

import './listevelger.css';

const uuid = require('uuid/v4');

/** Enkeltlisten representerer ETT listevalg. Dersom den er en del av en array, dvs at
 * bruker kan gjøre inn flere valg, så er ListevelgerEnkeltListe komponenten inne i FieldArray.
 */
function ListevelgerEnkeltListe({
  input,
  label,
  errorMessage,
  muligeValg,
  placeholder,
  meta, // eslint-disable-line no-unused-vars
  ...rest
}) {
  const feil = errorMessage ? { feilmelding: errorMessage[0] } : undefined;
  const inputProps = {
    ...input,
    ...rest,
  };

  return (
    <div>
      <NavInput label={label} feil={feil} placeholder={placeholder} list={`dataliste-${inputProps.name}`} />
      <datalist id={`dataliste-${inputProps.name}`}>
        {muligeValg.map(valg => <option key={uuid()} value={valg.term} />)}
      </datalist>
    </div>
  );
}

ListevelgerEnkeltListe.defaultProps = {
  children: <option disabled value="0">ingen valg tilgjengelig</option>,
  input: undefined,
  errorMessage: undefined,
  muligeValg: [],
  placeholder: '',
  meta: undefined,
};

ListevelgerEnkeltListe.propTypes = {
  label: PT.string.isRequired,
  children: PT.node,
  input: PT.object,
  errorMessage: PT.object,
  muligeValg: PT.array,
  placeholder: PT.string,
  meta: PT.object,
};

const ListevelgerValgtListe = ({ listeObjekt, slettListe }) => (
  <div className="listevelger__linje">
    <div className="listevelger__linje__navn">{listeObjekt.term}</div><button className="listevelger__linje__knapp" onClick={e => slettListe(e, listeObjekt.kode)}>-</button>
  </div>
);

ListevelgerValgtListe.propTypes = {
  listeObjekt: PT.object.isRequired,
  slettListe: PT.func.isRequired,
};

class ListevelgerGruppe extends Component {
  /** Håndterer klikk på pluss-knappen ved liste dersom brukeren har valgt et liste manuelt.
   *
   * @param e
   */
  leggTilListeHandler = e => {
    e.preventDefault();
    const { inputVerdi } = this.state;
    const { muligeValg } = this.props;

    this.finnListeOgLeggTil(muligeValg, inputVerdi);
  }

  /**
   *
   */
  finnListeOgLeggTil = (muligeValg, inputVerdi) => {

  }

  render() {
    const { ...rest } = this.props;

    return (
      <div>
        <ListevelgerEnkeltListe {...rest} />
        <button
          className="listevelger__linje__knapp listevelger__linje__knapp--leggtil"
          onClick={this.leggTilListeHandler}>+
        </button>

      </div>
    );
  }
}

/** Listevelgeren tillater både én enkeltliste eller en array hvor
 * brukeren kan legge til flere valg. Hvilken av disse som skal benyttes
 * styres av multiListe-prop.
 */
const Listevelger = ({
  id, feltNavn, className, multiListe, ...rest
}) => {
  return multiListe ?
    <FieldArray
      id={id}
      name={feltNavn}
      multiListe={multiListe}
      component={ListevelgerGruppe}
      {...rest}
    />
    :
    <Field
      name={feltNavn}
      errorClass="skjemaelement--harFeil"
      className={className}
      id={id}
      component={ListevelgerEnkeltListe}
      props={rest}
    />;
};

Listevelger.propTypes = {
  feltNavn: PT.string.isRequired,
  id: PT.string,
  className: PT.string,
  multiListe: PT.bool,
};

Listevelger.defaultProps = {
  className: '',
  id: undefined,
  multiListe: false,
};

export default Listevelger;
