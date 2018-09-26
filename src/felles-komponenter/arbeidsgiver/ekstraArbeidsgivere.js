import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as API from '../../services/api';
import * as MPT from '../../proptypes';

import Organisasjon from './organisasjon';
import EkstraArbeidsgiverLeggTil from './ekstraArbeidsgivereLeggTil';

import './ekstraArbeidsgivere.css';

const uuid = require('uuid/v4');

class ArbeidsgiverEnkelt extends Component {
  slettHandle = () => {

  };

  render() {
    const { organisasjon } = this.props;
    const { slettHandle } = this;

    return (organisasjon && <Organisasjon organisasjon={organisasjon} slettHandle={slettHandle} />);
  }
}

ArbeidsgiverEnkelt.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
}

/** Dette er komponenten for ett enkelt Arbeidsforhold. Denne eksporteres ikke til omverden, men brukes
 * kun av komponenten Arbeidsforholdene.
 *
 * @param props Et objekt med det aktuelle arbeidsforholdet.
 */
class EkstraArbeidsgivere extends Component {
  leggTil = orgnr => {
    const { fields } = this.props;
    fields.push(orgnr);
  };

  slett = indeks => {

  };

  render () {
    const { leggTil } = this;
    const { fields, hentOrganisasjon, organisasjoner } = this.props;

    console.log(organisasjoner)

    const alleEkstraArbeidsgivere = fields.getAll() || [];

    return (
      <div className="panelSeksjon ekstraArbeidsgiver">
        {alleEkstraArbeidsgivere.map(arbeidsgiverOrg => <ArbeidsgiverEnkelt key={uuid()} organisasjon={organisasjoner.find(organisasjon => organisasjon.orgnr === arbeidsgiverOrg)} />)}
        <EkstraArbeidsgiverLeggTil leggTil={leggTil} hentOrganisasjon={hentOrganisasjon} />
      </div>
    );
  }
}

EkstraArbeidsgivere.propTypes = {
  fields: PT.object.isRequired,
  organisasjoner: MPT.Organisasjoner.isRequired,
  hentOrganisasjon: PT.func.isRequired,
};

export default EkstraArbeidsgivere;
