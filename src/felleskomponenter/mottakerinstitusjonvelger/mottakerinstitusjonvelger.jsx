import { useEffect } from "react";
import { connect, useSelector } from "react-redux";
import { change, Field, formValueSelector, FieldArray, getFormValues } from "redux-form";
import * as PT from "prop-types";
import * as Utils from "../../utils";
import MKV from "../../melosyskodeverk";
import * as Api from "../../services/api";

import { SelectWrappedComponent } from "../skjema/input/select";
import { useAsyncCallbackState } from "../../hooks";

const MOTTAKERINSTITUSJON = "mottakerinstitusjon";
const KREVER_MOTTAKERINSTITUSJON = "kreverMottakerinstitusjon";

export function MottakerinstitusjonvelgerSchema({
  redigerbart,
  bucType,
  form,
  landkode,
  label = "Velg utenlandsk institusjon som skal motta SED",
  oppdaterKreverMottakerinstitusjon,
  ...rest
}) {
  const formValues = useSelector((state) => getFormValues(form)(state));
  const { lovvalgsland } = formValues ?? {};
  const hentMottakerinstitusjoner = async () => Api.Eessi.mottakerinstitusjoner.hent(bucType, [landkode]);
  const [mottakerinstitusjoner] = useAsyncCallbackState(
    hentMottakerinstitusjoner,
    [],
    [landkode, bucType, lovvalgsland ?? landkode],
  );

  useEffect(() => {
    oppdaterKreverMottakerinstitusjon(!Utils._isEmpty(mottakerinstitusjoner));

    return () => {
      oppdaterKreverMottakerinstitusjon(undefined);
    };
  }, [lovvalgsland, mottakerinstitusjoner]);

  // Automatisk velg institusjon hvis det kun finnes én
  useEffect(() => {
    if (mottakerinstitusjoner?.length === 1 && rest.input?.onChange) {
      rest.input.onChange(mottakerinstitusjoner[0].id);
    }
  }, [mottakerinstitusjoner]);

  if (Utils._isEmpty(mottakerinstitusjoner) || !redigerbart) {
    return null;
  }

  return (
    <SelectWrappedComponent label={label} emptyFieldDisabled={false} {...rest}>
      {mottakerinstitusjoner.map((institusjon) => (
        <option key={institusjon.id} value={institusjon.id}>
          {institusjon.navn}
        </option>
      ))}
    </SelectWrappedComponent>
  );
}

MottakerinstitusjonvelgerSchema.propTypes = {
  redigerbart: PT.bool.isRequired,
  bucType: PT.string.isRequired,
  form: PT.string.isRequired,
  landkode: PT.string.isRequired,
  label: PT.string,
  oppdaterKreverMottakerinstitusjon: PT.func.isRequired,
};

function Mottakerinstitusjonvelger({ form, redigerbart, landkode, bucType, oppdaterKreverMottakerinstitusjon }) {
  return landkode !== MKV.Koder.landkoder.NO ? (
    <Field
      name={MOTTAKERINSTITUSJON}
      component={MottakerinstitusjonvelgerSchema}
      props={{
        form,
        redigerbart,
        landkode,
        bucType,
        oppdaterKreverMottakerinstitusjon,
      }}
    />
  ) : null;
}

Mottakerinstitusjonvelger.propTypes = {
  form: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  landkode: PT.string.isRequired,
  bucType: PT.string.isRequired,
  oppdaterKreverMottakerinstitusjon: PT.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch, ownProps) => ({
  oppdaterKreverMottakerinstitusjon: (kreverMottakerinstitusjon) =>
    dispatch(change(ownProps.form, KREVER_MOTTAKERINSTITUSJON, kreverMottakerinstitusjon)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Mottakerinstitusjonvelger);

const mapStateToPropsFlervalg = (state, ownProps) => ({
  hentFelt: (feltnavn) => formValueSelector(ownProps.form)(state, feltnavn),
});

const mapDispatchToPropsFlervalg = (dispatch) => ({
  oppdaterKreverMottakerinstitusjon: (form, feltnavn) => (kreverMottakerinstitusjon) =>
    dispatch(change(form, feltnavn, kreverMottakerinstitusjon)),
});

function MottakerinstitusjonvelgerFlervalgInner({
  oppdaterKreverMottakerinstitusjon,
  redigerbart,
  hentFelt,
  form,
  fields,
  bucType,
}) {
  return fields
    .map((mottakerinstitusjon) => mottakerinstitusjon)
    .filter((mottakerinstitusjon) => hentFelt(`${mottakerinstitusjon}.kode`) !== MKV.Koder.landkoder.NO)
    .map((mottakerinstitusjon) => (
      <Field
        key={`${mottakerinstitusjon}.id`}
        name={`${mottakerinstitusjon}.id`}
        component={MottakerinstitusjonvelgerSchema}
        props={{
          redigerbart,
          bucType,
          form,
          landkode: hentFelt(`${mottakerinstitusjon}.kode`),
          label: `Velg institusjon i ${hentFelt(`${mottakerinstitusjon}.term`)} som skal motta SED`,
          oppdaterKreverMottakerinstitusjon: oppdaterKreverMottakerinstitusjon(
            form,
            `${mottakerinstitusjon}.kreverMottakerinstitusjon`,
          ),
        }}
      />
    ));
}

MottakerinstitusjonvelgerFlervalgInner.propTypes = {
  oppdaterKreverMottakerinstitusjon: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  hentFelt: PT.func.isRequired,
  form: PT.string.isRequired,
  fields: PT.object.isRequired,
  bucType: PT.string.isRequired,
};

function MottakerinstitusjonvelgerFlervalgWrapper({ feltnavn, ...rest }) {
  return <FieldArray name={feltnavn} component={MottakerinstitusjonvelgerFlervalgInner} props={{ ...rest }} />;
}

MottakerinstitusjonvelgerFlervalgWrapper.propTypes = {
  feltnavn: PT.string.isRequired,
};

export const MottakerinstitusjonvelgerFlervalg = connect(
  mapStateToPropsFlervalg,
  mapDispatchToPropsFlervalg,
)(MottakerinstitusjonvelgerFlervalgWrapper);
