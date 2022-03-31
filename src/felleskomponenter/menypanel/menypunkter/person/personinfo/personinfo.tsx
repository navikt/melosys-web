import React from "react";
import * as Nav from "../../../../../navFrontend";

import bem from "../../../../../bemUtils";
import EnkeltDato from "../../../../datoOmrade/enkeltDato";
import Sivilstand from "./sivilstand/sivilstand";
import Personstatus from "./personstatus/personstatus";
import useHentPersonopplysninger from "../../../../personlinje/useHentpersonopplysninger";

import { useHentPersoninfoQuery } from "./hentPersoninfo.generated";

import "./personinfo.css";

interface PersonInfoProps {
  fnr: string;
  behandlingID: number;
  modalAriaHideApp?: boolean;
}

const PersonInfo = ({ fnr, behandlingID, modalAriaHideApp }: PersonInfoProps) => {
  const personopplysninger = useHentPersonopplysninger(behandlingID, false);
  const {
    data: personinfoData,
    loading: personinfoLoading,
    error: personinfoError,
  } = useHentPersoninfoQuery({ variables: { behandlingID } });

  const personinfoClassName = bem("personinfo");

  const personinfoLoadingContent = (
    <>
      Henter personinfo...
      <Nav.NavFrontendSpinner />
    </>
  );

  const personinfoErrorContent = <Nav.AlertStripeFeil>Feil ved henting av personinfo!</Nav.AlertStripeFeil>;

  return (
    <div className={personinfoClassName.block}>
      {personinfoLoading && personinfoLoadingContent}
      {personinfoError && personinfoErrorContent}
      <div className={personinfoClassName.element("element")}>
        <Personstatus status={personinfoData?.hentSaksopplysninger.persondata.folkeregisterpersonstatuser} />
      </div>
      <div className={personinfoClassName.element("element")}>
        <Nav.Typo.EtikettLiten>Fødselsnummer</Nav.Typo.EtikettLiten>
        <Nav.Typo.Element>{fnr || personopplysninger?.fnr}</Nav.Typo.Element>
      </div>
      <div className={personinfoClassName.element("element")}>
        <Nav.Typo.EtikettLiten>Fødselsdato</Nav.Typo.EtikettLiten>
        <Nav.Typo.Element>
          <EnkeltDato dato={personinfoData?.hentSaksopplysninger.persondata.foedsel.foedselsdato} />
        </Nav.Typo.Element>
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
