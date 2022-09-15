import { FysiskDokument } from "Domene";
import React from "react";
import { Fritekstvedlegg } from "../sideDialog/sendBrev/sendBrev";
import FritekstvedleggRow from "./fritekstvedleggRow";
import VedleggRow from "./vedleggRow";

interface VedleggTableProps {
  valgteVedlegg: FysiskDokument[];
  alleVedlegg: FysiskDokument[];
  redigerer: boolean;
  slettVedlegg: (vedleggID: string) => void;
  leggTilVedlegg: (vedlegg: FysiskDokument) => void;
  fritekstvedlegg?: Fritekstvedlegg[];
  redigerFritekstvedlegg?: (index: number) => void;
  slettFritekstvedlegg?: (index: number) => void;
  lagPdfUrl?: (index: number) => Promise<string | false>;
}

const VedleggTable = ({
  valgteVedlegg,
  alleVedlegg,
  redigerer,
  slettVedlegg,
  leggTilVedlegg,
  fritekstvedlegg,
  redigerFritekstvedlegg,
  slettFritekstvedlegg,
  lagPdfUrl,
}: VedleggTableProps) => {
  const vedleggErMarkert = (vedleggID: string) => Boolean(valgteVedlegg.find((vedlegg) => vedlegg.id === vedleggID));
  const hentGjeldendeVedlegg = () => (redigerer ? alleVedlegg : valgteVedlegg);

  return (
    <table className="vedleggtable">
      <tbody>
        {fritekstvedlegg?.map((vedlegg, index) => (
          <FritekstvedleggRow
            fritekstvedlegg={vedlegg}
            redigerFritekstvedlegg={redigerFritekstvedlegg}
            slettFritekstvedlegg={slettFritekstvedlegg}
            key={vedlegg.tittel}
            index={index}
            lagPdfUrl={lagPdfUrl}
          />
        ))}
        {hentGjeldendeVedlegg().map((enkeltVedlegg) => (
          <VedleggRow
            key={enkeltVedlegg.id}
            vedlegg={enkeltVedlegg}
            leggTilVedlegg={() => leggTilVedlegg(enkeltVedlegg)}
            slettVedlegg={() => slettVedlegg(enkeltVedlegg.id)}
            vedleggErMarkert={vedleggErMarkert(enkeltVedlegg.id)}
            redigerer={redigerer}
          />
        ))}
      </tbody>
    </table>
  );
};

export default VedleggTable;
