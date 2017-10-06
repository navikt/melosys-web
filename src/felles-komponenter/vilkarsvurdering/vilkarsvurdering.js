import React, { Component } from 'react';
import { connect } from 'react-redux';

import './vilkarsvurdering.css';

class Vilkarsvurdering extends Component {
  static propTypes = {};

  static defaultProps = {};

  render() {
    return (
      <div className="saksbehandling__vilkarsvurdering">
        vilkår
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Vilkarsvurdering);
