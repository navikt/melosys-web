import PT from "prop-types";

import { MKVUtils } from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as MPT from "../../../proptypes";
import * as Nav from "../../../navFrontend";
import { URL_BASENAME } from "../../../constants";

import EnkeltDato from "../../../felleskomponenter/enkeltDato";
import Soknadsland from "../../../felleskomponenter/soknadsland";
import { lagUrl } from "../../../url";

import "./enkeltSak.css";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_PENSJONIST } from "../../../featuretoggle/toggleNavn";
import BehandlingerListe from "./behandlingerListe";

/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
function EnkeltSak(props) {
  const { landkoder } = props;
  const { periode, land, behandlingOversikter, sakstype, saksnummer, sakstema } = props.sak;
  const erPensjonistToggleEnabled = useFeatureToggle(MELOSYS_PENSJONIST);

  const { tittel, behandlingstype, behandlingsstatus, behandlingstema, behandlingID } = behandlingOversikter[0];
  const { soknadsperiode } =
    behandlingOversikter.find((behandlingOversikt) => behandlingOversikt.soknadsperiode != null) ?? {};

  const link = lagUrl(
    saksnummer,
    behandlingID,
    sakstype.kode,
    sakstema.kode,
    behandlingstema.kode,
    behandlingstype.kode,
    erPensjonistToggleEnabled,
  );

  const periodeTittel = MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandlingsstatus?.kode)
    ? periode
    : soknadsperiode;

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
          <div className="customRadioPanelRow">
            <span className="customRadioPanelDescription">
              <div className="behandlingstype">{behandlingstema.term}</div>
            </span>
          </div>

          {periodeTittel && (
            <div className="customRadioPanelRow">
              <span className="customRadioPanelTerm">Periode:</span>
              <span className="customRadioPanelDescription">
                <EnkeltDato dato={periodeTittel.fom} defaultValue="" /> -{" "}
                <EnkeltDato dato={periodeTittel.tom} defaultValue="" />
              </span>
            </div>
          )}

          <div className="customRadioPanelRow">
            <span className="customRadioPanelTerm">Land:</span>
            <span className="customRadioPanelDescription">
              <Soknadsland land={land} visFulltNavn landkoderKodeverk={landkoder} />
            </span>
          </div>

          <div className="customRadioPanelRow">
            <span className="customRadioPanelDescription">
              <BehandlingerListe behandlingOversikter={behandlingOversikter} />
            </span>
          </div>
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
