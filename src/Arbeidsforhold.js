import React, { Component } from 'react';
import {Panel} from 'nav-frontend-paneler';
import Lenkepanel from 'nav-frontend-lenkepanel';
import './arbeidsforhold.css';
import {CONTEXT_PATH} from './constants';
import { connect } from 'react-redux';
import { hentPerson } from './ducks/person';
import { hentArbeidsforhold } from './ducks/arbeidsforhold';

const ArbeidsforholdRad = ({
   data, person
}) => {
  const sammensattNavn = person ? person.personnavn.sammensattNavn: '';
  const fnr = data.arbeidstaker.ident.ident;
  const orgnr = data.arbeidsgiver.orgnummer;
  const linkTo = `${CONTEXT_PATH}/arbeidsforholdet/${fnr}/${orgnr}`;
  const arbeidsavtaler = `, arbeidsavtaler(${data.arbeidsavtale.length})`
  return (
    <Lenkepanel tittelProps="innholdstittel" href={linkTo}>
      {sammensattNavn}, {orgnr}, {data.arbeidsforholdstype}{arbeidsavtaler}
    </Lenkepanel>
  );
};

class Arbeidsforhold extends Component {
  componentDidMount() {

    let fnr = this.props.match.params.fnr;
    this.props.hentPerson(fnr);
    this.props.hentArbeidsforhold(fnr);
  }
  render() {
    const { person, arbeidsforhold } = this.props;
    const rows = arbeidsforhold.map((item) => <ArbeidsforholdRad key={item.arbeidsforholdID} data={item} person={person}/>);
    return (
      <section className="arbeidsforhold">
        <Panel>
          <h1>Arbeidsforhold</h1>
          <p>{this.props.match && this.props.match.params.fnr}</p>
          {rows}
        </Panel>
      </section>
    );
  }
}


const mapStateToProps = (state) => {
  return ({
    person: state.person.data,
    arbeidsforhold: state.arbeidsforhold.data
  })
};
const mapDispatchToProps = (dispatch) => ({
  hentPerson: (fnr) => dispatch(hentPerson(fnr)),
  hentArbeidsforhold: (fnr) => dispatch(hentArbeidsforhold(fnr))
});

export default connect(mapStateToProps, mapDispatchToProps)(Arbeidsforhold);