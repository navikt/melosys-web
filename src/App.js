import React, { Component } from 'react';
import './App.css';

import Header from './components/Header';
import Main from './Main';
import * as Api from './ducks/api';
/*import { connect } from 'react-redux';
import { hentSaksbehandler } from './ducks/saksbehandler';*/

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      saksbehandler: {}
    }
  }
  componentDidMount() {
    //this.props.hentSaksbehandler();
    Api.hentSaksbehandler()
      .then(result => this.setState({saksbehandler: result}))
      .catch(error => {
        // eslint-disable-next-line
        console.log(`request failed ${error}`);
      });
  }
  render() {
    //const { saksbehandler } = this.props;
    return (
      <RootApp>
        <Header saksbehandlerName={this.state.saksbehandler.navn}/>
       {/* <Header saksbehandlerName={saksbehandler.navn}/>*/}
        <Main/>
      </RootApp>
    );
  }
}


const RootApp = (props) => (
  <div className="App" {...props} />
)

export default App;

/*
function mySpy(state) {
  console.log(state);
  return state.saksbehandler.data;
}
const mapStateToProps = (state) => ({
  saksbehandler: mySpy(state)
});

const mapDispatchToProps = (dispatch) => ({
  hentSaksbehandler: () => dispatch(hentSaksbehandler())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
*/
