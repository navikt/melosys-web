import { FysiskDokument } from "Domene";

import { Fritekstvedlegg } from "../sideDialog/sendBrev/sendBrev";
import FritekstvedleggRow from "./fritekstvedleggRow";
import VedleggRow from "./vedleggRow";
import * as Nav from "../../navFrontend";
import "./vedleggTable.css";

interface VedleggTableProps {
  valgteVedlegg: FysiskDokument[];
  setValgteVedlegg: (valgteVedlegg: FysiskDokument[]) => void;
  label: string;
  fritekstvedlegg?: Fritekstvedlegg[];
  redigerFritekstvedlegg?: (index: number) => void;
  slettFritekstvedlegg?: (index: number) => void;
  lagFritekstPdfUrl?: (index: number) => Promise<string | false>;
  redigerbart: boolean;
}

const VedleggTable = ({
  valgteVedlegg,
  setValgteVedlegg,
  label,
  fritekstvedlegg,
  redigerFritekstvedlegg,
  slettFritekstvedlegg,
  lagFritekstPdfUrl,
  redigerbart,
}: VedleggTableProps) => {
  const slettVedlegg = (vedleggID: string) => {
    setValgteVedlegg(valgteVedlegg.filter(({ id }) => id !== vedleggID));
  };

  return (
    <Nav.Table className="vedleggtable" size="small">
      <Nav.Table.Header>
        <Nav.Table.Row>
          <Nav.Table.HeaderCell>{label}</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell />
          <Nav.Table.HeaderCell />
        </Nav.Table.Row>
      </Nav.Table.Header>
      {(valgteVedlegg.length > 0 || (fritekstvedlegg && fritekstvedlegg.length > 0)) && (
        <Nav.Table.Body>
          {fritekstvedlegg?.map((vedlegg, index) => (
            <FritekstvedleggRow
              fritekstvedlegg={vedlegg}
              redigerFritekstvedlegg={redigerFritekstvedlegg}
              slettFritekstvedlegg={slettFritekstvedlegg}
              key={vedlegg.tittel}
              index={index}
              lagFritekstPdfUrl={lagFritekstPdfUrl}
              redigerbart={redigerbart}
            />
          ))}
          {valgteVedlegg.map((enkeltVedlegg) => (
            <VedleggRow
              key={enkeltVedlegg.id}
              vedlegg={enkeltVedlegg}
              slettVedlegg={() => slettVedlegg(enkeltVedlegg.id)}
              redigerbart={redigerbart}
            />
          ))}
        </Nav.Table.Body>
      )}
    </Nav.Table>
  );
};

export default VedleggTable;
