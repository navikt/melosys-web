import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as Skjema from '../felles-komponenter/skjema';
import * as Ikoner from '../resources/images';

import { beregnAlder, formatterDatoTilNorsk } from '../utils/dato';
import { kodeverkObjektTilTerm, kodeverkObjektTilKode } from '../utils/kodeverk';

import EnkeltDato from '../felles-komponenter/datoOmrade/enkeltDato';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import BostedsAdresse from './adresser/bostedsAdresse';
import LandVelger from './skjema/landvelger';

import UtenlandskIdent from './personopplysninger/utenlandskIdent';
import MedfolgendeFamilie from './personopplysninger/medfolgendeFamilie';
import MedfolgendeAndre from './personopplysninger/medfolgendeAndre';

import './personopplysninger.css';
import { fagsakSelectors } from '../ducks/fagsaker';
import { PersonSelectors, PersonOperations } from '../ducks/personer';
import { soknadSelectors } from '../ducks/soknad';

const ikonFraKjonn = kjoenn => {
  switch (kjoenn) {
    case 'K': { return Ikoner.Kvinne; }
    case 'M': { return Ikoner.Mann; }
    default: { return Ikoner.Ukjentkjoenn; }
  }
};

const PersonMerkelapper = ({ personStatus, erEgenAnsatt }) => {
  const personStatusKode = kodeverkObjektTilKode(personStatus);
  const erPersonDod = (personStatusKode === 'DOD' || personStatusKode === 'DØD' || personStatusKode === 'DØDD');

  return (
    <div className="personopplysninger__personstatus">
      { erPersonDod && <Nav.EtikettBase type="advarsel">DØD</Nav.EtikettBase> }
      { erEgenAnsatt && <Nav.EtikettBase type="advarsel">Egen ansatt</Nav.EtikettBase> }
    </div>
  );
};

PersonMerkelapper.propTypes = {
  personStatus: MPT.Kodeverk,
  erEgenAnsatt: PT.bool,
};

PersonMerkelapper.defaultProps = {
  personStatus: {},
  erEgenAnsatt: false,
};

class Personopplysninger extends Component {
  sjekkPerson = fnr => {
    const { alleRelevantePersoner } = this.props;
    const { hentPerson } = this.props;

    const eksistererPersonenLokalt = alleRelevantePersoner.some(person => person.fnr === fnr);

    if (!eksistererPersonenLokalt) {
      hentPerson(fnr);
    }
  };

  render() {
    const { redigerbart, person, medfolgendeAndre } = this.props;
    const { sjekkPerson } = this;

    const {
      fnr,
      sivilstand,
      statsborgerskap,
      statsborgerskapDato,
      kjoenn,
      sammensattNavn,
      foedselsdato,
      bostedsadresse,
      personStatus,
      erEgenAnsatt,
      familiemedlemmer,
    } = person;

    if (Object.keys(person).length === 0) { return null; }

    return (
      <div className="personopplysninger panelSeksjon">
        <Nav.EkspanderbartpanelBase
          heading={
            <div className="personopplysninger__panelheader">
              <PanelHeader ikon={ikonFraKjonn(kodeverkObjektTilKode(kjoenn))} tittel={`${sammensattNavn} (${beregnAlder(foedselsdato)})`} undertittel={`Fødselsnummer: ${fnr}`} />
              <PersonMerkelapper personStatus={personStatus} erEgenAnsatt={erEgenAnsatt} />
            </div>}
          ariaTittel="Panel for personinformasjon">
          <Nav.Container fluid>
            {/* START PERSONINFO */}
            <Nav.Row className="person__seksjon">
              <Nav.Column xs="6">
                <dl className="person__detaljer">
                  <dt>Fnr / dnr:</dt><dd>{fnr}</dd>
                  <dt>Statsborgerskap pr {formatterDatoTilNorsk(statsborgerskapDato)}:</dt>
                  <dd>{kodeverkObjektTilTerm(statsborgerskap)}</dd>
                  <dt>Fødselsdato:</dt><dd><EnkeltDato dato={foedselsdato} /></dd>
                  <dt>Kjønn:</dt><dd>{kodeverkObjektTilTerm(kjoenn)}</dd>
                  <dt>Sivilstand:</dt><dd>{kodeverkObjektTilTerm(sivilstand)}</dd>
                </dl>
              </Nav.Column>
              <Nav.Column xs="6">
                <UtenlandskIdent disabled={!redigerbart} />
              </Nav.Column>
            </Nav.Row>
            <Nav.Row className="person__seksjon">
              <Nav.Column xs="4">
                <dl className="person__detaljer">
                  <dt>Bostedsadresse (TPS):</dt>
                  <BostedsAdresse bostedsadresse={bostedsadresse} />
                </dl>
              </Nav.Column>
            </Nav.Row>
            <Nav.Row className="person__seksjon">
              <Nav.Column xs="6">
                <Nav.Fieldset legend="Adresse oppgitt i søknad:">
                  <dl className="person__detaljer">
                    <Skjema.Input feltNavn="oppgittAdresseGatenavn" label="Gatenavn:" disabled={!redigerbart} />
                    <Skjema.Input feltNavn="oppgittAdresseHusnummer" bredde="XS" label="Husnummer:" disabled={!redigerbart} />
                    <Skjema.Input feltNavn="oppgittAdresseRegion" label="Region:" disabled={!redigerbart} />
                    <Nav.Row>
                      <Nav.Column xs="4">
                        <Skjema.Input feltNavn="oppgittAdressePostnummer" bredde="XS" label="Postnr:" disabled={!redigerbart} />
                      </Nav.Column>
                      <Nav.Column xs="8">
                        <Skjema.Input feltNavn="oppgittAdressePoststed" label="Poststed:" disabled={!redigerbart} />
                      </Nav.Column>
                    </Nav.Row>
                    <LandVelger disabled={!redigerbart} feltNavn="oppgittAdresseLand" label="Land:" />
                  </dl>
                </Nav.Fieldset>
              </Nav.Column>
            </Nav.Row>
            <Nav.Row className="person__seksjon">
              <Nav.Column xs="12">
                {familiemedlemmer.length > 0 && <MedfolgendeFamilie medfolgendeFamilie={familiemedlemmer} disabled={!redigerbart} /> }
              </Nav.Column>
            </Nav.Row>
            <Nav.Row className="person__seksjon">
              <Nav.Column xs="12">
                <MedfolgendeAndre medfolgendeAndre={medfolgendeAndre} sjekkPerson={sjekkPerson} disabled={!redigerbart} />
              </Nav.Column>
            </Nav.Row>
            {/* SLUTT PERSONINFO */}
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

Personopplysninger.propTypes = {
  redigerbart: PT.bool.isRequired,
  alleRelevantePersoner: PT.arrayOf(MPT.Person).isRequired,
  hentPerson: PT.func.isRequired,
  medfolgendeAndre: MPT.Person,
  person: MPT.Person.isRequired,
  personOpplysninger: PT.object.isRequired,
};

Personopplysninger.defaultProps = {
  medfolgendeAndre: {},
};

const mapStateToProps = state => ({
  alleRelevantePersoner: PersonSelectors.personerSelector(state),
  personOpplysninger: soknadSelectors.PersonOpplysningerSelector(state),
  person: fagsakSelectors.PersonSelector(state),
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
  medfolgendeAndre: soknadSelectors.MedfolgendeAndreSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentPerson: fnr => dispatch(PersonOperations.hent(fnr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Personopplysninger);
