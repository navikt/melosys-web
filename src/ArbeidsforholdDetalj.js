import React from 'react';

import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import './arbeidsforholdDetalj.css';
import JustChildren from './just-children';
import {Panel} from 'nav-frontend-paneler';
import { Normaltekst } from 'nav-frontend-typografi';
import moment from 'moment';

import { connect } from 'react-redux';
import {hentSaksopplysninger, getPersonState, makeGetOrganisasjonStateByArbeidsforholdID, makeGetArbeidsforholdetState} from './ducks/saksopplysninger';

var uuid = require('react-native-uuid');
const queryString = require('query-string');

const datoFormattering = (dato) => {
  return moment(dato).format('DD.MM.YYYY');
};

const Arbeidsforhold = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.arbeidsforholdID) {
    return null;
  }
  const {ansettelsesPeriode: {fom, tom}, arbeidsforholdstype} = arbeidsforhold;
  return (
      <p>
        <span>Arbeidsforhold start: </span><span>{fom && datoFormattering(fom)}</span><br/>
        <span>Sluttdato: </span><span>{tom && datoFormattering(tom)}</span><br/>
        <span>Type arbeidsforhold: </span><span>{arbeidsforholdstype}</span>
      </p>
  );
};

const ArbeidsAvtaleRad  = ({
   arbeidsavtale,
   antall
}) => {
  const tittel = `Arbeidsavtale (${antall})`;
  const { stillingsprosent, avloenningstype} =  arbeidsavtale;
  return (
    <Ekspanderbartpanel tittel={tittel}>
      <Normaltekst>
        <span>Stillingsprosent:</span>&nbsp;<span>{stillingsprosent ? stillingsprosent+'%': 'ukjent'}</span><br />
        <span>Lønnstype:</span>&nbsp;<span>{avloenningstype ? avloenningstype: 'ukjent'}</span>
      </Normaltekst>
    </Ekspanderbartpanel>
  );
};

const ArbeidsforholdListe = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.arbeidsforholdID) {
    return null;
  }
  const { arbeidsavtale, arbeidsforholdIDnav } = arbeidsforhold;
  const rows = arbeidsavtale.map((item) => <ArbeidsAvtaleRad key={arbeidsforholdIDnav} arbeidsavtale={item} antall={arbeidsavtale.length}/>);
  return (
    [rows]
  );
}

const PPRow = ({data}) => {
  const { permisjonsId, permisjonOgPermittering, permisjonsprosent, permisjonsPeriode: {fom, tom} } = data;
  return (
    <div>
      <span>ID:</span><span>{permisjonsId}</span><br/>
      <span>Type:</span><span>{permisjonOgPermittering}</span><br/>
      <span>FOM:</span><span>{fom && datoFormattering(fom)}</span><br/>
      <span>TOM:</span><span>{tom && datoFormattering(tom)}</span><br/>
      <span>permisjonsprosent:</span><span>{""+permisjonsprosent}</span>
    </div>
  );
}

const PermisjonOgPermittering = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.permisjonOgPermittering) {
    return null;
  }
  const { permisjonOgPermittering } = arbeidsforhold;

  const tittel = `Permisjon/Permittering (${permisjonOgPermittering.length})`;
  const rows = permisjonOgPermittering.map((item) => <PPRow key={uuid.v1()} data={item}/>);

  return (
    <Ekspanderbartpanel tittel={tittel}>
      {rows}
    </Ekspanderbartpanel>
  );
};

function gateAdresse(bostedsadresse) {
  const {gatenavn, husnummer, husbokstav} = bostedsadresse;
  let gateadressen = gatenavn;
  if (husnummer) gateadressen += ' '+husnummer;
  if (husbokstav) gateadressen += husbokstav;
  return gateadressen;
};

function antallAar(dato) {
  let now = moment();
  let mdato = moment(dato);
  let aar = now.diff(mdato, 'years');
  return aar;
}
const Person = ({person}) => {
  if (!person || !person.fnr) {
    return null;
  }
  const { 
    sammensattNavn,foedselsdato, fnr, 
    bostedsadresse: {land, postnr, poststed, gateadresse},
    statsborgerskap
  } = person;

  let alder = antallAar(foedselsdato);
  let gateadressen = gateAdresse(gateadresse);

  return (
    <Ekspanderbartpanel tittel={sammensattNavn +' ('+ alder + ' år)'}>
      <Normaltekst>{fnr}</Normaltekst>
      <h4>Personopplysninger</h4>
      <p>
        <span>Adresse: </span><span>{gateadressen}</span><br/>
        <span>Postnr/Sted: </span><span>{postnr}&nbsp;{poststed}</span><br/>
        <span>Land: </span><span>{land}</span><br/>
        <span>Statsborgerskap: </span><span>{statsborgerskap}</span>
      </p>
    </Ekspanderbartpanel>
  );
};

const Virksomhet = ({organisasjon}) => {
  if (!organisasjon || !organisasjon.navn || !organisasjon.forretningsadresse) {
    return (
      <p>Ukjent virksomhet</p>
    )
  }
  const { navn, orgnummer, forretningsadresse: {postnr, poststed, gateadresse: {gatenavn}} } = organisasjon;
  return (
    <p>Arbeidsgiver:&nbsp;{navn} {orgnummer}<br/>Forretningsadresse:&nbsp;{gatenavn}, {postnr}&nbsp;{poststed}</p>
  )
};

//=======================================================================================
class ArbeidsforholdDetalj extends React.Component {

  componentDidMount() {
    let { fnr } = this.props.match.params;
    this.props.hentSaksopplysninger(fnr);
  }

  render() {
    const { person, organisasjon, arbeidsforholdet } = this.props;

    if (!person || !arbeidsforholdet) {
      return <h1>FEILMELDING</h1>;
    }

    return (
      <JustChildren>
        <section className="arbeidsforhold-arbeidstaker">
          <Panel>
            <Person person={person}/>
          </Panel>
          <br />
          <Panel>
            <Ekspanderbartpanel tittel="Arbeidstaker/Næringsdrivende">
              <Normaltekst>Arbeidsforhold</Normaltekst>
              <Arbeidsforhold arbeidsforhold={arbeidsforholdet}/>
              <ArbeidsforholdListe arbeidsforhold={arbeidsforholdet}/>
            </Ekspanderbartpanel>
            <br/>
            <PermisjonOgPermittering arbeidsforhold={arbeidsforholdet}/>
          </Panel>
          <Panel>
            <Ekspanderbartpanel tittel="Utsendings periode">
              <Normaltekst>
                <span>FOM:&nbsp;</span><span>xxxx...xxxx</span><br />
                <span>TOM:&nbsp;</span><span>xxxx...xxxx</span>
              </Normaltekst>
            </Ekspanderbartpanel>
          </Panel>
        </section>
        <section className="arbeidsforhold-virksomhet">
          <Panel>
            <h4>Virksomhet i Norge</h4>
            <Virksomhet organisasjon={organisasjon} />
          </Panel>
          <br />
          <Panel>
            <h4>Arbeidsgivers virksomhet i Norge</h4>
            <Ekspanderbartpanel tittel="Vesentlig virksomhet">
              <Normaltekst>
                TODO
              </Normaltekst>
            </Ekspanderbartpanel>
          </Panel>
          <br />
          <Panel>
            <h4>Virksomhet i utlandet</h4>
            <p><span>Arbeidet utføres for:</span><span>XXXXX</span></p>
            <p><span>Navn på selskap/fartøy:</span><span>XXXXX</span></p>
            <p><span>Adresse:</span><span>XXXXX</span></p>
            <p><span>Land:</span><span>XXXXX</span></p>
          </Panel>
        </section>
        <section className="arbeidsforhold-vurdering">
          <Panel>
            <h4>Leveringsvurdering EØS</h4>
            <p>4530A02 - Opprettet</p>

            <h4>TODO: Søknad</h4>
          </Panel>
        </section>
      </JustChildren>
    )
  }
}

const arbeidsforholdIDfromQueryParam = (props) => {
  const { search } = props.location;
  const qs = queryString.parse(search);
  const arbeidsforholdID = qs.navid; // TODO validate navid !!!
  return arbeidsforholdID;

};
const makeMapStateToProps = () => {
  const getArbeidsforholdetState = makeGetArbeidsforholdetState();
  const getOrganisasjonState = makeGetOrganisasjonStateByArbeidsforholdID();
  const mapStateToProps = (state, props) => {

    const arbeidsforholdID = arbeidsforholdIDfromQueryParam(props);
    return ({
      person: getPersonState(state),
      arbeidsforholdet: getArbeidsforholdetState(state, arbeidsforholdID),
      organisasjon: getOrganisasjonState(state, arbeidsforholdID)
    });
  }
  return mapStateToProps;
};

const mapDispatchToProps = (dispatch) => ({
  hentSaksopplysninger: (fnr) => dispatch(hentSaksopplysninger(fnr))
});

export default connect(makeMapStateToProps, mapDispatchToProps)(ArbeidsforholdDetalj);