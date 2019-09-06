import React from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as MPT from '../../../proptypes';

import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { soknadSelectors, soknadOperations } from '../../../ducks/soknad';
import { OrganisasjonOperations, OrganisasjonSelectors } from '../../../ducks/organisasjoner';

import Organisasjon from './arbeidsgiver/organisasjon';
import Arbeidsforholdene from './arbeidsgiver/arbeidsforhold';
import Inntekt from './arbeidsgiver/inntekt';
import EkstraArbeidsgivere from './arbeidsgiver/ekstraArbeidsgivere';

import './arbeidsgivereNorge.css';

const uuid = require('uuid/v4');

const ArbeidsgivereEnkeltNorge = props => {
  const {
    organisasjon, arbeidsforholdene, inntektListe, redigerbart,
  } = props;

  return (
    <div>
      <Organisasjon organisasjon={organisasjon} redigerbart={redigerbart} />
      <Inntekt inntektListe={inntektListe} />
      <Arbeidsforholdene arbeidsforholdene={arbeidsforholdene} />
    </div>
  );
};

ArbeidsgivereEnkeltNorge.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  inntektListe: MPT.InntektListe.isRequired,
  redigerbart: PT.bool.isRequired,
};

const ArbeidsgivereNorge = props => {
  const {
    arbeidsgivereNorge, hentOrganisasjon, organisasjoner, redigerbart, oppdaterSoknadState,
  } = props;

  return (
    <div className="arbeidsgivereNorge">
      {arbeidsgivereNorge.map(arbeidsgiver => <ArbeidsgivereEnkeltNorge key={uuid()} {...arbeidsgiver} redigerbart={redigerbart} />)}
      <FieldArray
        name="ekstraArbeidsgivere"
        component={EkstraArbeidsgivere}
        organisasjoner={organisasjoner}
        hentOrganisasjon={hentOrganisasjon}
        redigerbart={redigerbart}
        oppdaterSoknadState={oppdaterSoknadState} />
    </div>
  );
};

ArbeidsgivereNorge.propTypes = {
  arbeidsgivereNorge: MPT.ArbeidsgivereNorge.isRequired,
  organisasjoner: MPT.Organisasjoner.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  oppdaterSoknadState: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

const mapStateToProps = state => ({
  arbeidsgivereNorge: behandlingerSelectors.ArbeidsgivereNorgeSelector(state),
  ekstraArbeidsgivere: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
  organisasjoner: OrganisasjonSelectors.organisasjonerSelector(state),
  redigerbart: behandlingerSelectors.PanelerRedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentOrganisasjon: orgnr => dispatch(OrganisasjonOperations.hent(orgnr)),
  oppdaterSoknadState: () => dispatch(soknadOperations.oppdaterSoknadState()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ArbeidsgivereNorge);
