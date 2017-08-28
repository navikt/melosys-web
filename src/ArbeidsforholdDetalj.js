import React from 'react';
// import {Component, Row, Column} from 'nav-frontend-grid';
var uuid = require('react-native-uuid');


const Detaljer = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.arbeidsforholdID) {
    return null;
  }
  let fom = arbeidsforhold.ansettelsesPeriode.periode.fom ? arbeidsforhold.ansettelsesPeriode.periode.fom.slice(0, 10): '';
  let tom = arbeidsforhold.ansettelsesPeriode.periode.tom ? arbeidsforhold.ansettelsesPeriode.periode.tom.slice(0, 10): '';
  return (
    <table>
      <thead>
      <tr>
        <th>Startdato</th>
        <td>{fom}</td>
        <td>&nbsp;</td>
        <th>Opplysningspliktig</th>
        <td>{arbeidsforhold.opplysningspliktig.orgnummer}</td>
      </tr>
      <tr>
        <th>Sluttdato</th>
        <td>{tom}</td>
        <td>&nbsp;</td>
        <th>Arbeidsforhold-ID</th>
        <td>{arbeidsforhold.arbeidsforholdID}</td>
      </tr>
      <tr>
        <th>Type arbeidsforhold</th>
        <td>{arbeidsforhold.arbeidsforholdstype}</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <th>Registrert første gang</th>
        <td>FINNER IKKE</td>
        <td>&nbsp;</td>
      </tr>
      </thead>
    </table>
  );
}

const ArbeidsAvtaleRad  = ({data}) => {
  let endringsdatoStillingsprosent = data.endringsdatoStillingsprosent ? data.endringsdatoStillingsprosent.slice(0,10): '';
  let sisteLoennsendringsdato = data.sisteLoennsendringsdato ? data.sisteLoennsendringsdato.slice(0,10): '';
  return (
    <tr>
      <td>{data.stillingsprosent}%</td>
      <td>{data.avtaltArbeidstimerPerUke}</td>
      <td>{data.beregnetAntallTimerPrUke}</td>
      <td>{sisteLoennsendringsdato}</td>
      <td>{""+endringsdatoStillingsprosent}</td>
    </tr>
  );
}
const Oversikt = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.arbeidsforholdID) {
    return null;
  }
  const rows = arbeidsforhold.arbeidsavtale.map((item) => <ArbeidsAvtaleRad key={arbeidsforhold.arbeidsforholdIDnav} data={item}/>);
  return (
    <table>
      <thead>
        <tr>
          <th>Stilling</th>
          <th>Timer i full stilling</th>
          <th>Beregnet antall timer per uke</th>
          <th>Lønnsendring</th>
          <th>Stillings%Endring</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  );

}
const YrkeRad = ({data}) => {
  return (
    <tr>
      <td>{data.yrke.kodenavn}</td>
      <td>{data.yrke.termnavn}</td>
      <td width="2rem">&nbsp;&nbsp;</td>
      <td>{data.avloenningstype}</td>
      <td>{data.arbeidstidsordning}</td>
    </tr>
  );
}
const Yrke = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.arbeidsforholdID) {
    return null;
  }
  const rows = arbeidsforhold.arbeidsavtale.map((item) => <YrkeRad key={uuid.v1()} data={item}/>);
  return (
    <table>
      <thead>
        <tr>
          <th>Yrke</th>
          <th>Yrke</th>
          <td width="2rem">&nbsp;&nbsp;</td>
          <th>Lønnstype</th>
          <th>Arb. tidsordning</th>
        </tr>
      </thead>
      <tbody>
      {rows}
      </tbody>
    </table>
  );
}
const PPRow = ({data}) => {
  return (
    <tr>
      <td>{data.permisjonsId}</td>
      <td>{data.permisjonsPeriode.permisjonOgPermittering}</td>
      <td>{data.permisjonsPeriode.fom && data.permisjonsPeriode.fom.slice(0,10)}</td>
      <td>{data.permisjonsPeriode.tom && data.permisjonsPeriode.tom.slice(0,10)}</td>
      <td>{""+data.permisjonsprosent}</td>
    </tr>
  );
}

const PermisjonOgPermittering = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.permisjonOgPermittering) {
    return null;
  }
  let {permisjonOgPermittering} = arbeidsforhold;
  const rows = permisjonOgPermittering.map((item) => <PPRow key={uuid.v1()} data={item}/>);
  return (
    <table>
      <thead>
        <tr>
          <th>Permisjonsid</th>
          <th>Type</th>
          <th>Startdato</th>
          <th>Slutdato</th>
          <th>Permisjonsprosent</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  );
}
const OrganisasjonTittel = ({organisasjon}) => {
  if (!organisasjon || !organisasjon.orgnummer) {
    return null;
  }
  return (
    <h1>{organisasjon.navn.redigertNavn} {organisasjon.orgnummer}</h1>
  )
}
const OrganisasjonDetalj  = ({organisasjon}) => {
  if (!organisasjon || !organisasjon.orgnummer) {
    return null;
  }
  return (
    <p>Forretningsadresse:{organisasjon.organisasjonDetaljer.forretningsadresse.adresseledd["0"].verdi}, {organisasjon.organisasjonDetaljer.forretningsadresse.adresseledd[1].verdi}, {organisasjon.organisasjonDetaljer.forretningsadresse.adresseledd[2].verdi}</p>
  );
}
const Person = ({person}) => {
  if (!person || !person.aktoer) {
    return null;
  }
  return (
    <span>{person.personnavn.sammensattNavn}, {person.foedselsdato.foedselsdato.slice(0,10)}</span>
  );
}

class ArbeidsforholdDetalj extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      arbeidsforhold: {},
      person: {},
      organisasjon: {}
    }
  }
  componentDidMount() {
    let API_MELOSYS_URL = 'http://localhost:3002/api/';
    let {fnr, orgnr} = this.props.match.params;


    const URI_ORGANISASJON = `${API_MELOSYS_URL}organisasjon/${orgnr}`;
    fetch(URI_ORGANISASJON)
      .then(response => response.json())
      .then(result => this.setState({
        organisasjon: result
      }))
      .catch(error => {
        // eslint-disable-next-line
        console.log(`request failed ${error}`);
      });

    const URI_ARBEIDSFORHOLD = `${API_MELOSYS_URL}arbeidsforhold/${fnr}/${orgnr}`;
    fetch(URI_ARBEIDSFORHOLD)
      .then(response => response.json())
      .then(result => this.setState({
        arbeidsforhold: result,
        loaded: true
      }))
      .catch(error => {
        // eslint-disable-next-line
        console.log(`request failed ${error}`);
      });

    let URI_PERSON = `${API_MELOSYS_URL}v3/person/${fnr}`;
    fetch(URI_PERSON)
      .then(response => response.json())
      .then(result => this.setState({
        person: result
      }))
      .catch(error => {
        // eslint-disable-next-line
        console.log(`request failed ${error}`);
      });
  }
  render() {

    return (
      <div>
        <p>fnr:{this.props.match && this.props.match.params.fnr}, <Person person={this.state.person}/></p>
        <p>orgnr:{this.props.match && this.props.match.params.orgnr}</p>
        <OrganisasjonTittel organisasjon={this.state.organisasjon}/>
        <OrganisasjonDetalj organisasjon={this.state.organisasjon}/>
        <h4>Arbeidsforhold</h4>
        <hr/>
        <Detaljer arbeidsforhold={this.state.arbeidsforhold}/>
        <hr/>
        <Oversikt arbeidsforhold={this.state.arbeidsforhold}/>
        <hr/>
        <Yrke arbeidsforhold={this.state.arbeidsforhold}/>
        <hr/>
        <PermisjonOgPermittering arbeidsforhold={this.state.arbeidsforhold}/>
      </div>
    )
  }
}

export default ArbeidsforholdDetalj;