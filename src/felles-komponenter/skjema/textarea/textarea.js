import React from 'react';
import PT from 'prop-types';
import { Field } from 'redux-form';
import * as Nav from '../../../utils/navFrontend';

/** Returnerer en tekst som gir brukeren en indikasjon på hvor mange tegn
 * hun har igjen eller hvor mange tegn hun har overskridet. visTellerFra gjør at denne teksten ikke vises
 * før brukeren faktisk begynner å nærme seg en grense.
 *
 * @param antallTegn Antall tegn som brukeren har skrevet
 * @param maxLength Totalt antall tegn som godtas
 * @param visTellerFra Hvor mange tegn brukeren må være fra maks-grensen før linjen vises.
 * @returns {XML}
 */
function getTellerTekst(antallTegn, maxLength, visTellerFra) {
  const tegnIgjen = maxLength - antallTegn;
  const tegnForMange = antallTegn - maxLength;
  const tellerFra = visTellerFra || maxLength / 10;

  if (tegnForMange > 0) {
    const text = `Du har skrevet ${tegnForMange} tegn for mye.`;
    return <span>{text}</span>;
  } else if (tegnIgjen <= tellerFra) {
    const text = `Du har ${tegnIgjen} tegn igjen.`;
    return <span>{text}</span>;
  }
  return null;
}

function InnerTextAreaComponent({
  input,
  label,
  placeholder,
  maxLength,
  visTellerFra,
  ...rest
}) {
  const feil = (rest.meta.error && rest.meta.touched && !rest.meta.active) ? { feilmelding: rest.meta.error } : undefined;
  return (
    <Nav.Textarea
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
  visTellerFra: PT.number,
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
  input: PT.object, // eslint-disable-line react/forbid-prop-types
};

InnerTextAreaComponent.defaultProps = {
  meta: undefined,
  input: undefined,
  visTellerFra: undefined,
  label: undefined,
  placeholder: undefined,
};

function Textarea({ feltNavn, ...rest }) {
  return (
    <Field
      name={feltNavn}
      component={InnerTextAreaComponent}
      props={rest}
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
