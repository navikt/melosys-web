import React, { ComponentProps } from "react";
import { FieldArray, WrappedFieldArrayProps, change } from "redux-form";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";

import * as SkjemaUtils from "../utils";

import MultiSelect from "../../multiSelect";

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  endreFelt: (form: string, field: string, value: any) => dispatch(change(form, field, value)),
});
const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type InnerMultiSelectComponentBaseProps = Omit<ComponentProps<typeof MultiSelect>, "feil" | "onChange" | "values"> & {
  feltNavn: string;
  onChange?: (selectedOptions: string[]) => void;
};

type InnerMultiSelectComponentProps = WrappedFieldArrayProps<string> &
  PropsFromRedux &
  InnerMultiSelectComponentBaseProps;

function InnerMultiSelectComponent({
  label,
  options,
  redigerbart,
  fields,
  meta,
  endreFelt,
  feltNavn,
  onChange,
}: InnerMultiSelectComponentProps) {
  const feil = meta.submitFailed ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

  return (
    <MultiSelect
      label={label}
      onChange={(selectedOptions) => {
        const selectedValues = selectedOptions.map(({ value }) => value);
        if (onChange) onChange(selectedValues);
        endreFelt(meta.form, feltNavn, selectedValues);
      }}
      options={options}
      feil={feil}
      values={fields.getAll()}
      redigerbart={redigerbart}
    />
  );
}

const ConnectedInnerMultiSelectComponent = connector(InnerMultiSelectComponent);

type ReduxFormConnectedMultiSelectProps = InnerMultiSelectComponentBaseProps;

function ReduxFormConnectedMultiSelect(props: ReduxFormConnectedMultiSelectProps) {
  return <FieldArray name={props.feltNavn} props={props} component={ConnectedInnerMultiSelectComponent} />;
}

export default ReduxFormConnectedMultiSelect;
