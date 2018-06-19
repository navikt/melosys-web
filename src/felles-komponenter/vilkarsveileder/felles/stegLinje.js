import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';

import StegIkon from './stegIkon';
import './stegLinje.css';

const uuid = require('uuid/v4');

const StegLinje = props => {
  const { steg } = props;

  // Klargjør betingede elementer.
  const stegKnapper = steg.map((item, index) => {
    const visAtStegetErAktivt = (item.id !== 'VEDTAK') ? item.aktivtSteg : false;

    return (<StegIkon
      key={uuid()}
      onClick={() => props.stegKlikk(index)}
      id={item.id}
      tittel={item.tittel}
      status={item.status}
      aktivtSteg={visAtStegetErAktivt}
    />);
  });

  const cl = classnames({
    stegLinje: true,
    'stegLinje--short': stegKnapper.length < 6,
    'stegLinje--medium': stegKnapper.length < 8 && stegKnapper.length >= 6,
    'stegLinje--large': stegKnapper.length >= 8,
  });

  return (
    <div>
      <ul className={cl}>
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
