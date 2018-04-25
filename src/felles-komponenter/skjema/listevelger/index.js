import React, { Component } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';

import './listevelger.css';

const uuid = require('uuid/v4');

const ValgtListe = ({ listeObjekt, slettListe }) => (
  <div className="listevelger__linje">
    <div className="listevelger__linje__navn">{listeObjekt.term}</div><button className="listevelger__linje__knapp" onClick={e => slettListe(e, listeObjekt.kode)}>-</button>
  </div>
);

ValgtListe.propTypes = {
  listeObjekt: PT.object.isRequired,
  slettListe: PT.func.isRequired,
};

class CustomListeVelger extends Component {
  state = {
    inputVerdi: '',
  }

  /** Legg til liste i redux-arrayen.
   *
   * @param listeKode Listekoden som skal legges til
   */
  leggTilListe = listeKode => {
    const { fields } = this.props;
    fields.push(listeKode);
  }

  /**
   * * For å kunne søke på både listekode og liste-navnslik det står i listen, feks "FooBar",
   * brukes 'listeTekstFormat' for å sette sammen dette til en string før det søkes i denne stringen.
   *
   * @param muligeValg Array Liste over alle tilgjengelige liste, bestående av listeobjekt.
   * @param inputVerdi String Verdien det skal søkes etter.
   * @return Array med listeObjekter som matcher.
   */
  finnListeOgLeggTil = (muligeValg, inputVerdi) => {
    const listeSomInneholderInntastetVerdi = muligeValg.filter(liste => (
      liste.term
        .toLowerCase()
        .includes(inputVerdi.toLowerCase())
    ));

    if (listeSomInneholderInntastetVerdi.length === 1) {
      this.leggTilListe(listeSomInneholderInntastetVerdi[0]);
      this.setState({ inputVerdi: '' });
    }
  }

  /** Sletter et liste fra listen.
   *
   * @param listeKode Koden på listeet som skal slettes.
   */
  slettListe = listeKode => {
    const index = this.props.fields.getAll().findIndex(item => item.kode === listeKode);
    return (index > -1 && this.props.fields.remove(index));
  }

  /** ----------------------------------------------------------------------
   *                           EVENT HANDLERS
   * -----------------------------------------------------------------------
   */

  /** Håndterer klikk på sletteknapp.
   *
   * @param e Syntetisk event
   * @param listeKode Koden på listeet som skal slettes.
   */
  slettListeHandler = (e, listeKode) => {
    e.preventDefault();
    this.slettListe(listeKode);
  }

  /** Hvis brukeren har skrevet inn deler av et liste og trykket ENTER ønsker vi å
   * sjekke om kun ETT liste vises i listen. I såfall skal dette listeet legges til på samme måte
   * som om brukeren klikket på listeet var listen og deretter klikket "+"-knappen.
   *
   *
   * @param e SyntetiskEvent React syntetisk event ved KeyDown.
   */
  inputTastNedHandler = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      const { inputVerdi } = this.state;
      const { muligeValg } = this.props;

      this.finnListeOgLeggTil(muligeValg, inputVerdi);
    }
  }

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

  /** Håndter endringer slik at inntasting oppdateres til lokal state. Denne staten er knyttet til
   * det faktiske input-feltet gjennom "value"-attributt.
   * @param e SyntetiskEvent React syntetisk event ved onChange.
   */
  inputEndringHandler = e => {
    this.setState({ inputVerdi: e.target.value });
  }

  /** Enkelte brukertester har vist at saksbehandlere velger liste fra listen uten å faktisk
   * legge de til (enten via ENTER eller pluss-knapp). Derfor legg til det som evt ligger i
   * input-feltet ved blur.
   * @param e
   */
  fokusUtHandler = e => {
    const { muligeValg } = this.props;
    const inputVerdi = e.target.value;

    this.finnListeOgLeggTil(muligeValg, inputVerdi);
  }

  render () {
    const { muligeValg } = this.props;
    const { fields, multiListe } = this.props;

    const valgteListe = fields.getAll() || [];

    const tilgjengeligeListeValg = (multiListe || valgteListe.length === 0)
      ?
      (
        <div className="listevelger__linje">
          <Nav.Input
            list="alleListe"
            label="Velg fra listen"
            bredde="XXL"
            className="listevelger__linje__input"
            value={this.state.inputVerdi}
            onBlur={this.fokusUtHandler}
            onChange={this.inputEndringHandler}
            onKeyDown={this.inputTastNedHandler}
          />
          <button
            className="listevelger__linje__knapp listevelger__linje__knapp--leggtil"
            onClick={this.leggTilListeHandler}>+
          </button>
          <datalist id="alleListe">
            {muligeValg.map(item => <option key={uuid()} value={item.term} />) }
          </datalist>
        </div>
      )
      :
      null;

    return (
      <div className="listevelger">
        {valgteListe.map(valg => (
          <ValgtListe
            key={uuid()}
            listeObjekt={this.props.muligeValg.find(liste => liste.kode === valg.kode)}
            slettListe={this.slettListeHandler}
          />
        ))
        }
        {tilgjengeligeListeValg}
      </div>
    );
  }
}

CustomListeVelger.propTypes = {
  fields: PT.object.isRequired,
  multiListe: PT.bool.isRequired,
  muligeValg: PT.array.isRequired,
};

/**
 * */
const ListeVelger = ({
  feltNavn, multiListe, label, ...rest
}) => (
  <div>
    <label htmlFor="listeValg">{label}</label>
    <FieldArray id="listeValg" name={feltNavn} multiListe={multiListe} component={CustomListeVelger} {...rest} />
  </div>
);

ListeVelger.propTypes = {
  feltNavn: PT.string.isRequired,
  multiListe: PT.bool,
  muligeValg: PT.array,
  label: PT.string,
};

ListeVelger.defaultProps = {
  multiListe: false,
  muligeValg: [],
  label: 'Tast inn valg',
};

export default ListeVelger;
