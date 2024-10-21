import { HStack, VStack } from "@navikt/ds-react";
import { Avgift } from "../../../../../services/modules/aarsavregning/aarsavregning";
import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import * as Nav from "../../../../../navFrontend";
import { InntektskildeDto } from "../../../../../services/modules/trygdeavgift";

const InntektsperioderTabell = ({ perioder, avgift }: { perioder?: InntektskildeDto[]; avgift?: Avgift }) => {
  if (!perioder) return null;

  return (
    <VStack>
      <Nav.Table size="small" className="periode_tabell">
        <Nav.Table.Header className="header_row">
          <Nav.Table.Row>
            <Nav.Table.HeaderCell scope="col">Inntekt</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Inntektskilde</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Betalt aga.</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Brutto inntekt md.</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Total periode</Nav.Table.HeaderCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {perioder.map((inntektsperiode) => (
            <Nav.Table.Row className="border_top" key={Utils._uuid()}>
              <Nav.Table.DataCell key={Utils._uuid()}>
                {`${Utils.dato.formatterDatoTilNorsk(inntektsperiode.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(
                  inntektsperiode.tomDato
                )}`}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell key={Utils._uuid()}>
                {KV.finnTermFraListe(MKV.KTObjects.inntektskildetype, inntektsperiode.type)}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell key={Utils._uuid()}>
                {inntektsperiode.arbeidsgiversavgiftBetales ? "Ja" : "Nei"}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell align="right" key={Utils._uuid()}>
                {Utils.formaterTilNorskBelopUtenDesimaler(inntektsperiode.avgiftspliktigInntekt)} kr
              </Nav.Table.DataCell>
              <Nav.Table.DataCell align="right" key={Utils._uuid()}>
                {Utils.formaterTilNorskBelopUtenDesimaler(inntektsperiode.avgiftspliktigInntektTotal)} kr
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          ))}
        </Nav.Table.Body>
      </Nav.Table>
      <HStack className="totaltForPerioden" gap="8" align="center" justify="end">
        <Nav.Typo.Normaltekst>
          <b>Årstotal: {Utils.formaterTilNorskBelopUtenDesimaler(avgift?.totalInntekt)}</b> kr
        </Nav.Typo.Normaltekst>
      </HStack>
    </VStack>
  );
};

export default InntektsperioderTabell;
