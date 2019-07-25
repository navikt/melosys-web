import React from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as MPT from '../proptypes/';

import { behandlingerSelectors } from '../ducks/behandlinger';
import { soknadSelectors, soknadActions } from '../ducks/soknad';
import { OrganisasjonOperations, OrganisasjonSelectors } from '../ducks/organisasjoner';
import { formSelectors } from '../ducks/form/';

import Organisasjon from '../felleskomponenter/arbeidsgiver/organisasjon';
import Arbeidsforholdene from '../felleskomponenter/arbeidsgiver/arbeidsforhold';
import Inntekt from '../felleskomponenter/arbeidsgiver/inntekt';
import EkstraArbeidsgivere from '../sider/saksbehandling/komponenter/arbeidsgiver/ekstraArbeidsgivere';

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
        hentOrganisasjon={hentOrganisasjon}
        oppdaterSoknadState={() => props.oppdaterSoknadState(props.skjema)} />
    </div>
  );
};

ArbeidsgivereNorge.propTypes = {
  arbeidsgivereNorge: MPT.ArbeidsgivereNorge.isRequired,
  organisasjoner: MPT.Organisasjoner.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  skjema: PT.object.isRequired,
  oppdaterSoknadState: PT.func.isRequired,
};

const mapStateToProps = state => ({
  arbeidsgivereNorge: behandlingerSelectors.ArbeidsgivereNorgeSelector(state),
  ekstraArbeidsgivere: soknadSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
  organisasjoner: OrganisasjonSelectors.organisasjonerSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
});

const mapDispatchToProps = dispatch => ({
  hentOrganisasjon: orgnr => dispatch(OrganisasjonOperations.hent(orgnr)),
  oppdaterSoknadState: skjema => dispatch(soknadActions.oppdaterSoknadState(skjema)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ArbeidsgivereNorge);
