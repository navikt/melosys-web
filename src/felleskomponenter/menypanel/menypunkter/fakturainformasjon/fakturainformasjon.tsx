import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Mui from "../../../ui";

import * as Nav from "../../../../navFrontend";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";

import { fakturainformasjonOperations } from "../../../../ducks/fakturainformasjon";
import "./fakturainformasjon.css";
import { _isEmpty, _toInteger } from "../../../../utils";
import { Faktura } from "./faktura";
import { STATUS } from "../../../../services";
import { FakturaStatus } from "../../../../services/modules/faktureringskomponenten/fakturainformasjon";

const Fakturainformasjon = () => {
  const dispatch = useDispatch();
  const { fakturainformasjon, fagsaker, behandlinger } = useSelector((state) => state) as any;
  const { saksnummer } = fagsaker.data;
  const {
    behandlingID,
    oppsummering: { behandlingstype },
  } = behandlinger.data;

  const skalHenteFraForrigeBehandling =
    KV.objektTilKode(behandlingstype) === MKV.Koder.behandlinger.behandlingstyper.MANGLENDE_INNBETALING_TRYGDEAVGIFT;

  useEffect(() => {
    const queries = [`&fakturaStatus=${FakturaStatus.BESTILLT}`];
    dispatch(fakturainformasjonOperations.hentFakturaserier(saksnummer, queries));
  }, [behandlingID, saksnummer, skalHenteFraForrigeBehandling]);

  if (_isEmpty(fakturainformasjon.data) || fakturainformasjon.status === STATUS.ERROR) {
    return null;
  }

  if (fakturainformasjon.data.violations) {
    return fakturainformasjon.data.violations.map((violation: any) => (
      <Nav.Row key={violation}>{violation.message}</Nav.Row>
    ));
  }

  const splitVedtaksId = (vedtaksId: string) => {
    const parts = vedtaksId.split("-");
    const lastPart = parts.pop();

    const prefix = parts.join("-");
    return [prefix, lastPart];
  };

  return (
    <Nav.Container fluid className="fakturainformasjon">
      {fakturainformasjon.data.map((data: any) => {
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
          vedtaksId,
        } = data;

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

        const [saksnummerForFakturaserie, behandlingsIdForFakturaserie] = splitVedtaksId(vedtaksId);

        return (
          <div key={vedtaksId}>
            <Nav.Row>
              <Nav.Column xs="12">
                <Mui.Undertittel
                  tekst={`Fakturaserie med saksnummer: ${saksnummerForFakturaserie} behandlingid: ${behandlingsIdForFakturaserie} `}
                  className="persontabell-row__tittel"
                />
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
                    <Faktura key={faktura.id} faktura={faktura} />
                  ))}
                </div>
              </Nav.Column>
            </Nav.Row>
          </div>
        );
      })}
    </Nav.Container>
  );
};

export default Fakturainformasjon;
