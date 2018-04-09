import React from 'react';
import PT from 'prop-types';

import * as MPT from '../../proptypes/index';

import SakEnkeltLinje from './saksliste/sakEnkeltLinje';

import './sokResultat.css';

const uuid = require('uuid/v4');

function SokResultat(props) {
  const { saker, sokStreng } = props;


  return (
    <section className="sokresultat">
      <h1>Fant {saker.length} treff etter søk på &quot;{sokStreng}&quot;</h1>
      {saker && saker.map(sak => <SakEnkeltLinje key={uuid()} sak={sak} />)}
    </section>
  );
}

SokResultat.propTypes = {
  saker: MPT.SokListe.isRequired,
  sokStreng: PT.string.isRequired,
};

export default SokResultat;
