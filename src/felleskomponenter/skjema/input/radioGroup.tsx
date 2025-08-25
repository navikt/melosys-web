import { Field } from "redux-form";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import { ReactNode } from "react";
import "./radioGroup.less";
import { unwrapMelding } from "../utils";

/** Redux støtter i utgangspunktet ikke boolske valg i
 * radioknapper. Det betyr at alle true/false settes som string
 * 'true'/'false'. Normaliser disse scenarioene, men returner alle andre
 * radioknapp-valg som urørt.
 */
const normaliserReduxBoolean = (valg: string) => {
  if (valg === "true") {
    return true;
  }
  if (valg === "false") {
    return false;
  }
  return valg;
};

type InnerRadioGroupProps = RadioGroupProps & {
  input: {
    value: boolean | string;
    onChange: (value: boolean | string) => void;
  };
  meta: {
    error?: unknown; // kan være string eller { melding }
    touched?: boolean;
    active?: boolean;
  };
};

function InnerRadioGroup({
  input,
  meta,
  id,
  name,
  className,
  onChange,
  legend,
  size,
  children,
  readOnly,
  error,
}: InnerRadioGroupProps) {
  const innerChange = (value: string | boolean) => {
    if (onChange) onChange(value);
    input.onChange(value);
  };

  const explicitError = unwrapMelding(error);
  const metaError = unwrapMelding(meta.error);
  const errorMessage = explicitError ?? (meta.touched && !meta.active ? metaError : undefined);
  const hasError = !!errorMessage;
  const combinedClassName = hasError ? `${className ?? ""} skjema-radiogroup--has-error`.trim() : (className ?? "");

  return (
    <Nav.RadioGroup
      legend={legend}
      value={input.value}
      name={`${name}-radiogroup`}
      className={combinedClassName}
      error={errorMessage}
      onChange={innerChange}
      size={size}
      id={id}
      readOnly={readOnly}
    >
      {children}
    </Nav.RadioGroup>
  );
}

interface RadioGroupProps {
  onChange?: (value: unknown) => void;
  id?: string;
  name: string;
  className?: string;
  legend: string | ReactNode;
  size?: "small" | "medium" | undefined;
  children: ReactNode;
  hideLegend?: boolean;
  readOnly?: boolean;
  error?: unknown; // kan være string eller { melding }
}

function RadioGroup({ ...props }: RadioGroupProps) {
  return (
    <Field
      name={props.name}
      id={Utils._uuid()}
      component={InnerRadioGroup}
      props={props}
      normalize={normaliserReduxBoolean}
    />
  );
}

export default RadioGroup;
