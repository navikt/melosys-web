import "./alertmeldinger.css";
import { Box, List } from "@navikt/ds-react";
import MelList from "../../navFrontend/melList/melList";

const UnntakHjelpetekst = () => {
  return (
    <Box padding="4" background="surface-subtle">
      <MelList title="For å søke om unntak, må du:">
        <MelList.MelItem text="sende nødvendige brev via «Send brev» -menyen.">
          <MelList.MelItem text="send søknad om unntak, som fritekstbrev, til «Utenlandsk trygdemyndighet»" />
          <MelList.MelItem text="send orienteringsbrev, som fritekstbrev, til «Bruker eller brukers fullmektig»" />
        </MelList.MelItem>

        <MelList.MelItem text="endre behandlingsstatus til «Avventer svar fra utenlandsk trygdemyndighet»." />
        <MelList.MelItem text="registrere perioden i MEDL som uavklart." />
      </MelList>
      <br />
      <List title="Når du får svar, må du:" size="small">
        <MelList.MelItem text="avvise den uavklarte perioden i MEDL." />
        <MelList.MelItem text="endre valget på dette steget til «Jeg vil innvilge søknaden» eller «Jeg vil avslå søknaden» ." />
      </List>
    </Box>
  );
};

export default UnntakHjelpetekst;
