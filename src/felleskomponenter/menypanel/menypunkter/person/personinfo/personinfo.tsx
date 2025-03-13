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

  function Fødselsnummer() {
    return (
      <>
        <Nav.Column xs={erLitenSkjerm ? "4" : "6"}>
          <Nav.BodyLong weight="semibold" size="small">
            Fødselsnummer:
          </Nav.BodyLong>
        </Nav.Column>
        <Nav.Column xs={erLitenSkjerm ? "8" : "6"}>{personopplysninger?.fnr || "-"}</Nav.Column>
      </>
    );
  }

  function Fødselsdato() {
    const foedselsdato = personinfoData?.hentSaksopplysninger.persondata.foedselsdato;
    let fødselsdato = null;
    if (foedselsdato) {
      fødselsdato = foedselsdato.foedselsdato ? <EnkeltDato dato={foedselsdato.foedselsdato} /> : foedselsdato.foedselsaar;
    }
    return (
      <>
        <Nav.Column xs={erLitenSkjerm ? "4" : "6"}>
          <Nav.BodyLong weight="semibold" size="small">
            Fødselsdato:
          </Nav.BodyLong>
        </Nav.Column>
        <Nav.Column xs={erLitenSkjerm ? "8" : "6"}>{fødselsdato}</Nav.Column>
      </>
    );
  }

  function Fødested() {
    const foedested = personinfoData?.hentSaksopplysninger.persondata.foedested.foedested;
    return (
      <>
        <Nav.Column xs={erLitenSkjerm ? "4" : "6"}>
          <Nav.BodyLong weight="semibold" size="small">
            Fødested:
          </Nav.BodyLong>
        </Nav.Column>
        <Nav.Column xs={erLitenSkjerm ? "8" : "6"}>{foedested}</Nav.Column>
      </>
    );
  }

  function Fødeland() {
    const foedeland = personinfoData?.hentSaksopplysninger.persondata.foedested.foedeland;
    return (
      <>
        <Nav.Column xs={erLitenSkjerm ? "4" : "6"}>
          <Nav.BodyLong weight="semibold" size="small">
            Fødeland:
          </Nav.BodyLong>
        </Nav.Column>
        <Nav.Column xs={erLitenSkjerm ? "8" : "6"}>{foedeland}</Nav.Column>
      </>
    );
  }

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
        <Fødeland />
        <Fødested />
      </Nav.Column>
      <Nav.Column xs={erLitenSkjerm ? "12" : "5"}>
        <Fødselsnummer />
        <Fødselsdato />
      </Nav.Column>
    </div>
  );
}

export default PersonInfo;
