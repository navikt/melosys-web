import React, { Component } from 'react';
import {Panel} from "nav-frontend-paneler";
import Lenkepanel from 'nav-frontend-lenkepanel';
import './arbeidsforhold.css';
import * as Api from './ducks/api';
import {CONTEXT_PATH} from './constants';

const ArbeidsforholdRad = ({data}) => {
  const fnr = data.arbeidstaker.ident.ident;
  const orgnr = data.arbeidsgiver.orgnummer;
  const linkTo = `${CONTEXT_PATH}/arbeidsforholdet/${fnr}/${orgnr}`;
  const arbeidsavtaler = `, arbeidsavtaler(${data.arbeidsavtale.length})`
  return (
    <Lenkepanel tittelProps="innholdstittel" href={linkTo}>
      {orgnr}, {data.arbeidsforholdstype}{arbeidsavtaler}
    </Lenkepanel>
  );
};

class Arbeidsforhold extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      arbeidsforhold: []
    }
  }
  componentDidMount() {

    let fnr = this.props.match.params.fnr;
    debugger;
    Api.hentArbeidsforhold(fnr)
    .then(result => this.setState({
      arbeidsforhold: result.arbeidsforhold,
      loaded: true
    }))
    .catch(error => {
      // eslint-disable-next-line
      console.log(`request failed ${error}`);
    });
  }
  render() {
    const rows = this.state.arbeidsforhold.map((item) => <ArbeidsforholdRad key={item.arbeidsforholdID} data={item}/>);
    return (
      <section className="arbeidsforhold">
        <Panel>
          <h1>Arbeidsforhold</h1>
          <p>{this.props.match && this.props.match.params.fnr}</p>
          {rows}
          {/*<ArbeidsforholdTabell arbeidsforhold={this.state.arbeidsforhold}/>*/}
        </Panel>
      </section>
    );
  }
}

export default Arbeidsforhold;