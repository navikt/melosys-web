import { VStack } from "@navikt/ds-react";
import * as KV from "../../../../../kodeverk";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import { Avgift } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { InntektskildeDto } from "../../../../../services/modules/trygdeavgift";
import * as Utils from "../../../../../utils";

function InntektsperioderTabell({
  perioder,
  erHelseutgiftDekkesPeriode,
}: {
  perioder?: InntektskildeDto[];
  avgift?: Avgift;
  erHelseutgiftDekkesPeriode?: boolean;
}) {
  const renderTomRad = (length: number) => {
    return (
      <Nav.Table.Row className="border_top" key={Utils._uuid()}>
        {Array.from({ length }, () => {
          return <Nav.Table.DataCell key={Utils._uuid()}>-</Nav.Table.DataCell>;
        })}
      </Nav.Table.Row>
    );
  };

  return (
    <VStack>
      <Nav.Table size="small" className="periode_tabell">
        <Nav.Table.Header className="header_row">
          <Nav.Table.Row>
            <Nav.Table.HeaderCell scope="col">Inntektsperiode</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Inntektskilde</Nav.Table.HeaderCell>
            {!erHelseutgiftDekkesPeriode && <Nav.Table.HeaderCell scope="col">Betales aga.?</Nav.Table.HeaderCell>}
            <Nav.Table.HeaderCell scope="col" className={"tall_felt"}>
              Bruttoinntekt md.
            </Nav.Table.HeaderCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {perioder && perioder.length !== 0
            ? [...perioder].sort(Utils.dato.sorterEtterISOFomDato).map((inntektsperiode) => (
                <Nav.Table.Row className="border_top" key={Utils._uuid()}>
                  <Nav.Table.DataCell key={Utils._uuid()}>
                    {`${Utils.dato.formatterDatoTilNorsk(inntektsperiode.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(
                      inntektsperiode.tomDato,
                    )}`}
                  </Nav.Table.DataCell>
                  <Nav.Table.DataCell key={Utils._uuid()}>
                    {KV.finnTermFraListe(MKV.KTObjects.inntektskildetype, inntektsperiode.type)}
                  </Nav.Table.DataCell>
                  {!erHelseutgiftDekkesPeriode && (
                    <Nav.Table.DataCell key={Utils._uuid()}>
                      {inntektsperiode.arbeidsgiversavgiftBetales ? "Ja" : "Nei"}
                    </Nav.Table.DataCell>
                  )}
                  <Nav.Table.DataCell key={Utils._uuid()} className={"tall_felt"}>
                    {Utils.formaterTilNorskBelopUtenDesimaler(inntektsperiode.avgiftspliktigInntekt)} kr
                  </Nav.Table.DataCell>
                </Nav.Table.Row>
              ))
            : renderTomRad(4)}
        </Nav.Table.Body>
      </Nav.Table>
    </VStack>
  );
}

export default InntektsperioderTabell;
