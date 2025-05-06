import PT from "prop-types";
import { useHistory } from "react-router-dom";

import { MKVUtils } from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as MPT from "../../../proptypes";
import * as Nav from "../../../navFrontend";
import * as Ikon from "../../../resources/images";

import EnkeltDato from "../../../felleskomponenter/enkeltDato";
import Soknadsland from "../../../felleskomponenter/soknadsland";

import BehandlingerListe from "./behandlingerListe";
import { HStack, VStack } from "@navikt/ds-react";

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
    <VStack>
      <div className="customRadioPanelTittel">
        <Nav.Heading size="xsmall">
          {KV.objektTilTerm(sakstype)} - {KV.objektTilTerm(sakstema)}
        </Nav.Heading>
        {saksnummer}
      </div>
      <div>{behandlingstema.term}</div>
      {periodeTittel && (
        <div>
          Periode:
          <EnkeltDato dato={periodeTittel.fom} defaultValue="" /> -{" "}
          <EnkeltDato dato={periodeTittel.tom} defaultValue="" />
        </div>
      )}
      <HStack justify="space-between">
        <div>
          Land: <Soknadsland land={land} visFulltNavn landkoderKodeverk={landkoder} />
        </div>
        <Nav.Link onClick={handleSearchClick}>
          Gå til saksoversikt <Ikon.ExternalLink className="ikon" />
        </Nav.Link>
      </HStack>
      <div>
        <BehandlingerListe behandlingOversikter={behandlingOversikter} />
      </div>
    </VStack>
  );
}

EnkeltSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

export default EnkeltSak;
