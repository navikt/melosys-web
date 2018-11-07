import React, { Component } from 'react';
import PT from 'prop-types';

import * as MPT from '../../proptypes';

import Organisasjon from './organisasjon';
import EkstraArbeidsgiverLeggTil from './ekstraArbeidsgivereLeggTil';

import './ekstraArbeidsgivere.css';

const uuid = require('uuid/v4');

/** Enkeltlinje for juridisk arbeidsgiver. Vises som ekspanderbart panel på samme måte som de andre,
 * men da uten inntekt og arbeidsforhold.
 * @param organisasjon
 * @param slettHandle
 * @returns {*}
 * @constructor
 */
const ArbeidsgiverEnkelt = ({ organisasjon, slettHandle }) => (
  <Organisasjon organisasjon={organisasjon} slettHandle={slettHandle} />
);

ArbeidsgiverEnkelt.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  slettHandle: PT.func.isRequired,
};

/** Hovedkomponent for å liste ut og legge til ekstra arbeidsgivere. Denne connecter
 * til Redux Form for å få tilgang til tilhørende FieldArray props.
 */
class EkstraArbeidsgivere extends Component {
  componentDidUpdate(prevProps) {
    const { fields, hentOrganisasjon, organisasjoner } = this.props;
    const gammelListe = prevProps.fields.getAll() || [];
    const nyListe = fields.getAll() || [];

    if (gammelListe.join('') === nyListe.join('')) { return; }

    this.props.oppdaterSoknadState();

    // Sjekk at orgnr som kommer fra feltet faktisk også er levert som en
    // organisasjon via soknad.tilleggsData.organisasjoner[].
    // Hvis ikke, trigg en ny henting av organisasjonen som en backup-løsning.

    const ikkeFunnetArbeidsgivere = nyListe.filter(orgnr => !organisasjoner.find(org => org.orgnr === orgnr));

    ikkeFunnetArbeidsgivere.forEach(orgnr => hentOrganisasjon(orgnr));
  }

  leggTil = orgnr => {
    const { fields } = this.props;
    fields.push(orgnr);
  };

  slett = indeks => {
    const { fields } = this.props;
    fields.remove(indeks);
  };

  render () {
    const { leggTil, slett } = this;
    const { fields, hentOrganisasjon, organisasjoner } = this.props;

    const alleEkstraArbeidsgivere = fields.getAll() || [];

    // Sjekk at orgnr som kommer fra feltet faktisk også er levert som en
    // organisasjon via soknad.tilleggsData.organisasjoner[].
    // Hvis ikke, trigg en ny henting av organisasjonen som en backup-løsning.

    const ikkeFunnetArbeidsgivere = alleEkstraArbeidsgivere.filter(orgnr => !organisasjoner.find(org => org.orgnr === orgnr));

    ikkeFunnetArbeidsgivere.forEach(orgnr => this.props.hentOrganisasjon(orgnr));

    return (
      <div className="panelSeksjon ekstraArbeidsgivere">
        {alleEkstraArbeidsgivere.map((orgnr, indeks) => <ArbeidsgiverEnkelt
          key={uuid()}
          slettHandle={() => slett(indeks)}
          organisasjon={organisasjoner.find(organisasjon => organisasjon.orgnr === orgnr) || {}}
        />)}
        <EkstraArbeidsgiverLeggTil leggTil={leggTil} hentOrganisasjon={hentOrganisasjon} />
      </div>
    );
  }
}

EkstraArbeidsgivere.propTypes = {
  fields: PT.object.isRequired,
  organisasjoner: MPT.Organisasjoner.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  oppdaterSoknadState: PT.func.isRequired,
};

export default EkstraArbeidsgivere;
