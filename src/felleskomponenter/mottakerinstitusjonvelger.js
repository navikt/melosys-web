import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { change, Field, formValueSelector, FieldArray } from 'redux-form';
import * as PT from 'prop-types';

import * as Api from '../services/api';
import * as Utils from '../utils';
import MKV from '../melosyskodeverk';

import { useAsyncCallbackState } from '../hooks/useCallbackState';
import { SelectWrappedComponent } from './skjema/input/select';

const MOTTAKERINSTITUSJON = 'mottakerinstitusjon';
const KREVER_MOTTAKERINSTITUSJON = 'kreverMottakerinstitusjon';

export const MottakerinstitusjonvelgerSchema = ({
  redigerbart,
  bucType,
  landkode,
  label,
  oppdaterKreverMottakerinstitusjon,
  data_cy,
  ...rest
}) => {
  if (landkode === MKV.Koder.landkoder.NO) {
    return null;
  }

  const hentMottakerinstitusjoner = async () => Api.Eessi.mottakerinstitusjoner.hent(bucType, landkode);
  const [mottakerinstitusjoner] = useAsyncCallbackState(hentMottakerinstitusjoner, [], Utils.logger.error, [landkode, bucType]);

  useEffect(() => {
    oppdaterKreverMottakerinstitusjon(!Utils._isEmpty(mottakerinstitusjoner));
  }, [mottakerinstitusjoner]);

  if (Utils._isEmpty(mottakerinstitusjoner) || !redigerbart) {
    return null;
  }

  return (
    <SelectWrappedComponent
      label={label}
      emptyFieldDisabled={false}
      emptyFieldText="Velg..."
      data-cy={data_cy}
      {...rest}
    >
      {mottakerinstitusjoner.map(institusjon => <option key={institusjon.id} value={institusjon.id}>{institusjon.navn}</option>)}
    </SelectWrappedComponent>
  );
};

MottakerinstitusjonvelgerSchema.propTypes = {
  redigerbart: PT.bool.isRequired,
  bucType: PT.string.isRequired,
  landkode: PT.string.isRequired,
  label: PT.string,
  oppdaterKreverMottakerinstitusjon: PT.func.isRequired,
  data_cy: PT.string.isRequired,
};

MottakerinstitusjonvelgerSchema.defaultProps = {
  label: 'Velg utenlandsk institusjon som skal motta SED',
};

const Mottakerinstitusjonvelger = ({
  redigerbart,
  landkode,
  bucType,
  oppdaterKreverMottakerinstitusjon,
  data_cy,
}) => (
  <Field
    name={MOTTAKERINSTITUSJON}
    component={MottakerinstitusjonvelgerSchema}
    props={{
      redigerbart,
      landkode,
      bucType,
      oppdaterKreverMottakerinstitusjon,
      data_cy,
    }}
  />
);

Mottakerinstitusjonvelger.propTypes = {
  form: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  landkode: PT.string.isRequired,
  bucType: PT.string.isRequired,
  oppdaterKreverMottakerinstitusjon: PT.func.isRequired,
  data_cy: PT.string,
};

Mottakerinstitusjonvelger.defaultProps = {
  data_cy: 'mottakerinstitusjoner',
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch, ownProps) => ({
  oppdaterKreverMottakerinstitusjon: kreverMottakerinstitusjon => dispatch(change(ownProps.form, KREVER_MOTTAKERINSTITUSJON, kreverMottakerinstitusjon)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Mottakerinstitusjonvelger);

const mapStateToPropsFlervalg = (state, ownProps) => ({
  hentFelt: feltnavn => formValueSelector(ownProps.form)(state, feltnavn),
});

const mapDispatchToPropsFlervalg = dispatch => ({
  oppdaterKreverMottakerinstitusjon: (form, feltnavn) => kreverMottakerinstitusjon => dispatch(change(form, feltnavn, kreverMottakerinstitusjon)),
});

const MottakerinstitusjonvelgerFlervalgInner = ({
  oppdaterKreverMottakerinstitusjon,
  redigerbart,
  hentFelt,
  form,
  fields,
  bucType,
  data_cy,
}) =>
  fields.map(mottakerinstitusjon =>
    <Field
      key={`${mottakerinstitusjon}.id`}
      name={`${mottakerinstitusjon}.id`}
      component={MottakerinstitusjonvelgerSchema}
      props={{
        redigerbart,
        bucType,
        landkode: hentFelt(`${mottakerinstitusjon}.kode`),
        label: `Velg institusjon i ${hentFelt(`${mottakerinstitusjon}.term`)} som skal motta SED`,
        oppdaterKreverMottakerinstitusjon: oppdaterKreverMottakerinstitusjon(form, `${mottakerinstitusjon}.kreverMottakerinstitusjon`),
        data_cy,
      }}
    />);

MottakerinstitusjonvelgerFlervalgInner.propTypes = {
  oppdaterKreverMottakerinstitusjon: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  hentFelt: PT.func.isRequired,
  form: PT.string.isRequired,
  fields: PT.object.isRequired,
  bucType: PT.string.isRequired,
  data_cy: PT.string,
};

MottakerinstitusjonvelgerFlervalgInner.defaultProps = {
  data_cy: 'mottakerinstitusjoner',
};

const MottakerinstitusjonvelgerFlervalgWrapper = ({
  feltnavn,
  ...rest
}) => (
  <FieldArray
    name={feltnavn}
    component={MottakerinstitusjonvelgerFlervalgInner}
    props={{ ...rest }}
  />
);

MottakerinstitusjonvelgerFlervalgWrapper.propTypes = {
  feltnavn: PT.string.isRequired,
};

export const MottakerinstitusjonvelgerFlervalg = connect(mapStateToPropsFlervalg, mapDispatchToPropsFlervalg)(MottakerinstitusjonvelgerFlervalgWrapper);
