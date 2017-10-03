import React from 'react';
import PT from 'prop-types';
import { Input as NavInput } from 'nav-frontend-skjema';
import { CustomField } from 'react-redux-form-validation';
import './skjema.css';

// eslint-disable-next-line no-unused-vars
function InnerInputComponent({ input, label, errorMessage, meta, ...rest }) {
    const feil = errorMessage ? { feilmelding: errorMessage[0] } : undefined;
    const inputProps = { ...input, ...rest };
    return <NavInput label={label} feil={feil} {...inputProps} />;
}

InnerInputComponent.propTypes = {
    label: PT.string.isRequired,
    bredde: PT.string,
    errorMessage: PT.arrayOf(PT.node),
    meta: PT.object, // eslint-disable-line react/forbid-prop-types
    input: PT.object, // eslint-disable-line react/forbid-prop-types
};

InnerInputComponent.defaultProps = {
    bredde: undefined,
    errorMessage: undefined,
    meta: undefined,
    input: undefined,
};

function Input({ feltNavn, ...rest }) {
    return (
        <CustomField
            name={feltNavn}
            errorClass="skjemaelement--harFeil"
            customComponent={<InnerInputComponent {...rest} />}
        />
    );
}

Input.propTypes = {
    feltNavn: PT.string.isRequired,
};

export default Input;
