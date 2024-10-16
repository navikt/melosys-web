import "./alertmeldinger.css";
import { Box, List } from "@navikt/ds-react";
import { MelList, MelListItem } from "../liste/melListe";

const UnntakHjelpetekst = () => {
  return (
    <Box padding="4" background="surface-subtle">
      <MelList title="For å søke om unntak, må du:">
        <MelListItem text="sende nødvendige brev via «Send brev» -menyen.">
          <MelListItem text="send søknad om unntak, som fritekstbrev, til «Utenlandsk trygdemyndighet»" />
          <MelListItem text="send orienteringsbrev, som fritekstbrev, til «Bruker eller brukers fullmektig»" />
        </MelListItem>

        <MelListItem text="endre behandlingsstatus til «Avventer svar fra utenlandsk trygdemyndighet»." />
        <MelListItem text="registrere perioden i MEDL som uavklart." />
      </MelList>
      <br />
      <List title="Når du får svar, må du:" size="small">
        <MelListItem text="avvise den uavklarte perioden i MEDL." />
        <MelListItem text="endre valget på dette steget til «Jeg vil innvilge søknaden» eller «Jeg vil avslå søknaden» ." />
      </List>
    </Box>
  );
};

export default UnntakHjelpetekst;
