import React, { useState } from "react";
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
import EndreBehandlingModal from "./endreBehandlingModal";
import { useMediaQuery } from "../../utils/mediaQuery";

interface OppsummeringProps {
  arbeidsland: KTObject[];
  lovvalgsland: KTObject;
  fagsak: Api.Fagsak;
  oppsummering: Api.Behandlinger.behandling.Oppsummering;
  behandlingsgrunnlagperiode: string;
  lovvalgsperiode: string;
  mottattDato?: string;
  className?: string;
}

const Oppsummering = (props: OppsummeringProps) => {
  const {
    arbeidsland,
    lovvalgsland,
    fagsak,
    oppsummering,
    behandlingsgrunnlagperiode,
    lovvalgsperiode,
    mottattDato,
    className,
  } = props;

  const isLitenSkjerm = useMediaQuery({ maxWidth: 1440 });

  const [skalViseEndreModal, setSkalViseEndreModal] = useState(false);

  if (!oppsummering || !fagsak?.sakstype) return <div />;

  const { saksnummer, sakstype, registrertDato } = fagsak;
  const { endretDato, endretAvNavn, svarFrist, behandlingstype, behandlingsfrist, behandlingstema } = oppsummering;

  const landTilSetning = (land: KTObject[]) =>
    land && land.length > 0
      ? arrayTilKonjunksjon(land.map((enkeltLand) => storeForbokstaverForLand(enkeltLand.term)))
      : "Ukjent";

  const erSed = behandlingstype && KV.objektTilKode(behandlingstype) === MKV.Koder.behandlinger.behandlingstyper.SED;
  const erTrygdeavtale = sakstype && KV.objektTilKode(sakstype) === MKV.Koder.sakstyper.TRYGDEAVTALE;

  const tabellEnKolonne = (data: string[][]) => {
    const rows: JSX.Element[] = [];
    data.forEach((row) =>
      rows.push(
        <Nav.Row className="datarad" key={`datarad-${row[0]}`}>
          <OppsummeringVerdiPar nokkel={row[0]} verdi={row[1]} ekstrafelt={<span className="kursiv">{row[2]}</span>} />
        </Nav.Row>
      )
    );
    return rows;
  };

  const tabellToKolonner = (col1: string[][], col2: string[][]) => {
    const rows = [];
    for (let i = 0; i < Math.max(col1.length, col2.length); i += 1) {
      rows.push(
        <Nav.Row className="datarad" key={`datarad-${i}`}>
          <Nav.Column lg="6">
            {i < col1.length && (
              <OppsummeringVerdiPar
                nokkel={col1[i][0]}
                verdi={col1[i][1]}
                ekstrafelt={<span className="kursiv">{col1[i][2]}</span>}
              />
            )}
          </Nav.Column>
          <Nav.Column lg="6">
            {i < col2.length && (
              <OppsummeringVerdiPar
                nokkel={col2[i][0]}
                verdi={col2[i][1]}
                ekstrafelt={<span className="kursiv">{col2[i][2]}</span>}
              />
            )}
          </Nav.Column>
        </Nav.Row>
      );
    }
    return rows;
  };

  const renderTabell = () => {
    const col1 = [erSed ? ["Periode fra SED", lovvalgsperiode] : ["Søknadsperiode", behandlingsgrunnlagperiode]];
    if (erTrygdeavtale) col1.push(["Lovvalgsperiode", lovvalgsperiode]);
    col1.push(["Land", erSed ? storeForbokstaverForLand(lovvalgsland.term) : landTilSetning(arbeidsland)]);

    const col2 = [
      ["Søknad mottatt", mottattDato || "-"],
      ["Beh. opprettet", formatterDatoTilNorsk(registrertDato)],
      ["Sist oppdatert", formatterDatoTilNorsk(endretDato), `  ${endretAvNavn}`],
    ];

    return isLitenSkjerm ? tabellEnKolonne(col1.concat(col2)) : tabellToKolonner(col1, col2);
  };

  return (
    <div aria-label="behandlingsinformasjon" className={classNames(className, "oppsummering")}>
      <EndreBehandlingModal
        fagsak={fagsak}
        oppsummering={oppsummering}
        skalViseModal={skalViseEndreModal}
        lukkModal={() => setSkalViseEndreModal(false)}
      />

      <Nav.Row className="datarad">
        <dl className="oppsummering_verdi_par">
          <dt className="nokkel">Saksnummer: </dt>
          <dd>
            <KopierbarTekst className="kopier-saksnummer" hovertekst="Kopier saksnummer">
              {saksnummer}
            </KopierbarTekst>
          </dd>
        </dl>
      </Nav.Row>

      <Nav.Panel className="saksinfo">
        <Nav.Row>
          <Nav.Column xs="8">
            <Nav.Typo.Undertittel>{KV.objektTilTerm(sakstype)}</Nav.Typo.Undertittel>
          </Nav.Column>
          <Nav.Column xs="4">
            <Nav.Knapp className="hoyrestill endre-knapp" mini onClick={() => setSkalViseEndreModal(true)}>
              <span>Endre</span>
              <Ikoner.BlyantActive />
            </Nav.Knapp>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <span className="bold">{KV.objektTilTerm(behandlingstype)}</span>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <span className="bold">{KV.objektTilTerm(behandlingstema)}</span>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <OppsummeringVerdiPar nokkel="Frist" verdi={formatterDatoTilNorsk(behandlingsfrist)} />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12" className="behandlingsstatus">
            <Behandlingsstatuskode behandlingsstatus={oppsummering.behandlingsstatus} />
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
  behandlingsgrunnlagperiode: PT.string,
  lovvalgsperiode: PT.string,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  mottattDato: PT.string,
  className: PT.string,
};
Oppsummering.defaultProps = {
  arbeidsland: [],
  lovvalgsland: {},
  behandlingsgrunnlagperiode: undefined,
  lovvalgsperiode: undefined,
  mottattDato: undefined,
  className: undefined,
};

export default Oppsummering;
