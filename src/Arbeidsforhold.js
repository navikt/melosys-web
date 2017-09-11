import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { hentSaksopplysninger } from './ducks/saksopplysninger';

import {Panel} from 'nav-frontend-paneler';
import './arbeidsforhold.css';
import { Systemtittel } from "nav-frontend-typografi";

const ArbeidsforholdListe = ({data}) => {
  const fnr = data.arbeidstaker;
  const orgnr = data.arbeidsgiver.orgnummer;
  const arbeidsforholdIDnav = data.arbeidsforholdIDnav;
  const linkTo = `/arbeidsforholdet/${fnr}/${orgnr}/${arbeidsforholdIDnav}`;

  return (
    <tr>
      <td>{data.arbeidsgiver.orgnummer}</td>
      <td>{data.arbeidsgiver.navn}</td>
      <td>{data.ansettelsesPeriode.fom}</td>
      <td>{data.ansettelsesPeriode.tom}</td>
      <td><Link to={linkTo} alt="Arbeidsforhold detalj">Lenke</Link></td>
    </tr>
  );
}

class Arbeidsforhold extends Component {
  componentDidMount() {

    let fnr = this.props.match.params.fnr;
    this.props.hentSaksopplysninger(fnr);
  }
  render() {
    const { fnr } = this.props.match.params;
    const { saksopplysninger } = this.props;

    if (!saksopplysninger.arbeidsforhold) {
      return null;
    }
    let person = (saksopplysninger && saksopplysninger.person) ? saksopplysninger.person : {};
    const { sammensattNavn, bostedsadresse } = person;

    const liste = (saksopplysninger && saksopplysninger.arbeidsforhold) ? saksopplysninger.arbeidsforhold: [];

    const tabell = (liste) => {
      if (!liste || !liste.length)
        return null;
      const sammensattListe = liste.map((item) =>
        <ArbeidsforholdListe key={item.arbeidsforholdID} data={item}/>
      );
     return (
       <table>
         <thead>
          <tr>
            <th>Orgnr</th>
            <th>Navn</th>
            <th>FOM</th>
            <th>TOM</th>
            <th>LENKE</th>
          </tr>
         </thead>
         <tbody>
         {sammensattListe}
         </tbody>
       </table>
     );
    };
    return (
      <section className="arbeidsforhold">
        <Panel>
          <Systemtittel>
            Fødselsnr: {fnr}
          </Systemtittel>
          <p>{sammensattNavn}</p>
          {bostedsadressen(bostedsadresse)}
        </Panel>
        <br/>
        <Panel>
          <Systemtittel className="blokk-xs">Arbeidsforhold</Systemtittel>
          {tabell(liste)}
        </Panel>
      </section>
    );
  }
}

const bostedsadressen = (bosted) => {
  if (!bosted)
    return null;

  let sammensattAdresse = '' + bosted.gateadresse.gatenavn;
  if (bosted.husnummer) sammensattAdresse += ' ' + bosted.gateadresse.husnummer;
  if (bosted.husbokstav) sammensattAdresse += bosted.gateadresse.husbokstav;
  return (
    <p>{sammensattAdresse}<br/>{bosted.postnr}&nbsp;{bosted.poststed}</p>
  )

}

const mapStateToProps = (state) => {
  return ({
    saksopplysninger: state.saksopplysninger.data
  })
};
const mapDispatchToProps = (dispatch) => ({
  hentSaksopplysninger: (fnr) => dispatch(hentSaksopplysninger(fnr))
});

export default connect(mapStateToProps, mapDispatchToProps)(Arbeidsforhold);