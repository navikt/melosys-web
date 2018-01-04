/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { health } from '../services/api';

class Spark extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  render() {
    return (
      <div>
        <button onClick={() => console.log(health())} >sjekk health</button>
      </div>
    );
  }
}

const mapStateToProps = () => ({

});

const mapDispatchToProps = () => ({

});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Spark));
