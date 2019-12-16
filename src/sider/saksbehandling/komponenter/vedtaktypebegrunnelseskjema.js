import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema';

const VedtaktypebegrunnelseSkjema = ({
  className,
  redigerbart,
}) => (
  <Skjema.Select
    feltNavn="vedtakstypebegrunnelse"
    label="Bakgrunn for nytt vedtak"
    className={className}
    disabled={!redigerbart}
  >
    {
      MKV.KTObjects.begrunnelser.nyvurderingbakgrunner.map(({ kode, term }) => <option key={kode} value={kode}>{term}</option>)
    }
  </Skjema.Select>
);

VedtaktypebegrunnelseSkjema.propTypes = {
  className: PT.string,
  redigerbart: PT.bool.isRequired,
};

VedtaktypebegrunnelseSkjema.defaultProps = {
  className: undefined,
};

export default VedtaktypebegrunnelseSkjema;
