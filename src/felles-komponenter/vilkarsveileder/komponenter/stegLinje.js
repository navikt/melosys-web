import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import StegIkon from './stegIkon';
import './stegLinje.css';

const uuid = require('uuid/v4');

const StegLinje = props => {
  const { steg } = props;

  // Klargjør betingede elementer.
  const stegKnapper = steg.map((item, index) => (
    <StegIkon
      key={uuid()}
      onClick={() => this.props.stegKlikk(index)}
      ikon={item.ikoner[item.status]}
      tilgjengelig={item.tilgjengelig}
    />));

  return (
    <div>
      <ul className="stegLinje">
        {stegKnapper}
      </ul>
    </div>
  );
};

StegLinje.defaultProps = {
  steg: [],
};

StegLinje.propTypes = {
  steg: PT.arrayOf(PT.object).isRequired,
  stegKlikk: PT.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StegLinje);
