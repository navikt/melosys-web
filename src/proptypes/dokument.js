/* eslint import/prefer-default-export:off */
import PT from 'prop-types';

const DokumentPropType = PT.shape({
  dokumentID: PT.string.isRequired,
  tittel: PT.string.isRequired,
});
const DokumentNullAblePropType = PT.shape({
  dokumentID: PT.string,
  tittel: PT.string.isRequired,
});
const VedleggPropType = PT.arrayOf(DokumentNullAblePropType);
export {
  DokumentPropType as Dokument,
  DokumentNullAblePropType as DokumentNullable,
  VedleggPropType as Vedlegg,
};
