import React, { Component } from 'react';
import './App.css';
//import { Container, Row, Column } from 'nav-frontend-grid';
import Header from './components/Header';
import Main from './Main';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      saksbehandler: {"brukernavn": "bareare","navn": "King Arthur"}
    }
  }
  componentDidMount() {
    //let self = this;
    let API_MELOSYS_URL = 'http://localhost:3002/api/';

    fetch(API_MELOSYS_URL+'saksbehandler')
      .then(response => response.json())
      .then(result => this.setState({saksbehandler: result}))
      //.then(data => window.console.log('"saksbehandler:'+JSON.stringify(self.state.saksbehandler)))
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
  <div className="App" {...props}/>)


export default App;
