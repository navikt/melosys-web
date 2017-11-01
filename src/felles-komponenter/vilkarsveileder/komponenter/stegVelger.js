import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import StegIkon from './stegIkon';
import './stegVelger.css';

const uuid = require('uuid/v4');

class StegVelger extends Component {
  static defaultProps = {
    steg: [],
  }

  static propTypes = {
    steg: PT.arrayOf(PT.object).isRequired,
    stegKlikk: PT.func.isRequired,
  }

  render() {
    const { steg } = this.props;

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
        <ul className="stegVelger">
          {stegKnapper}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StegVelger);
