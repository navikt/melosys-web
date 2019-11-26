import React, { useEffect, useState } from 'react';
import * as PT from 'prop-types';

import * as Api from '../services/api';
import * as Nav from '../utils/navFrontend';
import * as Utils from '../utils';

import { useAsyncCallbackState } from '../hooks/useCallbackState';
import { lagYupToReduxformErrorMapper } from './skjema/validering/skjemaer';

const uuid = require('uuid/v4');

const { object, string } = Utils.yup;
const mottakerinstitusjonSchema = object().shape({
  mottakerinstitusjon: string().required({ feilmelding: 'Mottakerinstitusjon kreves' }),
});

const Mottakerinstitusjonvelger = ({
  redigerbart,
  bucType,
  landkode,
  valgtMottakerinstitusjon,
  valgtMottakerinstitusjonHandler,
  kreverMottakerinstitusjonHandler,
}) => {
  const hentMottakerinstitusjoner = async () => Api.Eessi.mottakerinstitusjoner.hent(bucType, landkode);
  const [mottakerinstitusjoner] = useAsyncCallbackState(hentMottakerinstitusjoner, []);
  const [feil, setFeil] = useState(undefined);

  useEffect(() => {
    kreverMottakerinstitusjonHandler(!Utils._isEmpty(mottakerinstitusjoner));
  }, [mottakerinstitusjoner]);

  const valider = mottakerinstitusjon => {
    const { mottakerinstitusjon: feilmelding } = lagYupToReduxformErrorMapper(mottakerinstitusjonSchema)({ mottakerinstitusjon });
    setFeil(feilmelding);
  };

  useEffect(() => {
    valider(valgtMottakerinstitusjon);
  }, [valgtMottakerinstitusjon]);

  const onValgtMottakerinstitusjonChange = e => {
    valgtMottakerinstitusjonHandler(e.target.value);
  };

  if (Utils._isEmpty(mottakerinstitusjoner) || !redigerbart) {
    return null;
  }

  return (
    <Nav.Select
      label="Velg utenlandsk institusjon som skal motta SED"
      onChange={onValgtMottakerinstitusjonChange}
      value={valgtMottakerinstitusjon}
      feil={feil}
    >
      <option key={uuid()} value="">Velg...</option>
      {mottakerinstitusjoner.map(institusjon => <option key={institusjon.id} value={institusjon.id}>{institusjon.navn}</option>)}
    </Nav.Select>
  );
};

Mottakerinstitusjonvelger.propTypes = {
  redigerbart: PT.bool.isRequired,
  bucType: PT.string.isRequired,
  landkode: PT.string.isRequired,
  valgtMottakerinstitusjon: PT.string.isRequired,
  valgtMottakerinstitusjonHandler: PT.func.isRequired,
  kreverMottakerinstitusjonHandler: PT.func.isRequired,
};

export default Mottakerinstitusjonvelger;
