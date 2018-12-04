/* eslint import/prefer-default-export:off */
import PT from 'prop-types';

const DokumentNullAblePropType = PT.shape({
  dokumentID: PT.string,
  tittel: PT.string,
});
const VedleggPropType = PT.arrayOf(DokumentNullAblePropType);
export {
  DokumentNullAblePropType as Dokument,
  DokumentNullAblePropType as DokumentNullable,
  VedleggPropType as Vedlegg,
};
