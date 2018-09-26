import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as MPT from '../proptypes/';

import { fagsakSelectors } from '../ducks/fagsaker';
import { soknadSelectors } from '../ducks/soknad';
import { OrganisasjonOperations, OrganisasjonSelectors } from '../ducks/organisasjon';

import Organisasjon from './arbeidsgiver/organisasjon';
import Arbeidsforholdene from './arbeidsgiver/arbeidsforhold';
import Inntekt from './arbeidsgiver/inntekt';
import EkstraArbeidsgivere from './arbeidsgiver/ekstraArbeidsgivere';

import './arbeidsgivereNorge.css';

const uuid = require('uuid/v4');

const ArbeidsgivereEnkeltNorge = props => {
  const { organisasjon, arbeidsforholdene, inntektListe } = props;

  return (
    <div>
      <Organisasjon organisasjon={organisasjon} />
      <Inntekt inntektListe={inntektListe} />
      <Arbeidsforholdene arbeidsforholdene={arbeidsforholdene} />
    </div>
  );
};

ArbeidsgivereEnkeltNorge.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  inntektListe: MPT.InntektListe.isRequired,
};

const ArbeidsgivereNorge = props => {
  const { arbeidsgivereNorge, hentOrganisasjon, organisasjoner } = props;

  return (
    <div className="arbeidsgivereNorge">
      {arbeidsgivereNorge.map(arbeidsgiver => <ArbeidsgivereEnkeltNorge key={uuid()} {...arbeidsgiver} />)}
      <FieldArray
        name="ekstraArbeidsgivere"
        component={EkstraArbeidsgivere}
        organisasjoner={organisasjoner}
        hentOrganisasjon={hentOrganisasjon} />
    </div>
  );
}

ArbeidsgivereNorge.propTypes = {
  arbeidsgivereNorge: MPT.ArbeidsgivereNorge.isRequired,
  organisasjoner: MPT.Organisasjoner.isRequired,
  hentOrganisasjon: PT.func.isRequired,
};

const mapStateToProps = state => ({
  arbeidsgivereNorge: fagsakSelectors.ArbeidsgivereNorgeSelector(state),
  ekstraArbeidsgivere: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
  organisasjoner: OrganisasjonSelectors.organisasjonSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentOrganisasjon: orgnr => dispatch(OrganisasjonOperations.hent(orgnr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ArbeidsgivereNorge);
