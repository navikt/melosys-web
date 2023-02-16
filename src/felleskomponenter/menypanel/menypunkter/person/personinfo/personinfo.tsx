import React, { useEffect, useState } from "react";
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
  modalAriaHideApp?: boolean;
  endreFokus: boolean;
}

const PersonInfo = ({ behandlingID, modalAriaHideApp, ...props }: PersonInfoProps) => {
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
      <Nav.NavFrontendSpinner />
    </>
  );
  const personinfoErrorContent = <Nav.AlertStripeFeil>Feil ved henting av personinfo!</Nav.AlertStripeFeil>;

  const Fødselsdato = () => {
    const foedsel = personinfoData?.hentSaksopplysninger.persondata.foedsel;
    if (!foedsel) return null;
    return (
      <>
        {foedsel.foedselsdato ? (
          <Nav.Typo.Element>
            <EnkeltDato dato={foedsel.foedselsdato} />
          </Nav.Typo.Element>
        ) : (
          foedsel.foedselsaar
        )}
      </>
    );
  };

  return (
    <div className={personinfoClassName.block}>
      {personinfoLoading && personinfoLoadingContent}
      {personinfoError && personinfoErrorContent}
      <div className={personinfoClassName.element("element")}>
        <Personstatus
          status={personinfoData?.hentSaksopplysninger.persondata.folkeregisterpersonstatuser}
          modalAriaHideApp={modalAriaHideApp}
        />
      </div>
      <div className={personinfoClassName.element("element")}>
        <Nav.Typo.EtikettLiten>Fødselsnummer</Nav.Typo.EtikettLiten>
        <Nav.Typo.Element>{personopplysninger?.fnr || "-"}</Nav.Typo.Element>
      </div>
      <div className={personinfoClassName.element("element")}>
        <Nav.Typo.EtikettLiten>Fødselsdato</Nav.Typo.EtikettLiten>
        <Fødselsdato />
      </div>
      <div className={personinfoClassName.element("element")} aria-live="polite" aria-atomic>
        <Sivilstand
          sivilstand={personinfoData?.hentSaksopplysninger.persondata.sivilstand}
          modalAriaHideApp={modalAriaHideApp}
        />
      </div>
    </div>
  );
};

export default PersonInfo;
