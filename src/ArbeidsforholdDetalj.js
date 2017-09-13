import React from 'react';

import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import './arbeidsforholdDetalj.css';
import JustChildren from './just-children';
import {Panel} from 'nav-frontend-paneler';
import { Normaltekst } from 'nav-frontend-typografi';
import moment from 'moment';

import { connect } from 'react-redux';
import { hentSaksopplysninger } from './ducks/saksopplysninger';

var uuid = require('react-native-uuid');


const DatoFormattering = (dato) => {
  return moment(dato).format('DD.MM.YYYY');
}

const Detaljer = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.arbeidsforholdID) {
    return null;
  }
  const {ansettelsesPeriode: {fom, tom}, arbeidsforholdstype} = arbeidsforhold;
  return (
      <p>
        <span>Arbeidsforhold start: </span><span>{DatoFormattering(fom)}</span><br/>
        <span>Sluttdato: </span><span>{tom && DatoFormattering(tom)}</span><br/>
        <span>Type arbeidsforhold: </span><span>{arbeidsforholdstype}</span>
      </p>
  );
}

const ArbeidsAvtaleRad  = ({
   data,
   antall
}) => {
  const tittel = `Arbeidsforhold (${antall})`;
  const { stillingsprosent, avloenningstype} = data;
  return (
    <Ekspanderbartpanel tittel={tittel}>
      <Normaltekst>
        <span>Stillingsprosent:</span>&nbsp;<span>{stillingsprosent}%</span><br />
        <span>Lønnstype:</span>&nbsp;<span>{avloenningstype}</span>
      </Normaltekst>
    </Ekspanderbartpanel>
  );
}
const Oversikt = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.arbeidsforholdID) {
    return null;
  }
  const { arbeidsavtale, arbeidsforholdIDnav } = arbeidsforhold;
  const rows = arbeidsavtale.map((item) => <ArbeidsAvtaleRad key={arbeidsforholdIDnav} data={item} antall={arbeidsavtale.length}/>);
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
      <span>FOM:</span><span>{fom && DatoFormattering(fom)}</span><br/>
      <span>TOM:</span><span>{tom && DatoFormattering(tom)}</span><br/>
      <span>permisjonsprosent:</span><span>{""+permisjonsprosent}</span>
    </div>
  );
}

const PermisjonOgPermittering = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.permisjonOgPermittering) {
    return null;
  }

  const { permisjonOgPermittering } = arbeidsforhold;
  const rows = permisjonOgPermittering.map((item) => <PPRow key={uuid.v1()} data={item}/>);
  const tittel = `Permisjon/Permittering (${permisjonOgPermittering.length})`;
  return (
    <Ekspanderbartpanel tittel={tittel}>
      {rows}
    </Ekspanderbartpanel>
  );
}

const OrganisasjonTittel = ({organisasjon}) => {
  if (!organisasjon || !organisasjon.orgnummer) {
    return null;
  }
  const { navn, orgnummer } = organisasjon;
  return (
    <p>Arbeidsgiver:&nbsp;{navn} {orgnummer}</p>
  )
}
const OrganisasjonDetalj  = ({organisasjon}) => {
  if (!organisasjon || !organisasjon.orgnummer) {
    return null;
  }
  const { forretningsadresse: {postnr, poststed, gateadresse: {gatenavn}} } = organisasjon;
  return (
    <p>Forretningsadresse:&nbsp;{gatenavn}, {postnr}&nbsp;{poststed}</p>
  );
}
const Person = ({
  person
}) => {
  if (!person || !person.fnr) {
    return null;
  }
  let foedselsdato = moment(person.foedselsdato);
  let now = moment();
  let alder = now.diff(foedselsdato, 'years');
  let { land, postnr, poststed } = person.bostedsadresse;
  let {gatenavn, husnummer, husbokstav} = person.bostedsadresse.gateadresse;
  let sammensatt = gatenavn;
  if (husnummer) sammensatt += ' '+husnummer;
  if (husbokstav) sammensatt += husbokstav;
  return (
    <Ekspanderbartpanel tittel={person.sammensattNavn +' ('+ alder + ' år)'}>
      <Normaltekst>{person.fnr}</Normaltekst>
      <h4>Personopplysninger</h4>
      <p>
        <span>Adresse: </span><span>{sammensatt}</span><br/>
        <span>Postnr/Sted: </span><span>{postnr}&nbsp;{poststed}</span><br/>
        <span>Land: </span><span>{land}</span><br/>
        <span>Statsborgerskap: </span><span>{person.statsborgerskap}</span>
      </p>
    </Ekspanderbartpanel>
  );
}

class ArbeidsforholdDetalj extends React.Component {

  componentDidMount() {
    let { fnr } = this.props.match.params;
    this.props.hentSaksopplysninger(fnr);
  }

  render() {
    const { orgnr, arbeidsforholdID } = this.props.match.params;
    const { saksopplysninger } = this.props;

    if (!saksopplysninger.arbeidsforhold) {
      return null;
    }
    const { person, arbeidsforhold, organisasjoner } = saksopplysninger;
    const arbeidsforholdet = arbeidsforhold.find((item) => item.arbeidsforholdIDnav.toString() === arbeidsforholdID);
    const organisasjon = organisasjoner.find((item) => item.orgnummer === orgnr);

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
              <Detaljer arbeidsforhold={arbeidsforholdet}/>
              <Oversikt arbeidsforhold={arbeidsforholdet}/>
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
            <OrganisasjonTittel organisasjon={organisasjon}/>
            <OrganisasjonDetalj organisasjon={organisasjon}/>
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

const mapStateToProps = (state) => {
  return ({
    saksopplysninger: state.saksopplysninger.data
  });
};

const mapDispatchToProps = (dispatch) => ({
  hentSaksopplysninger: (fnr) => dispatch(hentSaksopplysninger(fnr))
});

export default connect(mapStateToProps, mapDispatchToProps)(ArbeidsforholdDetalj);