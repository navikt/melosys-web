import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { hentSaksopplysninger } from './ducks/saksopplysninger';
import {Panel} from 'nav-frontend-paneler';
import './arbeidsforhold.css';
import { Systemtittel } from "nav-frontend-typografi";

const ArbeidsforholdListe = ({data, organisasjoner}) => {
  const {arbeidstaker:fnr, arbeidsgiver: {navn, orgnummer: orgnr}, ansettelsesPeriode} = data;
  const organisasjon = organisasjoner.find((item) => item.orgnummer === orgnr);
  if (!organisasjon) {
    return null;
  }
  const arbeidsforholdIDnav = data.arbeidsforholdIDnav;
  const linkTo = `/arbeidsforholdet/${fnr}/${orgnr}/${arbeidsforholdIDnav}`;
  /*const pathname = `/arbeidsforholdet/${fnr}/${orgnr}/`;
  const search = `?navid=${arbeidsforholdIDnav}`;
  const linkTo = {
    pathname: pathname,
    search: search
  }*/

  return (
    <tr>
      <td>{orgnr}</td>
      <td>{navn}</td>
      <td>{ansettelsesPeriode.fom}</td>
      <td>{ansettelsesPeriode.tom}</td>
      <td><Link to={linkTo} alt="Arbeidsforhold detalj">Vis</Link></td>
    </tr>
  );
}
class Arbeidsforhold extends Component {

  componentDidMount() {
    const { fnr } = this.props.match.params;
    this.props.hentSaksopplysninger(fnr);
  }

  render() {
    const { fnr } = this.props.match.params;
    const { saksopplysninger } = this.props;

    if (!saksopplysninger.arbeidsforhold) {
      return null;
    }
    const { person: { sammensattNavn, bostedsadresse }, arbeidsforhold, organisasjoner } = saksopplysninger;

    const tabell = (liste) => {
      if (!liste || !liste.length)
        return null;
      let sammensattListe = liste.map((item) =>
        <ArbeidsforholdListe key={item.arbeidsforholdID} data={item} organisasjoner={organisasjoner}/>
      );

     return (
       <table>
         <thead>
          <tr>
            <th>Orgnr</th>
            <th>Navn</th>
            <th>FOM</th>
            <th>TOM</th>
            <th>&nbsp;</th>
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
          {tabell(arbeidsforhold)}
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