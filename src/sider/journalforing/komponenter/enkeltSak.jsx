import PT from "prop-types";
import { useHistory } from "react-router-dom";

import { MKVUtils } from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as MPT from "../../../proptypes";
import * as Nav from "../../../navFrontend";
import * as Ikon from "../../../resources/images";

import EnkeltDato from "../../../felleskomponenter/enkeltDato";
import Soknadsland from "../../../felleskomponenter/soknadsland";

import "./enkeltSak.css";
import BehandlingerListe from "./behandlingerListe";

/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
function EnkeltSak(props) {
  const { landkoder } = props;
  const { periode, land, behandlingOversikter, sakstype, saksnummer, sakstema } = props.sak;
  const history = useHistory();

  const { behandlingsstatus, behandlingstema } = behandlingOversikter[0];
  const { soknadsperiode } =
    behandlingOversikter.find((behandlingOversikt) => behandlingOversikt.soknadsperiode != null) ?? {};

  const periodeTittel = MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandlingsstatus?.kode)
    ? periode
    : soknadsperiode;

  const handleSearchClick = () => {
    sessionStorage.setItem("sokefrase", saksnummer);
    history.push("/sok");
  };

  return (
    <div className="enkeltSak">
      <div className="customRadioPanelElement">
        <div className="customRadioPanelTittel">
          <Nav.Heading size="xsmall">
            <div className="tittel">
              <span>
                {KV.objektTilTerm(sakstype)} - {KV.objektTilTerm(sakstema)}
              </span>
            </div>
          </Nav.Heading>
          {saksnummer}
        </div>
        <div className="customRadioPanelContent">
          <span className="customRadioPanelDescription">
            <div className="behandlingstype">{behandlingstema.term}</div>
          </span>

          {periodeTittel && (
            <div className="customRadioPanelRow">
              <span className="customRadioPanelTerm">Periode:</span>
              <span className="customRadioPanelDescription">
                <EnkeltDato dato={periodeTittel.fom} defaultValue="" /> -{" "}
                <EnkeltDato dato={periodeTittel.tom} defaultValue="" />
              </span>
            </div>
          )}

          <span className="customRadioPanelTerm">Land:</span>
          <span className="customRadioPanelDescription">
            <Soknadsland land={land} visFulltNavn landkoderKodeverk={landkoder} />
            <Nav.Link onClick={handleSearchClick}>
              Gå til saksoversikt <Ikon.ExternalLink className="ikon" />
            </Nav.Link>
          </span>

          <span className="customRadioPanelDescription">
            <BehandlingerListe behandlingOversikter={behandlingOversikter} />
          </span>
        </div>
      </div>
    </div>
  );
}

EnkeltSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

export default EnkeltSak;
