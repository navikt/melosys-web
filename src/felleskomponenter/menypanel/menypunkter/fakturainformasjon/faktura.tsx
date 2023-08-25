import OppsummeringVerdiPar from "../../../oppsummering/verdiPar/oppsummeringVerdiPar";
import * as Nav from "../../../../navFrontend";
import { useEffect, useState } from "react";
import { formatterDatoTilNorsk } from "../../../../utils/dato";
import * as Api from "../../../../services/api";
import * as Mui from "../../../ui";
import { _isEmpty, _uuid } from "../../../../utils";

interface FakturaProps {
  faktura: any;
}

interface Fakturainfo {
  dato: string;
  status: "MANGLENDE_INNBETALING" | "INNE_I_OEBS" | "FEIL";
  fakturaBelop: number | null;
  ubetaltBelop: number | null;
  feilmelding: string | null;
}

export const Faktura = ({ faktura }: FakturaProps) => {
  const [fakturainfo, setFakturainfo] = useState([]);

  useEffect(() => {
    if (faktura.id) {
      Api.Faktureringskomponenten.hentFakturainfo(faktura.id).then((res) => setFakturainfo(res));
    }
  }, [faktura]);

  return (
    <div className="fakturaseksjon" key={faktura.id}>
      <div className="headerseksjon">
        <OppsummeringVerdiPar nokkel="Faktura id" verdi={`${faktura.id}`} />
        <OppsummeringVerdiPar nokkel="Dato bestilt" verdi={faktura.datoBestilt} />
        <OppsummeringVerdiPar nokkel="Periode fra" verdi={formatterDatoTilNorsk(faktura.periodeFra)} />
        <OppsummeringVerdiPar nokkel="Periode til" verdi={formatterDatoTilNorsk(faktura.periodeTil)} />
        <OppsummeringVerdiPar nokkel="Status" verdi={faktura.status} />
      </div>
      <br />
      <br />
      {!_isEmpty(fakturainfo) && <Mui.Undertittel tekst="Meldinger fra OEBS" />}
      {fakturainfo.map((info: Fakturainfo) => (
        <Nav.Row key={_uuid()}>
          <OppsummeringVerdiPar nokkel="Dato mottatt" verdi={formatterDatoTilNorsk(info.dato)} />
          <OppsummeringVerdiPar nokkel="Faktura beløp" verdi={info.fakturaBelop} />
          <OppsummeringVerdiPar nokkel="Ubetalt beløp" verdi={info.ubetaltBelop} />
          <OppsummeringVerdiPar nokkel="Status" verdi={info.status} />
          <OppsummeringVerdiPar nokkel="Feilmelding" verdi={info.feilmelding} />
        </Nav.Row>
      ))}
      <br />
      <Nav.Row className="header">
        <Nav.Column xs="2">Periode fra</Nav.Column>
        <Nav.Column xs="2">Periode til</Nav.Column>
        <Nav.Column xs="6">Beskrivelse</Nav.Column>
        <Nav.Column xs="2">Beløp</Nav.Column>
      </Nav.Row>
      {faktura.fakturaLinje.map((fakturalinje: any) => (
        <Nav.Row key={_uuid()}>
          <Nav.Column xs="2">{fakturalinje.periodeFra} </Nav.Column>
          <Nav.Column xs="2">{fakturalinje.periodeTil} </Nav.Column>
          <Nav.Column xs="6">{fakturalinje.beskrivelse} </Nav.Column>
          <Nav.Column xs="2">{fakturalinje.belop} </Nav.Column>
        </Nav.Row>
      ))}
      <Nav.Row>
        <Nav.Column xs="9" />
        <Nav.Column xs="1">
          <Nav.Typo.Element>Totalbeløp</Nav.Typo.Element>
        </Nav.Column>
        <Nav.Column xs="2">
          {faktura.fakturaLinje
            .map((linje: any) => linje.belop)
            .reduce((a: any, b: any) => a + b)
            .toFixed(2)}
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};
