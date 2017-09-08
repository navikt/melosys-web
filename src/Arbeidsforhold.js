import React, { Component } from 'react';
import {Panel} from 'nav-frontend-paneler';
import Lenkepanel from 'nav-frontend-lenkepanel';
import './arbeidsforhold.css';
import {CONTEXT_PATH} from './constants';
import { connect } from 'react-redux';
import { hentPerson } from './ducks/person';
import { hentArbeidsforhold } from './ducks/arbeidsforhold';
import { Systemtittel } from "nav-frontend-typografi";

const ArbeidsforholdRad = ({data}) => {
  const fnr = data.arbeidstaker.ident.ident;
  const orgnr = data.arbeidsgiver.orgnummer;
  const linkTo = `${CONTEXT_PATH}/arbeidsforholdet/${fnr}/${orgnr}`;
  const arbeidsavtaler = `, arbeidsavtaler(${data.arbeidsavtale.length})`
  return (
    <Lenkepanel tittelProps="undertittel" href={linkTo}>
      OrgNr:{orgnr}, {data.arbeidsforholdstype}{arbeidsavtaler}
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
    const { personnavn, bostedsadresse } = person;
    if (!arbeidsforhold.length)
      return null;
    const rows = arbeidsforhold.map((item) =>
          <ArbeidsforholdRad key={item.arbeidsforholdID} data={item}/>
    );
    return (
      <section className="arbeidsforhold">
        <Panel>
          <Systemtittel>
            Fødselsnr: {this.props.match && this.props.match.params.fnr}
          </Systemtittel>
          <p>{personnavn && personnavn.sammensattNavn}</p>
          {bostedsadresse && bostedsadressen(bostedsadresse)}
        </Panel>
        <br/>
        <Panel>
          <Systemtittel className="blokk-xs">Arbeidsforhold</Systemtittel>
          {rows}
        </Panel>
      </section>
    );
  }
}

const bostedsadressen = (bosted) => {
  if (!bosted)
    return null;

  const sa = bosted.strukturertAdresse;
  let sammensattAdresse = '' + sa.gatenavn;
  if (sa.husnummer) sammensattAdresse += ' ' + sa.husnummer;
  if (sa.husbokstav) sammensattAdresse += ' ' + sa.husbokstav;
  return (
    <p>{sammensattAdresse}<br/>{sa.poststed} BERGEN</p>
  )

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