import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import * as MPT from '../proptypes/';

import { fagsakSelectors } from '../ducks/fagsaker';
import { soknadSelectors } from '../ducks/soknad';
import { OrganisasjonOperations } from '../ducks/organisasjon';

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

class ArbeidsgivereNorge extends Component {
  render() {
    const { arbeidsgivereNorge, hentOrganisasjon } = this.props;

    return (
      <div className="arbeidsgivereNorge">
        {arbeidsgivereNorge.map(arbeidsgiver => <ArbeidsgivereEnkeltNorge key={uuid()} {...arbeidsgiver} />)}
        <FieldArray name="ekstraArbeidsgivere" component={EkstraArbeidsgivere} hentOrganisasjon={hentOrganisasjon} />
      </div>
    );
  }
}

ArbeidsgivereNorge.propTypes = {
  arbeidsgivereNorge: MPT.ArbeidsgivereNorge.isRequired,
};

const mapStateToProps = state => ({
  arbeidsgivereNorge: fagsakSelectors.ArbeidsgivereNorgeSelector(state),
  ekstraArbeidsgivere: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
});

const mapDispatchToProps = dispatch => ({
  hentOrganisasjon: orgnr => dispatch(OrganisasjonOperations.hent(orgnr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ArbeidsgivereNorge);
