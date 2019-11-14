import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../utils/navFrontend';

const Vedtaktype = ({
  onChange,
  className,
  value,
}) => (
  <Nav.Fieldset
    legend="Hvilken type vedtak skal fattes?"
    className={className}
  >
    <Nav.Radio
      name="vedtaktype"
      label="Korrigert vedtak"
      value={MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK}
      checked={value === MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK}
      onChange={onChange}
    />
    <Nav.Radio
      name="vedtaktype"
      label="Omgjøringsvedtak"
      value={MKV.Koder.vedtakstyper.OMGJØRINGSVEDTAK}
      checked={value === MKV.Koder.vedtakstyper.OMGJØRINGSVEDTAK}
      onChange={onChange}
      disabled
    />
  </Nav.Fieldset>
);

Vedtaktype.propTypes = {
  onChange: PT.func.isRequired,
  value: PT.string.isRequired,
  className: PT.string,
};

Vedtaktype.defaultProps = {
  className: undefined,
};

export default Vedtaktype;
