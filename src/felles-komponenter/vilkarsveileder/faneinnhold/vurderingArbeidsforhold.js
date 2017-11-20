import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import EnkeltDato from '../../datoOmrade/enkeltDato';

import './vurderingArbeidsforhold.css';

const uuid = require('uuid/v4');

const ArbeidsforholdLinje = ({ arbeidsforhold, removeArbeidsforhold }) => (
  <div key={uuid()} className="arbeidsforhold__enkeltlinje">
    <div className="arbeidsforhold_enkeltlinje_tekst">
      <div className="arbeidsforhold__enkeltlinje__navn">{ arbeidsforhold.arbeidsgiver.navn }</div>
      <div className="arbeidsforhold__enkeltlinje__periode">Periode: <EnkeltDato dato={arbeidsforhold.ansettelsesPeriode.fom} /> - <EnkeltDato dato={arbeidsforhold.ansettelsesPeriode.tom} /></div>
    </div>
    <button className="arbeidsforhold__enkeltlinje__knapp" onClick={() => removeArbeidsforhold()}>-</button>
  </div>
);

ArbeidsforholdLinje.propTypes = {
  arbeidsforhold: MPT.Arbeidsforhold.isRequired,
  removeArbeidsforhold: PT.func.isRequired,
};

const VurderingArbeidsforhold = props => {
  const { bekreftOgFortsett, arbeidsforholdene } = props;

  return (
    <div className="vurderingarbeidsforhold">
      <Nav.Undertittel>Velg relevante arbeidsforhold:</Nav.Undertittel>
      <div>
        {arbeidsforholdene.map(arbeidsforhold => <ArbeidsforholdLinje key={uuid()} arbeidsforhold={arbeidsforhold} removeArbeidsforhold={() => {}} />)}
      </div>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingArbeidsforhold.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
};

export default VurderingArbeidsforhold;
