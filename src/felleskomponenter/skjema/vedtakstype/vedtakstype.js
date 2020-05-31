import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';

import VedtakstypeBegrunnelseSkjema from './vedtakstypebegrunnelseskjema';
import VedtakstypeSkjema from './vedtakstypeskjema';

const Vedtakstype = ({
  className,
  redigerbart,
  vedtakstypeFeltNavn,
  vedtakstypebegrunnelseFeltNavn,
  vedtakstypeLabel,
  vedtakstypebegrunnelseLabel,
}) => (
  <Nav.Row className={className}>
    <Nav.Column xs="6">
      <VedtakstypeSkjema
        redigerbart={redigerbart}
        feltNavn={vedtakstypeFeltNavn}
        label={vedtakstypeLabel}
      />
      <VedtakstypeBegrunnelseSkjema
        redigerbart={redigerbart}
        feltNavn={vedtakstypebegrunnelseFeltNavn}
        label={vedtakstypebegrunnelseLabel}
      />
    </Nav.Column>
  </Nav.Row>
);

Vedtakstype.propTypes = {
  className: PT.string,
  redigerbart: PT.bool.isRequired,
  vedtakstypeFeltNavn: PT.string,
  vedtakstypebegrunnelseFeltNavn: PT.string,
  vedtakstypeLabel: PT.string,
  vedtakstypebegrunnelseLabel: PT.string,
};

Vedtakstype.defaultProps = {
  className: undefined,
  vedtakstypeFeltNavn: 'vedtakstypebegrunnelse',
  vedtakstypebegrunnelseFeltNavn: 'vedtakstype',
  vedtakstypeLabel: 'Hvilken type vedtak skal fattes?',
  vedtakstypebegrunnelseLabel: 'Bakgrunn for nytt vedtak',
};

export default Vedtakstype;
