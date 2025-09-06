import VedleggVelgerRow from "./vedleggVelgerRow";
import * as Nav from "../../navFrontend";
import {
  FysiskDokument,
  BrevVedleggInterface,
  TilgjengeligStandardvedlegg,
} from "../../services/modules/dokumenter-v2";
import * as Utils from "../../utils";

import "./vedleggVelger.less";

interface VedleggTableProps {
  valgteVedlegg: BrevVedleggInterface;
  alleSaksvedlegg: FysiskDokument[];
  standardvedlegg: TilgjengeligStandardvedlegg[];
  slettSaksvedlegg: (vedlegg: FysiskDokument) => void;
  slettStandardvedlegg: () => void;
  leggTilSaksvedlegg: (vedlegg: FysiskDokument) => void;
  velgStandardvedlegg: (vedlegg: TilgjengeligStandardvedlegg) => void;
}

function VedleggVelgerTable({
  valgteVedlegg,
  alleSaksvedlegg,
  standardvedlegg,
  slettSaksvedlegg,
  slettStandardvedlegg,
  leggTilSaksvedlegg,
  velgStandardvedlegg,
}: VedleggTableProps) {
  const vedleggErMarkert = (vedlegg: TilgjengeligStandardvedlegg | FysiskDokument) =>
    Boolean(
      ("type" in vedlegg && valgteVedlegg.standardvedlegg?.type === vedlegg.type) ||
        ("id" in vedlegg && valgteVedlegg.saksvedlegg.find((valgtVedlegg) => valgtVedlegg.id === vedlegg.id)),
    );

  const harSaksdokumenter = !Utils._isEmpty(alleSaksvedlegg);
  const harStandardvedlegg = standardvedlegg && !Utils._isEmpty(standardvedlegg);

  return (
    <>
      <Nav.Table>
        <Nav.Table.Header>
          <Nav.Table.Row>
            <Nav.Table.DataCell colSpan={3}>
              <Nav.Heading size="xsmall">Standardvedlegg</Nav.Heading>
            </Nav.Table.DataCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {harStandardvedlegg &&
            standardvedlegg.map((enkeltStandardvedlegg) => (
              <VedleggVelgerRow
                key={enkeltStandardvedlegg.type}
                vedlegg={enkeltStandardvedlegg}
                leggTilVedlegg={() => velgStandardvedlegg(enkeltStandardvedlegg)}
                slettVedlegg={() => slettStandardvedlegg()}
                vedleggErMarkert={vedleggErMarkert(enkeltStandardvedlegg)}
                disabled={
                  valgteVedlegg.standardvedlegg !== null &&
                  valgteVedlegg.standardvedlegg.type !== enkeltStandardvedlegg.type
                }
              />
            ))}
          {!harStandardvedlegg && (
            <Nav.Table.Row>
              <Nav.Table.DataCell colSpan={3}>
                <span>Fant ingen standardvedlegg</span>
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          )}
        </Nav.Table.Body>
      </Nav.Table>

      <Nav.Table className="tilknyttet-behandlingen-table">
        <Nav.Table.Header>
          <Nav.Table.Row>
            <Nav.Table.DataCell colSpan={3}>
              <Nav.Heading size="xsmall">Dokumenter tilknyttet behandlingen</Nav.Heading>
            </Nav.Table.DataCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {harSaksdokumenter &&
            alleSaksvedlegg.map((enkeltVedlegg) => (
              <VedleggVelgerRow
                key={enkeltVedlegg.id}
                vedlegg={enkeltVedlegg}
                leggTilVedlegg={() => leggTilSaksvedlegg(enkeltVedlegg)}
                slettVedlegg={() => slettSaksvedlegg(enkeltVedlegg)}
                vedleggErMarkert={vedleggErMarkert(enkeltVedlegg)}
              />
            ))}
          {!harSaksdokumenter && (
            <Nav.Table.Row>
              <Nav.Table.DataCell colSpan={3}>
                <span>Fant ingen dokumenter tilknyttet saken</span>
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          )}
        </Nav.Table.Body>
      </Nav.Table>
    </>
  );
}

export default VedleggVelgerTable;
