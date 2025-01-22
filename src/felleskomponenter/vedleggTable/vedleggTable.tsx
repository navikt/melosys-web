import { BrevVedleggInterface, TilgjengeligStandardvedlegg } from "../../services/modules/dokumenter-v2";

import * as Nav from "../../navFrontend";
import { Fritekstvedlegg } from "../sideDialog/sendBrev/sendBrev";
import FritekstvedleggRow from "./fritekstvedleggRow";
import VedleggRow from "./vedleggRow";
import "./vedleggTable.css";

interface VedleggTableProps {
  valgteVedlegg: BrevVedleggInterface;
  setValgteVedlegg: (valgteVedlegg: BrevVedleggInterface) => void;
  label: string;
  fritekstvedlegg?: Fritekstvedlegg[];
  redigerFritekstvedlegg?: (index: number) => void;
  slettFritekstvedlegg?: (index: number) => void;
  lagFritekstPdfUrl?: (index: number) => Promise<string | false>;
  redigerbart: boolean;
}

function VedleggTable({
  valgteVedlegg,
  setValgteVedlegg,
  label,
  fritekstvedlegg,
  redigerFritekstvedlegg,
  slettFritekstvedlegg,
  lagFritekstPdfUrl,
  redigerbart,
}: VedleggTableProps) {
  const slettVedlegg = (vedleggID: string) => {
    setValgteVedlegg({
      saksvedlegg: valgteVedlegg.saksvedlegg.filter(({ id }) => id !== vedleggID),
      standardvedlegg: valgteVedlegg.standardvedlegg,
    });
  };

  const slettStandardvedlegg = () => {
    setValgteVedlegg({
      saksvedlegg: valgteVedlegg.saksvedlegg,
      standardvedlegg: null,
    });
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
      {(valgteVedlegg.saksvedlegg.length > 0 ||
        (fritekstvedlegg && fritekstvedlegg.length > 0) ||
        valgteVedlegg.standardvedlegg) && (
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
          {valgteVedlegg.saksvedlegg.map((enkeltVedlegg) => (
            <VedleggRow
              key={enkeltVedlegg.id}
              vedlegg={enkeltVedlegg}
              slettSaksvedlegg={() => slettVedlegg(enkeltVedlegg.id)}
              slettStandardvedlegg={() => {}}
              redigerbart={redigerbart}
            />
          ))}
          {valgteVedlegg.standardvedlegg && (
            <VedleggRow
              key={`standardvedlegg-${valgteVedlegg.standardvedlegg.type}`}
              vedlegg={valgteVedlegg.standardvedlegg}
              slettSaksvedlegg={() => {}}
              slettStandardvedlegg={() => slettStandardvedlegg()}
              redigerbart={redigerbart}
            />
          )}
        </Nav.Table.Body>
      )}
    </Nav.Table>
  );
}

export default VedleggTable;
