import React from 'react';
import PT from 'prop-types';
import { validForm, rules } from 'react-redux-form-validation';

import { Hovedknapp } from 'nav-frontend-knapper';
import Input from '../../felles-komponenter/skjema/input/input';
import withErrorHandling from '../../hoc/withErrorHandling';

const fnrValid = value => (
  /^[0-9]{11}$/.test(value) ? undefined : 'Fnr må ha 11 siffer'
);

function SokeForm({ handleSubmit, errorSummary }) {
  return (
    <div className="search-container">
      <h2 className="typo-undertittel">
        <span>Søk på person</span>
      </h2>
      <form onSubmit={handleSubmit}>
        {errorSummary}
        <Input
          feltNavn="fnr"
          label="Fnr. eller dnr."
          bredde="XL"
          autoFocus
        />
        <Hovedknapp>Søk</Hovedknapp>
      </form>
    </div>
  );
}

SokeForm.propTypes = {
  handleSubmit: PT.func.isRequired,
  errorSummary: PT.object,
};

SokeForm.defaultProps = {
  errorSummary: {},
};

const kontekster = [{ name: 'nyesaker', message: 'Det har oppstått en feil: Kunne ikke hente ny fagsaker.' }];

export default withErrorHandling(kontekster, validForm({
  form: 'sokeform',
  errorSummaryTitle: 'Fix these errors',
  validate: {
    fnr: [rules.required, fnrValid],
  },
})(SokeForm));
