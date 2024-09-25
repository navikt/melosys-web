import "./alertmeldinger.css";
import { Box, List } from "@navikt/ds-react";

const UnntakHjelpetekst = () => {
  return (
    <Box padding="4" background="surface-subtle">
      <List title="For å søke om unntak, må du:">
        <List.Item>
          sende nødvendige brev via «Send brev» -menyen.
          <List>
            <List.Item>send søknad om unntak, som fritekstbrev, til «Utenlandsk trygdemyndighet» </List.Item>
            <List.Item>send orienteringsbrev, som fritekstbrev, til «Bruker eller brukers fullmektig» </List.Item>
          </List>
        </List.Item>
        <List.Item>endre behandlingsstatus til «Avventer svar fra utenlandsk trygdemyndighet» .</List.Item>
        <List.Item>registrere perioden i MEDL som uavklart.</List.Item>
      </List>
      <br />
      <List title="Når du får svar, må du:">
        <List.Item>avvise den uavklarte perioden i MEDL.</List.Item>
        <List.Item>
          endre valget på dette steget til «Jeg vil innvilge søknaden» eller «Jeg vil avslå søknaden» .
        </List.Item>
      </List>
    </Box>
  );
};

export default UnntakHjelpetekst;
