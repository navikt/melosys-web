import { FysiskDokument } from "Domene";

import { Fritekstvedlegg } from "../sideDialog/sendBrev/sendBrev";
import FritekstvedleggRow from "./fritekstvedleggRow";
import * as Nav from "../../navFrontend";
import VedleggRow from "./vedleggRow";
import "./vedleggTable.css";
import { Table } from "@navikt/ds-react";

interface VedleggTableProps {
  valgteVedlegg: FysiskDokument[];
  setValgteVedlegg: (valgteVedlegg: FysiskDokument[]) => void;
  label: string;
  fritekstvedlegg?: Fritekstvedlegg[];
  redigerFritekstvedlegg?: (index: number) => void;
  slettFritekstvedlegg?: (index: number) => void;
  lagFritekstPdfUrl?: (index: number) => Promise<string | false>;
}

const VedleggTable = ({
  valgteVedlegg,
  setValgteVedlegg,
  label,
  fritekstvedlegg,
  redigerFritekstvedlegg,
  slettFritekstvedlegg,
  lagFritekstPdfUrl,
}: VedleggTableProps) => {
  const slettVedlegg = (vedleggID: string) => {
    setValgteVedlegg(valgteVedlegg.filter(({ id }) => id !== vedleggID));
  };

  return (
    <>
      <Nav.Typo.Element className="vedleggtable-label">{label}</Nav.Typo.Element>
      {(valgteVedlegg.length > 0 || (fritekstvedlegg && fritekstvedlegg.length > 0)) && (
        <Table>
          <Table.Body>
            {fritekstvedlegg?.map((vedlegg, index) => (
              <FritekstvedleggRow
                fritekstvedlegg={vedlegg}
                redigerFritekstvedlegg={redigerFritekstvedlegg}
                slettFritekstvedlegg={slettFritekstvedlegg}
                key={vedlegg.tittel}
                index={index}
                lagFritekstPdfUrl={lagFritekstPdfUrl}
              />
            ))}
            {valgteVedlegg.map((enkeltVedlegg) => (
              <VedleggRow
                key={enkeltVedlegg.id}
                vedlegg={enkeltVedlegg}
                slettVedlegg={() => slettVedlegg(enkeltVedlegg.id)}
              />
            ))}
          </Table.Body>
        </Table>
      )}
    </>
  );
};

export default VedleggTable;
