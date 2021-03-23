import React, { ReactNode } from "react";
import PT from "prop-types";
import classNames from "classnames";
import { KTObject } from "@navikt/melosys-kodeverk";
import { Fagsak, Oppsummering as OppsummeringType, Person } from "Domene";

import * as KV from "../../kodeverk";
import * as MPT from "../../proptypes";
import * as Nav from "../../utils/navFrontend";

import "./oppsummering.css";
import OppsummeringVerdiPar from "./verdiPar/oppsummeringVerdiPar";
import { formatterDatoTilNorsk } from "../../utils/dato";
import { erSedForesporsel } from "../../melosyskodeverk/utils";
import { arrayTilKonjunksjon, storeForbokstaver } from "../../utils/streng";

interface OppsummeringProps {
  arbeidsland: KTObject[];
  oppholdsland?: KTObject[];
  lovvalgsland: KTObject;
  fagsak: Fagsak;
  oppsummering: OppsummeringType;
  behandlingstema: string;
  behandlingsfristLinje: ReactNode;
  behandlingsstatusLinje: ReactNode;
  behandlingstemaLinje: ReactNode;
  behandlingstypeLinje: ReactNode;
  person: Person;
  lovvalgsperiodeFom?: string;
  lovvalgsperiodeTom?: string;
  periodeLabel: string;
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
    lovvalgsperiodeFom,
    lovvalgsperiodeTom,
    className,
  } = props;
  if (!oppsummering) return <div />;

  const { saksnummer, sakstype, registrertDato } = fagsak;

  const { endretDato, endretAvNavn, svarFrist } = oppsummering;

  const landTilSetning = (land: KTObject[]) =>
    land && land.length > 0
      ? arrayTilKonjunksjon(land.map((enkeltLand) => storeForbokstaver(enkeltLand.term)))
      : "Ukjent";

  const periodeFraTil = (fra = "", til = "") => `${formatterDatoTilNorsk(fra)} - ${formatterDatoTilNorsk(til)}`;

  const erSed = () => oppsummering.behandlingstype === "SED";

  return (
    <div aria-label="behandlingsinformasjon" className={classNames(className, "oppsummering")}>
      <dl>
        <Nav.Row>
          <Nav.Column xs="6">
            <Nav.typo.Undertittel>{KV.objektTilTerm(sakstype)}</Nav.typo.Undertittel>
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
              verdi={svarFrist ? formatterDatoTilNorsk(svarFrist) : "-"}
            />
          </Nav.Column>
        </Nav.Row>
      </dl>

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
        {erSed() ? (
          !erSedForesporsel(behandlingstema) && (
            <div>
              <Nav.Row>
                <Nav.Column xs="12">
                  <OppsummeringVerdiPar
                    nokkel="Periode fra SED"
                    verdi={periodeFraTil(lovvalgsperiodeFom, lovvalgsperiodeTom)}
                  />
                </Nav.Column>
              </Nav.Row>
              <Nav.Row>
                <Nav.Column xs="12">
                  <OppsummeringVerdiPar nokkel="Lovvalgsland fra SED" verdi={storeForbokstaver(lovvalgsland.term)} />
                </Nav.Column>
              </Nav.Row>
            </div>
          )
        ) : (
          <div>
            <Nav.Row>
              <Nav.Column xs="12">
                <OppsummeringVerdiPar
                  nokkel="Søknadsperiode"
                  verdi={periodeFraTil(lovvalgsperiodeFom, lovvalgsperiodeTom)}
                />
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
    </div>
  );
};

Oppsummering.propTypes = {
  arbeidsland: PT.arrayOf(MPT.Kodeverk),
  oppholdsland: PT.arrayOf(MPT.Kodeverk),
  lovvalgsland: MPT.Kodeverk,
  fagsak: MPT.Fagsak.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering.isRequired,
  behandlingstema: PT.string.isRequired,
  behandlingsfristLinje: PT.node.isRequired,
  behandlingsstatusLinje: PT.node.isRequired,
  behandlingstemaLinje: PT.node.isRequired,
  behandlingstypeLinje: PT.node.isRequired,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  behandlingsgrunnlagPeriodeFom: PT.string,
  behandlingsgrunnlagPeriodeTom: PT.string,
  periodeLabel: PT.string.isRequired,
  className: PT.string,
};
Oppsummering.defaultProps = {
  arbeidsland: [],
  oppholdsland: [],
  lovvalgsland: {},
  behandlingsgrunnlagPeriodeFom: undefined,
  behandlingsgrunnlagPeriodeTom: undefined,
  className: undefined,
};

export default Oppsummering;
