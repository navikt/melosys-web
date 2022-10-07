import { FysiskDokument } from "Domene";
import React from "react";
import VedleggVelgerRow from "./vedleggVelgerRow";

interface VedleggTableProps {
  valgteVedlegg: FysiskDokument[];
  alleVedlegg: FysiskDokument[];
  slettVedlegg: (vedleggID: string) => void;
  leggTilVedlegg: (vedlegg: FysiskDokument) => void;
}

const VedleggVelgerTable = ({ valgteVedlegg, alleVedlegg, slettVedlegg, leggTilVedlegg }: VedleggTableProps) => {
  const vedleggErMarkert = (vedleggID: string) => Boolean(valgteVedlegg.find((vedlegg) => vedlegg.id === vedleggID));

  return (
    <div className="vedleggvelger-table-wrapper">
      <table className="vedleggvelger-table">
        <tbody>
          {alleVedlegg.map((enkeltVedlegg) => (
            <VedleggVelgerRow
              key={enkeltVedlegg.id}
              vedlegg={enkeltVedlegg}
              leggTilVedlegg={() => leggTilVedlegg(enkeltVedlegg)}
              slettVedlegg={() => slettVedlegg(enkeltVedlegg.id)}
              vedleggErMarkert={vedleggErMarkert(enkeltVedlegg.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VedleggVelgerTable;
