import React, { ReactNode } from "react";
import PT from "prop-types";
import classNames from "classnames";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../melosyskodeverk";
import * as KV from "../../kodeverk";
import * as MPT from "../../proptypes";
import * as Nav from "../../navFrontend";
import * as Api from "../../services/api";

import OppsummeringVerdiPar from "./verdiPar/oppsummeringVerdiPar";
import { formatterDatoTilNorsk } from "../../utils/dato";
import { erSedForesporsel } from "../../melosyskodeverk/utils";
import { arrayTilKonjunksjon, storeForbokstaverForLand } from "../../utils/streng";

import "./oppsummering.css";

interface OppsummeringProps {
  arbeidsland: KTObject[];
  lovvalgsland: KTObject;
  fagsak: Api.Fagsak;
  oppsummering: Api.Behandlinger.behandling.Oppsummering;
  behandlingstema: string;
  behandlingsfristLinje: ReactNode;
  behandlingsstatusLinje: ReactNode;
  behandlingstemaLinje: ReactNode;
  behandlingstypeLinje: ReactNode;
  behandlingsresultattypeLinje: ReactNode;
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
    behandlingsfristLinje,
    behandlingsstatusLinje,
    behandlingstemaLinje,
    behandlingstypeLinje,
    behandlingsresultattypeLinje,
    lovvalgsperiodeFom,
    lovvalgsperiodeTom,
    mottattDato,
    className,
  } = props;
  if (!oppsummering || !fagsak?.sakstype) return <div />;

  const { saksnummer, sakstype, registrertDato } = fagsak;

  const { endretDato, endretAvNavn, svarFrist, behandlingstype } = oppsummering;

  const landTilSetning = (land: KTObject[]) =>
    land && land.length > 0
      ? arrayTilKonjunksjon(land.map((enkeltLand) => storeForbokstaverForLand(enkeltLand.term)))
      : "Ukjent";

  const lovvalgsperiode = `${lovvalgsperiodeFom} - ${lovvalgsperiodeTom}`;

  const erSed = behandlingstype && KV.objektTilKode(behandlingstype) === MKV.Koder.behandlinger.behandlingstyper.SED;
  const erFtrl = sakstype && KV.objektTilKode(sakstype) === MKV.Koder.sakstyper.FTRL;

  return (
    <div aria-label="behandlingsinformasjon" className={classNames(className, "oppsummering")}>
      <dl>
        <Nav.Row>
          <Nav.Column xs="6">
            <Nav.Typo.Undertittel>{KV.objektTilTerm(sakstype)}</Nav.Typo.Undertittel>
          </Nav.Column>
          <Nav.Column xs="6" className="hoyrestill">
            {behandlingsfristLinje}
          </Nav.Column>
        </Nav.Row>
      </dl>

      <dl>
        <Nav.Row>
          <Nav.Column xs="12">{behandlingstypeLinje}</Nav.Column>
        </Nav.Row>
      </dl>

      <dl>
        <Nav.Row>
          <Nav.Column xs="12">{behandlingstemaLinje}</Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <OppsummeringVerdiPar nokkel="Saksnummer" verdi={saksnummer} />
          </Nav.Column>
        </Nav.Row>
      </dl>

      <dl>
        <Nav.Row>
          <Nav.Column xs="12">
            {behandlingsstatusLinje}
            <OppsummeringVerdiPar
              className="svarfrist"
              nokkel="Svarfrist"
              verdi={formatterDatoTilNorsk(svarFrist) || "-"}
            />
          </Nav.Column>
        </Nav.Row>
      </dl>

      {KV.objektTilKode(oppsummering.behandlingsstatus) === "AVSLUTTET" && (
        <dl>
          <Nav.Row>
            <Nav.Column xs="12">{behandlingsresultattypeLinje}</Nav.Column>
          </Nav.Row>
        </dl>
      )}

      <dl>
        <Nav.Row>
          <Nav.Column xs="12">
            <OppsummeringVerdiPar nokkel="Behandling opprettet" verdi={formatterDatoTilNorsk(registrertDato)} />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <OppsummeringVerdiPar
              nokkel="Sist oppdatert"
              verdi={formatterDatoTilNorsk(endretDato)}
              ekstrafelt={<span className="kursiv">{`  ${endretAvNavn}`}</span>}
            />
          </Nav.Column>
        </Nav.Row>
      </dl>

      <dl>
        {erSed ? (
          !erSedForesporsel(behandlingstema) && (
            <div>
              <Nav.Row>
                <Nav.Column xs="12">
                  <OppsummeringVerdiPar nokkel="Periode fra SED" verdi={lovvalgsperiode} />
                </Nav.Column>
              </Nav.Row>
              <Nav.Row>
                <Nav.Column xs="12">
                  <OppsummeringVerdiPar
                    nokkel="Lovvalgsland fra SED"
                    verdi={storeForbokstaverForLand(lovvalgsland.term)}
                  />
                </Nav.Column>
              </Nav.Row>
            </div>
          )
        ) : (
          <div>
            <Nav.Row>
              <Nav.Column xs="12">
                <OppsummeringVerdiPar nokkel="Søknadsperiode" verdi={lovvalgsperiode} />
              </Nav.Column>
            </Nav.Row>
            <Nav.Row>
              <Nav.Column xs="12">
                <OppsummeringVerdiPar nokkel="Arbeidsland" verdi={landTilSetning(arbeidsland)} />
              </Nav.Column>
            </Nav.Row>
          </div>
        )}
      </dl>

      {erFtrl && (
        <dl>
          <OppsummeringVerdiPar nokkel="Søknad mottatt" verdi={mottattDato || "-"} />
        </dl>
      )}
    </div>
  );
};

Oppsummering.propTypes = {
  arbeidsland: PT.arrayOf(MPT.Kodeverk),
  lovvalgsland: MPT.Kodeverk,
  fagsak: MPT.Fagsak.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering.isRequired,
  behandlingstema: PT.string.isRequired,
  behandlingsfristLinje: PT.node.isRequired,
  behandlingsstatusLinje: PT.node.isRequired,
  behandlingstemaLinje: PT.node.isRequired,
  behandlingstypeLinje: PT.node.isRequired,
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
