import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema';

const VedtaktypeSkjema = ({
  className,
  redigerbart,
}) => (
  <Skjema.RadioGruppe className={className} feltNavn="vedtakstype" label="Hvilken type vedtak skal fattes?">
    <Skjema.Radio
      feltNavn="vedtakstype"
      label="Korrigert vedtak"
      value={MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK}
      disabled={!redigerbart}
    />
    <Skjema.Radio
      feltNavn="vedtakstype"
      label="Omgjøringsvedtak"
      value={MKV.Koder.vedtakstyper.OMGJØRINGSVEDTAK}
      disabled
    />
  </Skjema.RadioGruppe>
);

VedtaktypeSkjema.propTypes = {
  className: PT.string,
  redigerbart: PT.bool.isRequired,
};

VedtaktypeSkjema.defaultProps = {
  className: undefined,
};

export default VedtaktypeSkjema;
