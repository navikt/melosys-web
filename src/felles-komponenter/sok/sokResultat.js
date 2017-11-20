import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../utils/navFrontend';

import * as MPT from '../../proptypes/index';

import SokListeEnkellinje from './sokListeEnkellinje';

import './sokResultat.css';

const uuid = require('uuid/v4');

const IntroText = ({ saker }) => {
  const introText = saker && saker.length > 0 ?
    'Knytt opplysningene til en eksisterende sak, eller legg til en ny sak på denne personen.'
    :
    'Ingen eksisterende saker funnet. Klikk "Legg til sak" for å opprette en ny.';
  return (
    <p>{introText}</p>
  );
};
IntroText.propTypes = {
  saker: MPT.SokListe.isRequired,
};

function SokResultat(props) {
  const { saker } = props;

  return (
    <section className="sokresultat">
      <IntroText saker={saker} />
      <Nav.Knapp onClick={props.opprettSak}>+ Opprett sak</Nav.Knapp>
      {saker && saker.map(sak => <SokListeEnkellinje key={uuid()} sak={sak} />)}
    </section>
  );
}

SokResultat.propTypes = {
  saker: MPT.SokListe.isRequired,
  kanViseFlereSaker: PT.bool,
  opprettSak: PT.func.isRequired,
};

SokResultat.defaultProps = {
  kanViseFlereSaker: false,
};

export default SokResultat;
