import PT from "prop-types";
import { Field } from "redux-form";
import * as Nav from "../../../navFrontend";
import * as SkjemaUtils from "../utils";

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
  }
  if (tegnIgjen <= tellerFra) {
    const text = `Du har ${tegnIgjen} tegn igjen.`;
    return <span>{text}</span>;
  }
  return null;
}

function InnerTextAreaComponent({ label, placeholder, maxLength, visTellerFra, input, meta, onChange, ...rest }) {
  const { touched, active } = meta;
  const feil = touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

  const innerOnChange = (e) => {
    if (onChange) onChange(e);
    input.onChange(e);
  };

  const inputProps = { ...input, ...rest, feil, onChange: innerOnChange };

  return (
    <Nav.Textarea
      textareaClass="skjemaelement__input input--fullbredde"
      label={label}
      maxLength={20}
      placeholder={placeholder}
      tellerTekst={(antallTegn) => getTellerTekst(antallTegn, maxLength, visTellerFra)}
      {...inputProps}
    />
  );
}

InnerTextAreaComponent.propTypes = {
  label: PT.node,
  placeholder: PT.string,
  maxLength: PT.number,
  visTellerFra: PT.number,
  meta: PT.object, // eslint-disable-line react/forbid-prop-types
  input: PT.object, // eslint-disable-line react/forbid-prop-types
  onChange: PT.func,
};

InnerTextAreaComponent.defaultProps = {
  meta: undefined,
  input: undefined,
  maxLength: undefined,
  visTellerFra: undefined,
  label: undefined,
  placeholder: undefined,
  onChange: undefined,
};

function Textarea({ feltNavn, ...rest }) {
  return <Field name={feltNavn} component={InnerTextAreaComponent} props={rest} />;
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
