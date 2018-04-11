import React, { Component } from 'react';
// import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as Nav from '../utils/navFrontend';

class Journalforing extends Component {
  static propTypes = {};
  static defaultProps = {};
  componentDidMount() {

  }
  render() {
    // const { } = this.props;
    return (
      <div className="saksbehandling">
        <Nav.Container fluid>
          <h1>Journalforing todo</h1>
        </Nav.Container>
      </div>
    );
  }
}

const mapStateToProps = () => ({

});
const mapDispatchToProps = () => ({
});
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Journalforing));
