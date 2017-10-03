import React from 'react';
import PT from 'prop-types';
import { CustomField } from 'react-redux-form-validation';
import { Textarea as NavFrontendTextarea } from 'nav-frontend-skjema';

function getTellerTekst(antallTegn, maxLength, visTellerFra) {
    const tegnIgjen = maxLength - antallTegn;
    const tegnForMange = antallTegn - maxLength;
    const tellerFra = visTellerFra || maxLength / 10;

    if (tegnForMange > 0) {
        const text = `tekstfelt.antalltegn.for-mange antall:${tegnForMange}`;
        return <span>{text}</span>;
    } else if (tegnIgjen <= tellerFra) {
        const text = `tekstfelt.antalltegn.flere-igjen antall:${tegnIgjen}`;
        return <span>{text}</span>;
    }
    return <span>&nbsp;</span>;
}

function InnerTextAreaComponent({
    input,
    label,
    placeholder,
    maxLength,
    errorMessage,
    visTellerFra,
    meta, // eslint-disable-line no-unused-vars
    ...rest
}) {
    const feil = errorMessage ? { feilmelding: errorMessage[0] } : undefined;
    return (
        <NavFrontendTextarea
            textareaClass="skjemaelement__input input--fullbredde"
            label={label}
            maxLength={maxLength}
            feil={feil}
            placeholder={placeholder}
            tellerTekst={antallTegn =>
                getTellerTekst(antallTegn, maxLength, visTellerFra)}
            {...input}
            {...rest}
        />
    );
}
InnerTextAreaComponent.propTypes = {
    label: PT.string,
    placeholder: PT.string,
    maxLength: PT.number.isRequired,
    errorMessage: PT.arrayOf(PT.oneOfType([PT.string, PT.node])),
    visTellerFra: PT.number,
    meta: PT.object, // eslint-disable-line react/forbid-prop-types
    input: PT.object, // eslint-disable-line react/forbid-prop-types
};

InnerTextAreaComponent.defaultProps = {
    errorMessage: undefined,
    meta: undefined,
    input: undefined,
    visTellerFra: undefined,
    label: undefined,
    placeholder: undefined,
};

function Textarea({ feltNavn, ...rest }) {
    return (
        <CustomField
            name={feltNavn}
            customComponent={<InnerTextAreaComponent {...rest} />}
        />
    );
}

Textarea.propTypes = {
    feltNavn: PT.string,
    visTellerFra: PT.number,
};

Textarea.defaultProps = {
    feltNavn: undefined,
    visTellerFra: 0,
};

export default Textarea;
