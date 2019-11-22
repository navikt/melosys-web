import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

const VedtakstypePropType = PT.oneOf([
  MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK,
  MKV.Koder.vedtakstyper.OMGJØRINGSVEDTAK,
  MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
]);

export { VedtakstypePropType as Vedtakstype };
