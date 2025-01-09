import { FysiskDokument } from "Domene";
import VedleggVelgerRow from "./vedleggVelgerRow";
import * as Nav from "../../navFrontend";

interface VedleggTableProps {
  valgteVedlegg: FysiskDokument[];
  alleVedlegg: FysiskDokument[];
  slettVedlegg: (vedleggID: string) => void;
  leggTilVedlegg: (vedlegg: FysiskDokument) => void;
}

function VedleggVelgerTable({ valgteVedlegg, alleVedlegg, slettVedlegg, leggTilVedlegg }: VedleggTableProps) {
  const vedleggErMarkert = (vedleggID: string) => Boolean(valgteVedlegg.find((vedlegg) => vedlegg.id === vedleggID));

  return (
    <Nav.Table>
      <Nav.Table.Body>
        {alleVedlegg.map((enkeltVedlegg) => (
          <VedleggVelgerRow
            key={enkeltVedlegg.id}
            vedlegg={enkeltVedlegg}
            leggTilVedlegg={() => leggTilVedlegg(enkeltVedlegg)}
            slettVedlegg={() => slettVedlegg(enkeltVedlegg.id)}
            vedleggErMarkert={vedleggErMarkert(enkeltVedlegg.id)}
          />
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
}

export default VedleggVelgerTable;
