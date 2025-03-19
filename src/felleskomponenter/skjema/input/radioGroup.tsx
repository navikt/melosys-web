import { Field } from "redux-form";
import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import { ReactNode } from "react";

/** Redux støtter i utgangspunktet ikke boolske valg i
 * radioknapper. Det betyr at alle true/false settes som string
 * 'true'/'false'. Normaliser disse scenarioene, men returner alle andre
 * radioknapp-valg som urørt.
 */
const normaliserReduxBoolean = (valg: any) => {
  if (valg === "true") return true;
  if (valg === "false") return false;
  return valg;
};

type InnerRadioGroupProps = RadioGroupProps & {
  input: any;
  meta: any;
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
  error: propError,
}: InnerRadioGroupProps) {
  const innerChange = (value: any) => {
    if (onChange) onChange(value);
    input.onChange(value);
  };

  const error = propError || (meta.touched && !meta.active ? meta.error : undefined);

  return (
    <Nav.RadioGroup
      legend={legend}
      value={input.value}
      name={`${name}-radiogroup`}
      className={className ?? ""}
      error={error}
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
  onChange?: (value: any) => void;
  id?: string;
  name: string;
  className?: string;
  legend: string | ReactNode;
  size?: "small" | "medium" | undefined;
  children: ReactNode;
  hideLegend?: boolean;
  readOnly?: boolean;
  error?: string;
}

function RadioGroup({ error, ...props }: RadioGroupProps) {
  return (
    <Field
      name={props.name}
      id={Utils._uuid()}
      component={InnerRadioGroup}
      props={{ ...props, error }}
      normalize={normaliserReduxBoolean}
    />
  );
}

export default RadioGroup;
