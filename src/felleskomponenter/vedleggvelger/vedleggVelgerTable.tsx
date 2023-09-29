import { FysiskDokument } from "Domene";

import VedleggVelgerRow from "./vedleggVelgerRow";
import { Table } from "@navikt/ds-react";

interface VedleggTableProps {
  valgteVedlegg: FysiskDokument[];
  alleVedlegg: FysiskDokument[];
  slettVedlegg: (vedleggID: string) => void;
  leggTilVedlegg: (vedlegg: FysiskDokument) => void;
}

const VedleggVelgerTable = ({ valgteVedlegg, alleVedlegg, slettVedlegg, leggTilVedlegg }: VedleggTableProps) => {
  const vedleggErMarkert = (vedleggID: string) => Boolean(valgteVedlegg.find((vedlegg) => vedlegg.id === vedleggID));

  return (
    <Table>
      <Table.Body>
        {alleVedlegg.map((enkeltVedlegg) => (
          <VedleggVelgerRow
            key={enkeltVedlegg.id}
            vedlegg={enkeltVedlegg}
            leggTilVedlegg={() => leggTilVedlegg(enkeltVedlegg)}
            slettVedlegg={() => slettVedlegg(enkeltVedlegg.id)}
            vedleggErMarkert={vedleggErMarkert(enkeltVedlegg.id)}
          />
        ))}
      </Table.Body>
    </Table>
  );
};

export default VedleggVelgerTable;
