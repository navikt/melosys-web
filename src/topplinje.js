import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hentSaksbehandler } from './ducks/saksbehandler';
import Header from './components/Header';

class Topplinje extends Component {
  componentDidMount() {
    this.props.hentSaksbehandler()
  }

  render() {
    const {saksbehandler: {navn}} = this.props;
    return (
      <Header saksbehandlerName={navn}/>
    );
  }
}

const mapStateToProps = (state) => {
  return ({
    saksbehandler: state.saksbehandler.data
  })
};
const mapDispatchToProps = (dispatch) => ({
  hentSaksbehandler: () => dispatch(hentSaksbehandler())
});

export default connect(mapStateToProps, mapDispatchToProps)(Topplinje);