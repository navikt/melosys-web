import React from 'react';
import { Link } from 'react-router-dom';
import PT from 'prop-types';

import SokListeEnkellinje from './sokListeEnkellinje';
import './sokListe.css';
import * as MPT from '../../proptypes';

const uuid = require('uuid/v4');

function SokListe(props) {
  const { saker, kanViseFlereSaker } = props;
  return (
    <div className="sokliste">
      {saker.map(sak => <SokListeEnkellinje key={uuid()} sak={sak} />)}
      {kanViseFlereSaker ? <Link to="/foo" className="sokeliste__fleresaker">Vis flere saker</Link> : null }
    </div>
  );
}

SokListe.propTypes = {
  saker: MPT.SokListe.isRequired,
  kanViseFlereSaker: PT.bool,
};

SokListe.defaultProps = {
  kanViseFlereSaker: false,
};

export default SokListe;
