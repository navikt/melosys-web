import { useEffect, useState } from "react";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";

import bem from "../../../../../bemUtils";
import EnkeltDato from "../../../../enkeltDato/enkeltDato";
import Sivilstand from "./sivilstand/sivilstand";
import Personstatus from "./personstatus/personstatus";
import useHentPersonopplysninger from "../../../../informasjonlinje/useHentpersonopplysninger";

import { useHentPersoninfoQuery } from "./hentPersoninfo.generated";

import "./personinfo.css";

interface PersonInfoProps {
  behandlingID: number;
  endreFokus: boolean;
}

const PersonInfo = ({ behandlingID, ...props }: PersonInfoProps) => {
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

  const Fødselsnummer = () => {
    return (
      <>
        <Nav.Column xs={erLitenSkjerm ? "4" : "6"}>
          <Nav.Typo.Element>Fødselsnummer:</Nav.Typo.Element>
        </Nav.Column>
        <Nav.Column xs={erLitenSkjerm ? "8" : "6"}>{personopplysninger?.fnr || "-"}</Nav.Column>
      </>
    );
  };

  const Fødselsdato = () => {
    const foedsel = personinfoData?.hentSaksopplysninger.persondata.foedsel;
    let fødselsdato = null;
    if (foedsel) {
      fødselsdato = foedsel.foedselsdato ? <EnkeltDato dato={foedsel.foedselsdato} /> : foedsel.foedselsaar;
    }
    return (
      <>
        <Nav.Column xs={erLitenSkjerm ? "4" : "6"}>
          <Nav.Typo.Element>Fødselsdato:</Nav.Typo.Element>
        </Nav.Column>
        <Nav.Column xs={erLitenSkjerm ? "8" : "6"}>{fødselsdato}</Nav.Column>
      </>
    );
  };

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
        <Fødselsnummer />
        <Fødselsdato />
      </Nav.Column>
    </div>
  );
};

export default PersonInfo;
