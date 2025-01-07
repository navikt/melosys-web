import "./alertmeldinger.css";
import { Box } from "@navikt/ds-react";
import * as Nav from "../../navFrontend";

function UnntakHjelpetekst() {
  return (
    <Box padding="4" background="surface-subtle">
      <Nav.List title="For å søke om unntak, må du:">
        <Nav.List.Item>
          sende nødvendige brev via «Send brev» -menyen.
          <Nav.List>
            <Nav.List.Item>send søknad om unntak, som fritekstbrev, til «Utenlandsk trygdemyndighet»</Nav.List.Item>
            <Nav.List.Item>
              send orienteringsbrev, som fritekstbrev, til «Bruker eller brukers fullmektig»
            </Nav.List.Item>
          </Nav.List>
        </Nav.List.Item>
        <Nav.List.Item>endre behandlingsstatus til «Avventer svar fra utenlandsk trygdemyndighet».</Nav.List.Item>
        <Nav.List.Item>registrere perioden i MEDL som uavklart.</Nav.List.Item>
      </Nav.List>
      <br />
      <Nav.List title="Når du får svar, må du:">
        <Nav.List.Item>avvise den uavklarte perioden i MEDL.</Nav.List.Item>
        <Nav.List.Item>
          endre valget på dette steget til «Jeg vil innvilge søknaden» eller «Jeg vil avslå søknaden».
        </Nav.List.Item>
      </Nav.List>
    </Box>
  );
}

export default UnntakHjelpetekst;
