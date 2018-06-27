import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import StegIkon from './stegIkon';
import './stegLinje.css';

const uuid = require('uuid/v4');

const StegLinje = props => {
  const { steg } = props;

  const stegKnapper = steg.map((item, index) => (<StegIkon
    key={uuid()}
    onClick={() => props.stegKlikk(index)}
    id={item.id}
    tittel={item.tittel}
    status={item.status}
    aktivtSteg={item.aktivtSteg}
  />));

  return (
    <div>
      <ul className="stegLinje">
        {stegKnapper}
      </ul>
    </div>
  );
};

StegLinje.propTypes = {
  steg: PT.arrayOf(PT.object).isRequired,
  stegKlikk: PT.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StegLinje);
