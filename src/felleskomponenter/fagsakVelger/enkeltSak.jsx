import PT from "prop-types";

import * as KV from "../../kodeverk";
import * as Routing from "../../url";
import * as MPT from "../../proptypes";
import * as Nav from "../../navFrontend";
import * as Ikon from "../../resources/images";

import EnkeltDato from "../enkeltDato";
import Soknadsland from "../soknadsland";

import BehandlingerListe from "./behandlingerListe";
import { HStack, VStack } from "@navikt/ds-react";
import { sorterElementerEtterDato } from "../sorterbarListe";

/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
function EnkeltSak(props) {
  const { landkoder } = props;
  const { periode, land, behandlingOversikter, sakstype, saksnummer, sakstema } = props.sak;
  const sorterteBehandlinger = behandlingOversikter
    .slice()
    .sort(sorterElementerEtterDato("descending", "opprettetDato"));

  const { behandlingstema } = sorterteBehandlinger[0];

  const handleSearchClick = (e) => {
    e.preventDefault();
    sessionStorage.setItem("sokefrase", saksnummer);
    Routing.nyFane("sok");
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
      <div>
        Periode: <EnkeltDato dato={periode.fom} defaultValue="" /> - <EnkeltDato dato={periode.tom} defaultValue="" />
      </div>
      <HStack justify="space-between">
        <div>
          Land: <Soknadsland land={land} visFulltNavn landkoderKodeverk={landkoder} />
        </div>
        <Nav.Link onClick={handleSearchClick}>
          Gå til saksoversikt <Ikon.ExternalLink className="ikon" />
        </Nav.Link>
      </HStack>
      <div>
        <BehandlingerListe behandlingerForFagsak={sorterteBehandlinger} />
      </div>
    </VStack>
  );
}

EnkeltSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

export default EnkeltSak;
