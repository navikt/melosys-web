import VedleggVelgerRow from "./vedleggVelgerRow";
import * as Nav from "../../navFrontend";
import { FysiskDokument, BrevVedlegg } from "../../services/modules/dokumenter-v2";

interface VedleggTableProps {
  valgteVedlegg: BrevVedlegg;
  alleVedlegg: FysiskDokument[];
  slettVedlegg: (vedleggID: string) => void;
  leggTilVedlegg: (vedlegg: FysiskDokument) => void;
}

function VedleggVelgerTable({ valgteVedlegg, alleVedlegg, slettVedlegg, leggTilVedlegg }: VedleggTableProps) {
  const vedleggErMarkert = (vedleggID: string) => Boolean(valgteVedlegg.saksvedlegg.find((vedlegg) => vedlegg.id === vedleggID));

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
        {valgteVedlegg.standardvedlegg.map((enkeltStandardvedlegg) => (
          <VedleggVelgerRow
            key={enkeltStandardvedlegg.malnavn}
            vedlegg={enkeltStandardvedlegg}
            leggTilVedlegg={() => leggTilVedlegg(enkeltStandardvedlegg)}
            slettVedlegg={() => slettVedlegg(enkeltStandardvedlegg.id)}
            vedleggErMarkert={vedleggErMarkert(enkeltStandardvedlegg.id)}
            />
          ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
}

export default VedleggVelgerTable;
