import React from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as MPT from '../../proptypes';

import { behandlingerSelectors } from '../../ducks/behandlinger';
import { redigerbartSelectors } from '../../ducks/redigerbart';
import { behandlingsgrunnlagSelectors, behandlingsgrunnlagOperations } from '../../ducks/behandlingsgrunnlag';
import { OrganisasjonOperations, OrganisasjonSelectors } from '../../ducks/organisasjoner';

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
    arbeidsgivereNorge, hentOrganisasjon, organisasjoner, redigerbart, oppdaterBehandlingsgrunnlagState,
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
        oppdaterBehandlingsgrunnlagState={oppdaterBehandlingsgrunnlagState} />
    </div>
  );
};

ArbeidsgivereNorge.propTypes = {
  arbeidsgivereNorge: MPT.ArbeidsgivereNorge.isRequired,
  organisasjoner: MPT.Organisasjoner.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  oppdaterBehandlingsgrunnlagState: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

const mapStateToProps = state => ({
  arbeidsgivereNorge: behandlingerSelectors.ArbeidsgivereNorgeSelector(state),
  ekstraArbeidsgivere: behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
  organisasjoner: OrganisasjonSelectors.organisasjonerSelector(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentOrganisasjon: orgnr => dispatch(OrganisasjonOperations.hent(orgnr)),
  oppdaterBehandlingsgrunnlagState: () => dispatch(behandlingsgrunnlagOperations.oppdaterState()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ArbeidsgivereNorge);
