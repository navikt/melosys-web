import PT from "prop-types";

import MKV from "../../melosyskodeverk";
import * as MPT from "../../proptypes";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";
import * as Routing from "../../url";

import Behandling from "./behandling";
import PanelHeader from "../panelHeader";
import EnkeltDato from "../enkeltDato";
import { DatoOmradeDescription } from "../datoOmrade";
import { sorterElementerEtterDato } from "../sorterbarListe";
import Soknadsland from "../soknadsland";

import "./fagsak.css";
import { useFeatureToggle } from "../../featuretoggle";
import { MELOSYS_PENSJONIST } from "../../featuretoggle/toggleNavn";

/**
 * Dette er enkeltlinjen for én sak som inneholder sakstittel og metadata
 * for å gi saksbehandler oversikt over sakens innhold før hun klikker
 * seg inn på den.
 */
function Fagsak({ sak = {}, landkoder }) {
  const { opprettetDato, sakstype, saksstatus, saksnummer, sakstema, behandlingOversikter } = sak;
  const erPensjonistToggleEnabled = useFeatureToggle(MELOSYS_PENSJONIST);

  const link = (behandling) =>
    Routing.lagUrl(
      saksnummer,
      behandling.behandlingID,
      sakstype.kode,
      sakstema.kode,
      behandling.behandlingstema.kode,
      behandling.behandlingstype.kode,
      erPensjonistToggleEnabled,
    );

  const customMargin = { marginLeft: "1em" };

  const sorterteBehandlinger = behandlingOversikter
    .slice()
    .sort(sorterElementerEtterDato("descending", "opprettetDato"));

  return (
    <div className="panel fagsak">
      <PanelHeader tittel={`${sakstype?.term} - ${sakstema?.term}`} />
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="12" md="5">
            <dl className="fagsak__meta">
              <dt>Saksstatus:</dt>
              <dd>{KV.objektTilTerm(saksstatus, "(ukjent)")}</dd>
              <dt>Sak opprettet:</dt>
              <dd>
                <EnkeltDato dato={opprettetDato} defaultValue="(ukjent)" />
              </dd>
            </dl>
          </Nav.Column>
          <Nav.Column xs="12" md="4">
            <dl className="fagsak__meta">
              {sakstype?.kode === MKV.Koder.sakstyper.FTRL ? (
                <DatoOmradeDescription label="Medlemskapsperiode: " periode={sak.periode} />
              ) : (
                <DatoOmradeDescription label="Lovvalgsperiode: " periode={sak.periode} />
              )}
              <dt>Land:</dt>
              <dd>
                <Soknadsland land={sak.land} visFulltNavn landkoderKodeverk={landkoder} />
              </dd>
            </dl>
          </Nav.Column>
          <Nav.Column xs="12" md="3">
            <dl style={customMargin} className="fagsak__meta">
              <dt>&nbsp;</dt>
              <dd>&nbsp;</dd>
              <dt>Saksnummer:</dt>
              <dd>{saksnummer}</dd>
            </dl>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="fagsak__behandlinger">
          {sorterteBehandlinger.map((behandling) => (
            <Behandling key={behandling.behandlingID} behandling={behandling} link={link(behandling)} />
          ))}
        </Nav.Row>
      </Nav.Container>
    </div>
  );
}

Fagsak.propTypes = {
  sak: MPT.BehandligOversikt,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

export default Fagsak;
