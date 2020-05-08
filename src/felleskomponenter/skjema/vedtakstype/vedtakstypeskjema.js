import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema';

const VedtakstypeSkjema = ({
  className,
  redigerbart,
  feltNavn,
  label,
}) => (
  <Skjema.RadioGruppe className={className} feltNavn={feltNavn} label={label}>
    <Skjema.Radio
      feltNavn={feltNavn}
      label="Korrigert vedtak"
      value={MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK}
      disabled={!redigerbart}
    />
    <Skjema.Radio
      feltNavn={feltNavn}
      label="Omgjøringsvedtak"
      value={MKV.Koder.vedtakstyper.OMGJØRINGSVEDTAK}
      disabled
    />
  </Skjema.RadioGruppe>
);

VedtakstypeSkjema.propTypes = {
  className: PT.string,
  redigerbart: PT.bool.isRequired,
  feltNavn: PT.string.isRequired,
  label: PT.string.isRequired,
};

VedtakstypeSkjema.defaultProps = {
  className: undefined,
};

export default VedtakstypeSkjema;
