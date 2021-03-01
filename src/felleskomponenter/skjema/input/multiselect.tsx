import React, { ComponentProps } from "react";
import { FieldArray, WrappedFieldArrayProps, change } from "redux-form";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";

import * as SkjemaUtils from "../utils";

import MultiSelect, { OptionBase } from "../../multiSelect";

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  endreFelt: (form: string, field: string, value: any) => dispatch(change(form, field, value)),
});
const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type InnerMultiSelectComponentBaseProps = Omit<ComponentProps<typeof MultiSelect>, "feil" | "onChange" | "values"> & {
  feltNavn: string;
  onChange?: (selectedOptions: OptionBase[]) => void;
};

type InnerMultiSelectComponentProps = WrappedFieldArrayProps<OptionBase> &
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
  const feil = SkjemaUtils.mapReduxFormFeilTilNavFeil(meta);

  return (
    <MultiSelect
      label={label}
      onChange={(value) => {
        if (onChange) onChange(value);
        endreFelt(meta.form, feltNavn, value);
      }}
      options={options}
      feil={feil}
      values={fields.getAll().map(({ value }) => value)}
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
