import React from 'react';
import { Link } from 'react-router-dom';
import PT from 'prop-types';

import SokListeEnkellinje from './sokListeEnkellinje';
import './sokResultat.css';
import * as MPT from '../../proptypes';

const uuid = require('uuid/v4');

function SokResultat(props) {
  const { saker } = props;

  const introText = saker.length > 0 ?
    'Knytt opplysningene til en eksisterende sak, eller legg til en ny sak på denne personen.'
    :
    'Ingen funnet';

  return (
    <section className="sokresultat" arial-label={`Søkeresultat: Fikk ${saker.length} treff`}>
      <p>{introText}</p>
      {saker.map(sak => <SokListeEnkellinje key={uuid()} sak={sak} />)}
      <Link to="">Legg til sak</Link>
    </section>
  );
}

SokResultat.propTypes = {
  saker: MPT.SokListe.isRequired,
  kanViseFlereSaker: PT.bool,
};

SokResultat.defaultProps = {
  kanViseFlereSaker: false,
};

export default SokResultat;
