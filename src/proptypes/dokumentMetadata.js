import PT from "prop-types";

const DokumentMetadataPropType = PT.shape({
  navn: PT.node,
  type: PT.string,
  data: PT.object,
  erSed: PT.bool,
});

const DokumenterPropType = PT.arrayOf(DokumentMetadataPropType);

export { DokumentMetadataPropType as DokumentMetadata, DokumenterPropType as DokumentMetadataListe };
