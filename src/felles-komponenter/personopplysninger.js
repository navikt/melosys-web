import React from 'react';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as Skjema from '../felles-komponenter/skjema';
import * as Ikoner from '../resources/images';

import { beregnAlder } from '../utils/dato';
import { kodeverkObjektTilTerm, kodeverkObjektTilKode } from '../utils/kodeverk';

import EnkeltDato from '../felles-komponenter/datoOmrade/enkeltDato';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import BostedsAdresse from './adresser/bostedsAdresse';
import PostAdresse from './adresser/postAdresse';
import LandVelger from './skjema/landvelger';

import UtenlandskID from './personopplysninger/utenlandskID';
import MedfolgendeFamilie from './personopplysninger/medfolgendeFamilie';
import MedfolgendeAndre from './personopplysninger/medfolgendeAndre';

import './personopplysninger.css';

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

function Personopplysninger(props) {
  const { person } = props;
  if (!person) return null;

  const {
    fnr,
    sivilstand,
    statsborgerskap,
    kjoenn,
    sammensattNavn,
    foedselsdato,
    bostedsadresse,
    postadresse,
    personStatus,
    erEgenAnsatt,
    familiemedlemmer,
  } = person;

  return (
    <div className="personopplysninger panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={
          <div className="personopplysninger__panelheader">
            <PanelHeader ikon={ikonFraKjonn(kodeverkObjektTilKode(kjoenn))} tittel={`${sammensattNavn} (${beregnAlder(foedselsdato)})`} undertittel={`Fødselsnummer: ${fnr}`} />
            <PersonMerkelapper personStatus={personStatus} erEgenAnsatt={erEgenAnsatt} />
          </div>}
        ariaTittel="Panel for personinformasjon"
      >
        <Nav.Container fluid>
          {/* START PERSONINFO */}
          <Nav.Row className="person__seksjon">
            <Nav.Column xs="6">
              <dl className="person__detaljer">
                <dt>Fødselsnummer:</dt><dd>{fnr}</dd>
                <dt>Statsborgerskap:</dt><dd>{kodeverkObjektTilTerm(statsborgerskap)}</dd>
                <dt>Fødselsdato:</dt><dd><EnkeltDato dato={foedselsdato} /></dd>
                <dt>Kjønn:</dt><dd>{kodeverkObjektTilTerm(kjoenn)}</dd>
                <dt>Sivilstand:</dt><dd>{sivilstand}</dd>
              </dl>
            </Nav.Column>
            <Nav.Column xs="6">
              <UtenlandskID />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="person__seksjon">
            <Nav.Column xs="4">
              <dl className="person__detaljer">
                <dt>Bostedsadresse (TPS):</dt>
                <BostedsAdresse bostedsadresse={bostedsadresse} />
              </dl>
            </Nav.Column>
            <Nav.Column xs="4">
              <dl className="person__detaljer">
                <dt>Postadresse (TPS):</dt>
                <PostAdresse postadresse={postadresse} />
              </dl>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="person__seksjon">
            <Nav.Column xs="6">
              <Nav.Fieldset legend="Adresse oppgitt i søknad:">
                <dl className="person__detaljer">
                  <Skjema.Input feltNavn="oppgittAdresseGatenavn" label="Gatenavn:" />
                  <Nav.Row>
                    <Nav.Column xs="4">
                      <Skjema.Input feltNavn="oppgittAdressePostnummer" bredde="XS" label="Postnummer:" />
                    </Nav.Column>
                    <Nav.Column xs="8">
                      <Skjema.Input feltNavn="oppgittAdressePoststed" label="Poststed:" />
                    </Nav.Column>
                  </Nav.Row>
                  <LandVelger feltNavn="oppgittAdresseLand" label="Land:" />
                </dl>
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="person__seksjon">
            <Nav.Column xs="12">
              {familiemedlemmer.length > 0 && <MedfolgendeFamilie familiemedlemmerAlle={familiemedlemmer} /> }
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="person__seksjon">
            <Nav.Column xs="12">
              <MedfolgendeAndre />
            </Nav.Column>
          </Nav.Row>
          {/* SLUTT PERSONINFO */}
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

Personopplysninger.propTypes = {
  person: MPT.Person.isRequired,
};

export default Personopplysninger;
