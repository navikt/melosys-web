import React from 'react';

import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import './arbeidsforholdDetalj.css';
import JustChildren from './just-children';
import {Panel} from 'nav-frontend-paneler';
import { Normaltekst } from 'nav-frontend-typografi';
import moment from 'moment';

import { connect } from 'react-redux';
import { hentPerson } from './ducks/person';
import { hentOrganisasjon } from './ducks/organisasjon';
import { hentArbeidsforholdDetalj } from './ducks/arbeidsforholdDetalj';

var uuid = require('react-native-uuid');


const DatoFormattering = (dato) => {
  return moment(dato).format('DD.MM.YYYY')
}

const Detaljer = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.arbeidsforholdID) {
    return null;
  }
  let fom = arbeidsforhold.ansettelsesPeriode.periode.fom ? arbeidsforhold.ansettelsesPeriode.periode.fom.slice(0, 10): '';
  let tom = arbeidsforhold.ansettelsesPeriode.periode.tom ? arbeidsforhold.ansettelsesPeriode.periode.tom.slice(0, 10): '';
  return (
      <p>
        <span>Arbeidsforhold start: </span><span>{DatoFormattering(fom)}</span><br/>
        <span>Sluttdato: </span><span>{tom && DatoFormattering(tom)}</span><br/>
        <span>Type arbeidsforhold: </span><span>{arbeidsforhold.arbeidsforholdstype}</span>
      </p>
  );
}

const ArbeidsAvtaleRad  = ({
   data,
   antall
}) => {
  const tittel = `Arbeidsforhold (${antall})`;
  return (
    <Ekspanderbartpanel tittel={tittel}>
      <Normaltekst>
        <span>Stillingsprosent:</span>&nbsp;<span>{data.stillingsprosent}%</span><br />
        <span>Lønnstype:</span>&nbsp;<span>{data.avloenningstype}</span>
      </Normaltekst>
    </Ekspanderbartpanel>
  );
}
const Oversikt = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.arbeidsforholdID) {
    return null;
  }
  const rows = arbeidsforhold.arbeidsavtale.map((item) => <ArbeidsAvtaleRad key={arbeidsforhold.arbeidsforholdIDnav} data={item} antall={arbeidsforhold.arbeidsavtale.length}/>);
  return (
    [rows]
  );
}

const PPRow = ({data}) => {
  return (
    <div>
      <span>ID:</span><span>{data.permisjonsId}</span><br/>
      <span>Type:</span><span>{data.permisjonOgPermittering}</span><br/>
      <span>FOM:</span><span>{data.permisjonsPeriode.fom && data.permisjonsPeriode.fom.slice(0,10)}</span><br/>
      <span>TOM:</span><span>{data.permisjonsPeriode.fom && data.permisjonsPeriode.fom.slice(0,10)}</span><br/>
      <span>permisjonsprosent:</span><span>{""+data.permisjonsprosent}</span>
    </div>
  );
}

const PermisjonOgPermittering = ({arbeidsforhold}) => {
  if (!arbeidsforhold || !arbeidsforhold.permisjonOgPermittering) {
    return null;
  }
  debugger;
  let {permisjonOgPermittering} = arbeidsforhold;
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
  return (
    <p>Arbeidsgiver:&nbsp;{organisasjon.navn.redigertNavn} {organisasjon.orgnummer}</p>
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
const Person = ({
  person,
  fnr
}) => {
  if (!person || !person.aktoer) {
    return null;
  }
  let foedselsdato = moment(person.foedselsdato.foedselsdato.slice(0,10));
  let now = moment();
  let alder = now.diff(foedselsdato, 'years');
  let {gatenavn, husnummer, husbokstav, poststed, landkode} = person.bostedsadresse.strukturertAdresse;
  let sammensatt = gatenavn;
  if (husnummer) sammensatt += ' '+husnummer;
  if (husbokstav) sammensatt += ' '+husbokstav;
  return (
    <Ekspanderbartpanel tittel={person.personnavn.sammensattNavn +' ('+ alder + ' år)'}>
      <Normaltekst>{fnr}</Normaltekst>
      <h4>Personopplysninger</h4>
      <p>
        <span>Adresse: </span><span>{sammensatt}</span><br/>
        <span>Postnr/Sted: </span><span>{poststed}</span><br/>
        <span>Land: </span><span>{landkode}</span><br/>
        <span>Statsborgerskap: </span><span>{person.statsborgerskap.land}</span>
      </p>
    </Ekspanderbartpanel>
  );
}

class ArbeidsforholdDetalj extends React.Component {

  componentDidMount() {
    let {fnr, orgnr} = this.props.match.params;
    this.props.hentPerson(fnr);
    this.props.hentOrganisasjon(orgnr);
    this.props.hentArbeidsforholdDetalj(fnr, orgnr);
  }

  render() {
    const { fnr } = this.props.match.params;
    const { person, organisasjon, arbeidsforhold } = this.props;

    return (
      <JustChildren>
        <section className="arbeidsforhold-arbeidstaker">
          <Panel>
            <Person person={person} fnr={fnr}/>
          </Panel>
          <br />
          <Panel>
            <Ekspanderbartpanel tittel="Arbeidstaker/Næringsdrivende">
              <Normaltekst>Arbeidsforhold</Normaltekst>
              <Detaljer arbeidsforhold={arbeidsforhold}/>
              <Oversikt arbeidsforhold={arbeidsforhold}/>
            </Ekspanderbartpanel>
            <br/>
            <PermisjonOgPermittering arbeidsforhold={arbeidsforhold}/>
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
    person: state.person.data,
    organisasjon: state.organisasjon.data,
    arbeidsforhold: state.arbeidsforholdDetalj.data
  });
};

const mapDispatchToProps = (dispatch) => ({
  hentPerson: (fnr) => dispatch(hentPerson(fnr)),
  hentOrganisasjon: (orgnr) => dispatch(hentOrganisasjon(orgnr)),
  hentArbeidsforholdDetalj: (fnr, orgnr) => dispatch(hentArbeidsforholdDetalj(fnr, orgnr))
});

export default connect(mapStateToProps, mapDispatchToProps)(ArbeidsforholdDetalj);