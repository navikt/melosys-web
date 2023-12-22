import PT from "prop-types";

const DokumentMetadataPropType = PT.shape({
  dokumentNavn: PT.node,
  mottakerNavn: PT.node,
  dokumentData: PT.object,
  sedData: PT.object,
  sedType: PT.string,
});

const DokumenterPropType = PT.arrayOf(DokumentMetadataPropType);

export { DokumentMetadataPropType as DokumentMetadata, DokumenterPropType as DokumentMetadataListe };
