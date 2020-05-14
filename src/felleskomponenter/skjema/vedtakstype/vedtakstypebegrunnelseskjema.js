import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema';

const VedtakstypebegrunnelseSkjema = ({
  className,
  redigerbart,
  feltNavn,
  label,
}) => (
  <Skjema.Select
    feltNavn={feltNavn}
    label={label}
    className={className}
    disabled={!redigerbart}
  >
    {
      MKV.KTObjects.begrunnelser.nyvurderingbakgrunner.map(({ kode, term }) => <option key={kode} value={kode}>{term}</option>)
    }
  </Skjema.Select>
);

VedtakstypebegrunnelseSkjema.propTypes = {
  className: PT.string,
  redigerbart: PT.bool.isRequired,
  feltNavn: PT.string.isRequired,
  label: PT.string.isRequired,
};

VedtakstypebegrunnelseSkjema.defaultProps = {
  className: undefined,
};

export default VedtakstypebegrunnelseSkjema;
