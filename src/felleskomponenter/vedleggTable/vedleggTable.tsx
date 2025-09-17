import { BrevVedleggVisningstabellInterface, StandardvedleggType } from "../../services/modules/dokumenter-v2";

import * as Nav from "../../navFrontend";
import FritekstvedleggRow from "./fritekstvedleggRow";
import VedleggRow from "./vedleggRow";
import "./vedleggTable.less";
import { Fritekstvedlegg } from "../sideDialog/sendBrev/brevVedlegg/brevVedlegg";

interface VedleggTableProps {
  valgteVedlegg: BrevVedleggVisningstabellInterface;
  setValgteVedlegg: (valgteVedlegg: BrevVedleggVisningstabellInterface) => void;
  label?: string;
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

  const slettStandardvedlegg = (standardvedleggType: StandardvedleggType) => {
    setValgteVedlegg({
      saksvedlegg: valgteVedlegg.saksvedlegg,
      standardvedlegg: valgteVedlegg.standardvedlegg.filter(({ type }) => type !== standardvedleggType),
    });
  };

  return (
    <Nav.Table className="vedleggtable" size="small">
      {label && (
        <Nav.Table.Header>
          <Nav.Table.Row>
            <Nav.Table.HeaderCell>{label}</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell />
            <Nav.Table.HeaderCell />
          </Nav.Table.Row>
        </Nav.Table.Header>
      )}
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
              slettVedlegg={() => slettVedlegg(enkeltVedlegg.id)}
              redigerbart={redigerbart}
            />
          ))}
          {valgteVedlegg.standardvedlegg.map((enkeltStandardvedlegg) => (
            <VedleggRow
              key={`standardvedlegg-${enkeltStandardvedlegg.type}`}
              vedlegg={enkeltStandardvedlegg}
              slettVedlegg={() => slettStandardvedlegg(enkeltStandardvedlegg.type)}
              redigerbart={redigerbart}
            />
          ))}
        </Nav.Table.Body>
      )}
    </Nav.Table>
  );
}

export default VedleggTable;
