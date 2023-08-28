import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Mui from "../../../ui";

import * as Nav from "../../../../navFrontend";

import { fakturainformasjonOperations } from "../../../../ducks/fakturainformasjon";
import "./fakturainformasjon.css";
import { _isEmpty, _toInteger } from "../../../../utils";
import { Faktura } from "./faktura";
import { STATUS } from "../../../../services";

const Fakturainformasjon = () => {
  const dispatch = useDispatch();
  const { fakturainformasjon, fagsaker, behandlinger } = useSelector((state) => state) as any;
  const { saksnummer } = fagsaker.data;
  const { behandlingID } = behandlinger.data;

  useEffect(() => {
    const vedtaksId = `${saksnummer}-${behandlingID}`;
    dispatch(fakturainformasjonOperations.hentFakturaserie(vedtaksId));
  }, [behandlingID, saksnummer]);

  if (!fakturainformasjon?.data.fakturaserie && fakturainformasjon.status === STATUS.ERROR) return null;

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
  } = fakturainformasjon.data.fakturaserie;

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

  if (_isEmpty(fakturainformasjon.data.fakturaserie)) {
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
              <Faktura faktura={faktura} />
            ))}
          </div>
        </Nav.Column>
      </Nav.Row>
    </Nav.Container>
  );
};

export default Fakturainformasjon;
