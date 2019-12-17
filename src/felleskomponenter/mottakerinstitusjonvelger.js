import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { change, Field } from 'redux-form';
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
  oppdaterKreverMottakerinstitusjon,
  ...rest
}) => {
  const landkodeIkkeNorge = landkode === MKV.Koder.landkoder.NO ? '' : landkode;
  const hentMottakerinstitusjoner = async () => Api.Eessi.mottakerinstitusjoner.hent(bucType, landkodeIkkeNorge);
  const [mottakerinstitusjoner] = useAsyncCallbackState(hentMottakerinstitusjoner, [], Utils.logger.error, [landkodeIkkeNorge, bucType]);

  useEffect(() => {
    oppdaterKreverMottakerinstitusjon(!Utils._isEmpty(mottakerinstitusjoner));
  }, [mottakerinstitusjoner]);

  if (Utils._isEmpty(mottakerinstitusjoner) || !redigerbart) {
    return null;
  }

  return (
    <SelectWrappedComponent
      label="Velg utenlandsk institusjon som skal motta SED"
      emptyFieldDisabled={false}
      emptyFieldText="Velg..."
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
  oppdaterKreverMottakerinstitusjon: PT.func.isRequired,
};

const Mottakerinstitusjonvelger = ({
  redigerbart,
  landkode,
  bucType,
  oppdaterKreverMottakerinstitusjon,
}) => (
  <Field
    name={MOTTAKERINSTITUSJON}
    component={MottakerinstitusjonvelgerSchema}
    props={{
      redigerbart,
      landkode,
      bucType,
      oppdaterKreverMottakerinstitusjon,
    }}
  />
);

Mottakerinstitusjonvelger.propTypes = {
  form: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  landkode: PT.string.isRequired,
  bucType: PT.string.isRequired,
  oppdaterKreverMottakerinstitusjon: PT.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch, ownProps) => ({
  oppdaterKreverMottakerinstitusjon: kreverMottakerinstitusjon => dispatch(change(ownProps.form, KREVER_MOTTAKERINSTITUSJON, kreverMottakerinstitusjon)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Mottakerinstitusjonvelger);
