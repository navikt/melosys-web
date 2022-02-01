import React from "react";
import PT from "prop-types";
import classNames from "classnames";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../melosyskodeverk";
import * as KV from "../../kodeverk";
import * as MPT from "../../proptypes";
import * as Nav from "../../navFrontend";
import * as Api from "../../services/api";
import * as Ikoner from "../../resources/images";

import OppsummeringVerdiPar from "./verdiPar/oppsummeringVerdiPar";
import { formatterDatoTilNorsk } from "../../utils/dato";
import { arrayTilKonjunksjon, storeForbokstaverForLand } from "../../utils/streng";

import "./oppsummering.css";
import KopierbarTekst from "../kopierbarTekst";
import Behandlingsstatuskode from "../behandlingsstatuskode";

interface OppsummeringProps {
  arbeidsland: KTObject[];
  lovvalgsland: KTObject;
  fagsak: Api.Fagsak;
  oppsummering: Api.Behandlinger.behandling.Oppsummering;
  behandlingstema: string;
  lovvalgsperiodeFom?: string;
  lovvalgsperiodeTom?: string;
  mottattDato?: string;
  className?: string;
}

const Oppsummering = (props: OppsummeringProps) => {
  const {
    arbeidsland,
    lovvalgsland,
    fagsak,
    oppsummering,
    behandlingstema,
    lovvalgsperiodeFom,
    lovvalgsperiodeTom,
    mottattDato,
    className,
  } = props;
  if (!oppsummering || !fagsak?.sakstype) return <div />;

  const { saksnummer, sakstype, registrertDato } = fagsak;

  const { endretDato, endretAvNavn, svarFrist, behandlingstype, behandlingsfrist } = oppsummering;

  const landTilSetning = (land: KTObject[]) =>
    land && land.length > 0
      ? arrayTilKonjunksjon(land.map((enkeltLand) => storeForbokstaverForLand(enkeltLand.term)))
      : "Ukjent";

  const lovvalgsperiode = `${lovvalgsperiodeFom} - ${lovvalgsperiodeTom}`;

  const erSed = behandlingstype && KV.objektTilKode(behandlingstype) === MKV.Koder.behandlinger.behandlingstyper.SED;
  const erTrygdeavtale = sakstype && KV.objektTilKode(sakstype) === MKV.Koder.sakstyper.TRYGDEAVTALE;

  const tabellEnKolonne = (data: string[][]) => {
    const rows: JSX.Element[] = [];
    data.forEach((row) =>
      rows.push(
        <Nav.Row>
          <OppsummeringVerdiPar nokkel={row[0]} verdi={row[1]} ekstrafelt={<span className="kursiv">{row[2]}</span>} />
        </Nav.Row>
      )
    );
    return rows;
  };

  const tabellToKolonner = (col1: string[][], col2: string[][]) => {
    const rows = [];
    for (let i = 0; i < 3; i += 1) {
      rows.push(
        <Nav.Row>
          <Nav.Column xs="6">
            {i < col1.length && <OppsummeringVerdiPar nokkel={col1[i][0]} verdi={col1[i][1]} />}
          </Nav.Column>
          <Nav.Column xs="6">
            <OppsummeringVerdiPar
              nokkel={col2[i][0]}
              verdi={col2[i][1]}
              ekstrafelt={<span className="kursiv">{col2[i][2]}</span>}
            />
          </Nav.Column>
        </Nav.Row>
      );
    }
    return rows;
  };

  const renderTabell = () => {
    const col1 = [[erSed ? "Periode fra SED" : "Søknadsperiode", lovvalgsperiode]];
    if (erTrygdeavtale) col1.push(["Lovvalgsperiode", lovvalgsperiode]);
    col1.push(["Land", erSed ? storeForbokstaverForLand(lovvalgsland.term) : landTilSetning(arbeidsland)]);

    const col2 = [
      ["Søknad mottatt", mottattDato || "-"],
      ["Beh. opprettet", formatterDatoTilNorsk(registrertDato)],
      ["Sist oppdatert", formatterDatoTilNorsk(endretDato), `  ${endretAvNavn}`],
    ];

    return window.innerWidth < 1440 ? tabellEnKolonne(col1.concat(col2)) : tabellToKolonner(col1, col2);
  };

  return (
    <div aria-label="behandlingsinformasjon" className={classNames(className, "oppsummering")}>
      <dl>
        <Nav.Row>
          <span className="bold">Saksnummer: </span>
          <KopierbarTekst className="kopier-saksnummer" hovertekst="Kopier saksnummer">
            {saksnummer}
          </KopierbarTekst>
        </Nav.Row>
      </dl>

      <Nav.Panel className="saksinfo">
        <Nav.Row>
          <Nav.Column xs="8">
            <Nav.Typo.Undertittel>{KV.objektTilTerm(sakstype)}</Nav.Typo.Undertittel>
          </Nav.Column>
          <Nav.Column xs="4">
            <Nav.Knapp className="hoyrestill endre-knapp" mini onClick={() => console.log("TODO: Vis endringsmodal")}>
              <span>Endre</span>
              <Ikoner.BlyantActive />
            </Nav.Knapp>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <span className="bold">{KV.objektTilTerm(behandlingstype)}</span>
        </Nav.Row>
        <Nav.Row>
          <span className="bold">{KV.kodeTilTerm(behandlingstema, MKV.KTObjects.behandlinger.behandlingstema)}</span>
        </Nav.Row>
        <Nav.Row>
          <OppsummeringVerdiPar nokkel="Frist" verdi={formatterDatoTilNorsk(behandlingsfrist)} />
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="2">
            <Behandlingsstatuskode behandlingsstatus={oppsummering.behandlingsstatus} />
          </Nav.Column>
          <Nav.Column xs="5">
            <span>{`(Svarfrist: ${formatterDatoTilNorsk(svarFrist) || "-"})`}</span>
          </Nav.Column>
        </Nav.Row>
      </Nav.Panel>

      {renderTabell()}
    </div>
  );
};

Oppsummering.propTypes = {
  arbeidsland: PT.arrayOf(MPT.Kodeverk),
  lovvalgsland: MPT.Kodeverk,
  fagsak: MPT.Fagsak.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering.isRequired,
  behandlingstema: PT.string.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  mottattDato: PT.string,
  className: PT.string,
};
Oppsummering.defaultProps = {
  arbeidsland: [],
  lovvalgsland: {},
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
  mottattDato: undefined,
  className: undefined,
};

export default Oppsummering;
