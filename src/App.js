import React, { Component } from 'react';
import './App.css';

import Header from './components/Header';
import Main from './Main';
import * as Api from './ducks/api';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      saksbehandler: {}
    }
  }
  componentDidMount() {
    Api.hentSaksbehandler()
      .then(result => this.setState({saksbehandler: result}))
      .catch(error => {
        // eslint-disable-next-line
        console.log(`request failed ${error}`);
      });
  }
  render() {
    return (
      <RootApp>
        <Header saksbehandlerName={this.state.saksbehandler.navn}/>
        <Main/>
      </RootApp>
    );
  }
}


const RootApp = (props) => (
  <div className="App" {...props} />
)

export default App;
