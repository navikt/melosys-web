import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Mui from "../../../ui";

import * as Nav from "../../../../navFrontend";

import { fakturainformasjonOperations } from "../../../../ducks/fakturainformasjon";
import OppsummeringVerdiPar from "../../../oppsummering/verdiPar/oppsummeringVerdiPar";
import "./fakturainformasjon.css";
import { _isEmpty, _toInteger } from "../../../../utils";

const Fakturainformasjon = () => {
  const dispatch = useDispatch();
  const { fakturainformasjon, fagsaker, behandlinger } = useSelector((state) => state) as any;
  const { saksnummer } = fagsaker.data;
  const { behandlingID } = behandlinger.data;

  useEffect(() => {
    const vedtaksId = `${saksnummer}-${behandlingID}`;
    dispatch(fakturainformasjonOperations.hentFakturaserie(vedtaksId));
  }, [behandlingID, saksnummer]);

  if (!fakturainformasjon?.data) return null;

  const {
    faktura: fakturaer,
    fakturaGjelder,
    fodselsnummer,
    intervall,
    referanseBruker,
    referanseNAV,
    sluttdato,
    startdato,
    status,
  } = fakturainformasjon.data;

  const overordnetInfoPar = {
    "Faktura gjelder": fakturaGjelder,
    Fødselsnummer: fodselsnummer,
    Intervall: intervall,
    "Referanse for bruker": referanseBruker,
    "Referanse for NAV": referanseNAV,
    Startdato: startdato,
    Sluttdato: sluttdato,
    Status: status,
  };

  if (_isEmpty(fakturainformasjon.data)) {
    return null;
  }
  if (fakturainformasjon.data.violations) {
    return fakturainformasjon.data.violations.map((violation: any) => (
      <Nav.Row key={violation}>{violation.message}</Nav.Row>
    ));
  }

  return (
    <Nav.Container fluid className="fakturainformasjon">
      <Nav.Row>
        <Nav.Column xs="12">
          <Mui.Undertittel tekst="Fakturaserie" className="persontabell-row__tittel" />
          {Object.keys(overordnetInfoPar).map((key) => (
            <Nav.Row key={key}>
              <Nav.Column xs="4">{key}</Nav.Column>
              <Nav.Column xs="4">{overordnetInfoPar[key as keyof typeof overordnetInfoPar]}</Nav.Column>
            </Nav.Row>
          ))}
        </Nav.Column>
      </Nav.Row>
      <br />
      <Nav.Row>
        <Nav.Column xs="12">
          <Mui.Undertittel tekst="Fakturaer" className="persontabell-row__tittel" />
          <div className="fakturainformasjon-tabell">
            {fakturaer?.map((faktura: any) => (
              <div className="fakturaseksjon" key={faktura.id}>
                <div className="headerseksjon">
                  <OppsummeringVerdiPar nokkel="Faktura nummer" verdi={`${faktura.id + 1}`} />
                  <OppsummeringVerdiPar nokkel="Dato bestilt" verdi={faktura.datoBestilt} />
                  <OppsummeringVerdiPar nokkel="Periode fra" verdi={faktura.periodeFra} />
                  <OppsummeringVerdiPar nokkel="Periode til" verdi={faktura.periodeTil} />
                  <OppsummeringVerdiPar nokkel="Status" verdi={faktura.status} />
                </div>
                <Nav.Row className="header">
                  <Nav.Column xs="2">Periode fra</Nav.Column>
                  <Nav.Column xs="2">Periode til</Nav.Column>
                  <Nav.Column xs="6">Beskrivelse</Nav.Column>
                  <Nav.Column xs="2">Beløp</Nav.Column>
                </Nav.Row>
                {faktura.fakturaLinje.map((fakturalinje: any) => (
                  <Nav.Row key={fakturalinje.id}>
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
            ))}
          </div>
        </Nav.Column>
      </Nav.Row>
    </Nav.Container>
  );
};

export default Fakturainformasjon;
