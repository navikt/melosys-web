import PT from "prop-types";

import { MKVUtils } from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as MPT from "../../../proptypes";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Ikon from "../../../resources/images";
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
      <Skjema.CustomRadioPanelElement
        tittel={
          <div className="tittel">
            <span>
              {KV.objektTilTerm(sakstype)} - {KV.objektTilTerm(sakstema)}
            </span>
          </div>
        }
        hoyreSideTittel={
          <Nav.Link target="_blank" href={`${URL_BASENAME}${link}`}>
            {saksnummer}
            <Ikon.ExternalLink className="ikon" />
          </Nav.Link>
        }
        data={[
          {
            description: <div className="behandlingstype">{tittel}</div>,
          },
          {
            term: "Periode:",
            description: periodeTittel ? (
              <>
                <EnkeltDato dato={periodeTittel.fom} defaultValue="" /> -{" "}
                <EnkeltDato dato={periodeTittel.tom} defaultValue="" />
              </>
            ) : null,
          },
          {
            term: "Land:",
            description: <Soknadsland land={land} visFulltNavn landkoderKodeverk={landkoder} />,
          },
          {
            description: <BehandlingerListe behandlingOversikter={behandlingOversikter} />,
          },
        ]}
      />
    </div>
  );
}

EnkeltSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

export default EnkeltSak;
