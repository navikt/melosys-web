import React from 'react';
import PT from 'prop-types';
import { validForm, rules } from 'react-redux-form-validation';

import { Hovedknapp } from 'nav-frontend-knapper';
import Input from '../../felles-komponenter/skjema/input/input';

const fnrValid = value => {
    return /^[0-9]{11}$/.test(value) ? undefined : 'Fnr må ha 11 siffer';
};

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
                    bredde="xl"
                    autoFocus
                />
                <Hovedknapp>Søk</Hovedknapp>
            </form>
        </div>
    );
}

SokeForm.propTypes = {
    handleSubmit: PT.func.isRequired,
};

export default validForm({
    form: 'sokeform',
    errorSummaryTitle: 'Fix these errors',
    validate: {
        fnr: [rules.required, fnrValid],
    },
})(SokeForm);
