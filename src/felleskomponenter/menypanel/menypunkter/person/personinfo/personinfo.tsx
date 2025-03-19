import { useEffect, useState } from "react";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";

import bem from "../../../../../bemUtils";
import EnkeltDato from "../../../../enkeltDato/enkeltDato";
import Sivilstand from "./sivilstand/sivilstand";
import Personstatus from "./personstatus/personstatus";
import Fødsel from "./fødsel/fødsel";
import useHentPersonopplysninger from "../../../../informasjonlinje/useHentpersonopplysninger";

import { useHentPersoninfoQuery } from "./hentPersoninfo.generated";

import "./personinfo.css";

interface PersonInfoProps {
  behandlingID: number;
  endreFokus: boolean;
}

function PersonInfo({ behandlingID, ...props }: PersonInfoProps) {
  const personopplysninger = useHentPersonopplysninger(behandlingID, false);
  const {
    data: personinfoData,
    loading: personinfoLoading,
    error: personinfoError,
  } = useHentPersoninfoQuery({ variables: { behandlingID } });
  const [endreFokus, setEndreFokus] = useState(props.endreFokus);

  useEffect(() => {
    if (!personinfoLoading && endreFokus) {
      Utils.navigasjon.flyttFokusTilHtmlElementFraId("Person");
      setEndreFokus(false);
    }
  }, [personinfoLoading]);

  const personinfoClassName = bem("personinfo");

  const personinfoLoadingContent = (
    <>
      Henter personinfo...
      <Nav.Loader />
    </>
  );
  const personinfoErrorContent = <Nav.Alert variant="error">Feil ved henting av personinfo!</Nav.Alert>;

  const erLitenSkjerm = Utils.mediaQuery.useMediaQuery({ maxWidth: 1680 });
  const foedsel = personinfoData?.hentSaksopplysninger.persondata.foedsel;

  return (
    <div className={personinfoClassName.block}>
      {personinfoLoading && personinfoLoadingContent}
      {personinfoError && personinfoErrorContent}
      <Nav.Column xs={erLitenSkjerm ? "12" : "7"}>
        <Personstatus
          status={personinfoData?.hentSaksopplysninger.persondata.folkeregisterpersonstatuser}
          erLitenSkjerm={erLitenSkjerm}
        />
        <Sivilstand
          sivilstand={personinfoData?.hentSaksopplysninger.persondata.sivilstand}
          erLitenSkjerm={erLitenSkjerm}
        />
      </Nav.Column>
      <Nav.Column xs={erLitenSkjerm ? "12" : "5"}>
        <Fødsel fødsel={foedsel} personopplysninger={personopplysninger?.fnr} erLitenSkjerm={erLitenSkjerm} />
      </Nav.Column>
    </div>
  );
}

export default PersonInfo;
