import React from 'react';
import PT from 'prop-types';

import * as Skjema from '../../../felleskomponenter/skjema';

import './vedtaktype.css';

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
    <option key="VELG" value="" disabled>Velg...</option>
    {
      ['test', 'begrunnelse'].map(begrunnelse => <option key={begrunnelse} value={begrunnelse}>{begrunnelse}</option>)
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
