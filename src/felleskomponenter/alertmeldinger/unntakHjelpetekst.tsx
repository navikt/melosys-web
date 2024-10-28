import "./alertmeldinger.css";
import { Box } from "@navikt/ds-react";
import * as Nav from "../../navFrontend";

const UnntakHjelpetekst = () => {
  return (
    <Box padding="4" background="surface-subtle">
      <Nav.List title="For å søke om unntak, må du:">
        <Nav.List.Item text="sende nødvendige brev via «Send brev» -menyen.">
          <Nav.List>
            <Nav.List.Item text="send søknad om unntak, som fritekstbrev, til «Utenlandsk trygdemyndighet»" />
            <Nav.List.Item text="send orienteringsbrev, som fritekstbrev, til «Bruker eller brukers fullmektig»" />
          </Nav.List>
        </Nav.List.Item>
        <Nav.List.Item text="endre behandlingsstatus til «Avventer svar fra utenlandsk trygdemyndighet»." />
        <Nav.List.Item text="registrere perioden i MEDL som uavklart." />
      </Nav.List>
      <br />
      <Nav.List title="Når du får svar, må du:" size="small">
        <Nav.List.Item text="avvise den uavklarte perioden i MEDL." />
        <Nav.List.Item text="endre valget på dette steget til «Jeg vil innvilge søknaden» eller «Jeg vil avslå søknaden» ." />
      </Nav.List>
    </Box>
  );
};

export default UnntakHjelpetekst;
