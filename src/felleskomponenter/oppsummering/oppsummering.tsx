import React, { useState } from "react";
import PT from "prop-types";
import classNames from "classnames";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV, { MKVUtils } from "../../melosyskodeverk";
import * as KV from "../../kodeverk";
import * as MPT from "../../proptypes";
import * as Nav from "../../navFrontend";
import * as Api from "../../services/api";
import * as Ikoner from "../../resources/images";
import * as Utils from "../../utils";

import { useFeatureToggle } from "../../featuretoggle";
import { BehandlingsstatusMedSvarfrist } from "../behandlingsstatus";
import KopierbarTekst from "../kopierbarTekst";
import OppsummeringVerdiPar from "./verdiPar/oppsummeringVerdiPar";
import EndreBehandlingModal from "./endreBehandlingModal";

import "./oppsummering.css";

interface OppsummeringProps {
  oppsummering: Api.Behandlinger.behandling.Oppsummering;
  fagsak: Api.Fagsak;
  arbeidsland: KTObject[];
  lovvalgsland: KTObject;
  mottattDato: string;
  lovvalgsperiodeFom: string;
  lovvalgsperiodeTom: string;
  behandlingsgrunnlagPeriodeFom: string;
  behandlingsgrunnlagPeriodeTom: string;
  className?: string;
}

const Oppsummering = (props: OppsummeringProps) => {
  const {
    oppsummering,
    fagsak,
    arbeidsland,
    lovvalgsland,
    mottattDato,
    lovvalgsperiodeFom,
    lovvalgsperiodeTom,
    behandlingsgrunnlagPeriodeFom,
    behandlingsgrunnlagPeriodeTom,
    className,
  } = props;
  const sakstemaToggle = useFeatureToggle("melosys.sakstema");
  const [skalViseEndreModal, setSkalViseEndreModal] = useState(false);

  const isLitenSkjerm = Utils.mediaQuery.useMediaQuery({ maxWidth: 1440 });

  if (!oppsummering || !fagsak?.sakstype) return <div />;

  const { saksnummer, sakstype, sakstema, registrertDato, hovedpartRolle } = fagsak;
  const {
    endretDato,
    endretAvNavn,
    svarFrist,
    behandlingstype,
    behandlingsfrist,
    behandlingstema,
    behandlingsstatus,
    behandlingsresultattype,
  } = oppsummering;
  const lovvalgsperiode = `${lovvalgsperiodeFom} - ${lovvalgsperiodeTom}`;
  const behandlingsgrunnlagperiode = `${behandlingsgrunnlagPeriodeFom} - ${behandlingsgrunnlagPeriodeTom}`;

  const landStorBokstav = (land: KTObject) =>
    land?.term ? Utils.streng.storeForbokstaverForLand(land.term) : "Ukjent";

  const landTilSetning = (land: KTObject[]) =>
    land && land.length > 0
      ? Utils.streng.arrayTilKonjunksjon(
          land.map((enkeltLand) => Utils.streng.storeForbokstaverForLand(enkeltLand.term || ""))
        )
      : "Ukjent";

  const erSed = behandlingstype && KV.objektTilKode(behandlingstype) === MKV.Koder.behandlinger.behandlingstyper.SED;
  const erTrygdeavtale = sakstype && KV.objektTilKode(sakstype) === MKV.Koder.sakstyper.TRYGDEAVTALE;
  const hovedpartErVirksomhet = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;

  const tabellEnKolonne = (data: string[][]) => {
    const rows: JSX.Element[] = [];
    data.forEach((row) =>
      rows.push(
        <Nav.Row className="datarad" key={`datarad-${row[0]}`}>
          <OppsummeringVerdiPar nokkel={row[0]} verdi={row[1]} ekstrafelt={<span className="italic">{row[2]}</span>} />
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
    let col1;
    let col2;
    if (hovedpartErVirksomhet) {
      col1 = [["Beh. opprettet", Utils.dato.formatterDatoTilNorsk(registrertDato)]];
      col2 = [["Sist oppdatert", Utils.dato.formatterDatoTilNorsk(endretDato), `  ${endretAvNavn}`]];
    } else {
      col1 = [erSed ? ["Periode fra SED", lovvalgsperiode] : ["Søknadsperiode", behandlingsgrunnlagperiode]];
      if (erTrygdeavtale) col1.push(["Lovvalgsperiode", lovvalgsperiode]);
      col1.push(["Land", erSed ? landStorBokstav(lovvalgsland) : landTilSetning(arbeidsland)]);

      col2 = [
        ["Søknad mottatt", mottattDato || "-"],
        ["Beh. opprettet", Utils.dato.formatterDatoTilNorsk(registrertDato)],
        ["Sist oppdatert", Utils.dato.formatterDatoTilNorsk(endretDato), `  ${endretAvNavn}`],
      ];
    }

    return isLitenSkjerm ? tabellEnKolonne(col1.concat(col2)) : tabellToKolonner(col1, col2);
  };

  return (
    <section aria-label="oppsummeringer" className="oppsummering panelSeksjon">
      <EndreBehandlingModal
        fagsak={fagsak}
        oppsummering={oppsummering}
        skalViseModal={skalViseEndreModal}
        lukkModal={() => setSkalViseEndreModal(false)}
      />

      <Nav.Panel className="saksbehandling__soknad-sammendrag">
        <Nav.Row>
          <Nav.Column xs="12">
            <div aria-label="behandlingsinformasjon" className={classNames(className, "oppsummering")}>
              <Nav.Row className="datarad">
                <dl className="oppsummering_verdi_par">
                  <dt className="nokkel">Saksnummer:</dt>
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
                    {sakstemaToggle === "enabled" ? (
                      <Nav.Typo.Undertittel>
                        {KV.objektTilTerm(sakstype)} - {KV.objektTilTerm(sakstema)}
                      </Nav.Typo.Undertittel>
                    ) : (
                      <Nav.Typo.Undertittel>{KV.objektTilTerm(sakstype)}</Nav.Typo.Undertittel>
                    )}
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
                    <span className="bold">{KV.objektTilTerm(behandlingstema)}</span>
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="12">
                    <span className="bold">{KV.objektTilTerm(behandlingstype)}</span>
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="12">
                    <OppsummeringVerdiPar nokkel="Frist" verdi={Utils.dato.formatterDatoTilNorsk(behandlingsfrist)} />
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="12" className="status-resultattype-wrapper">
                    <BehandlingsstatusMedSvarfrist
                      behandlingsstatus={behandlingsstatus}
                      svarFrist={svarFrist}
                      className="behandlingsstatus"
                    />
                    {MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandlingsstatus.kode) && (
                      <Nav.EtikettBase type="info" className="behandlingsresultattype">
                        {behandlingsresultattype.term}
                      </Nav.EtikettBase>
                    )}
                  </Nav.Column>
                </Nav.Row>
              </Nav.Panel>

              {renderTabell()}
            </div>
          </Nav.Column>
        </Nav.Row>
      </Nav.Panel>
    </section>
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
