import React, { useState } from "react";

import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../ui";

import { Person } from "../../../../../services/api";

import EnkeltDato from "../../../../datoOmrade/enkeltDato";
import SivilstandModal from "./sivilstandModal";
import { useHentSivilstandQuery } from "./hentSivilstand.generated";

import "./personinfo.css";

interface PersonInfoProps {
  person: Person;
  behandlingID: number;
  sivilstandModalAriaHideApp?: boolean;
}

const PersonInfo = ({
  person: { fnr, foedselsdato, personStatus },
  behandlingID,
  sivilstandModalAriaHideApp,
}: PersonInfoProps) => {
  const [visSivilstandModal, setVisSivilstandModal] = useState(false);
  const { data: sivilstandData, loading: sivilstandLoading, error: sivilstandError } = useHentSivilstandQuery({
    variables: { behandlingID },
  });

  const sivilstandLoadingContent = (
    <>
      Henter sivilstand...
      <Nav.NavFrontendSpinner />
    </>
  );

  const sivilstandErrorContent = <Nav.AlertStripeFeil>Feil ved henting av sivilstand!</Nav.AlertStripeFeil>;

  const aktiveSivilstander =
    sivilstandData?.hentSaksopplysninger.persondata.sivilstand.filter((sivilstand) => !sivilstand.erHistorisk) || [];
  const historiskeSivilstander =
    sivilstandData?.hentSaksopplysninger.persondata.sivilstand.filter((sivilstand) => sivilstand.erHistorisk) || [];

  return (
    <div className="personinfo">
      <div className="personinfo__element">
        <Nav.Typo.EtikettLiten>Fødselsnummer</Nav.Typo.EtikettLiten>
        <Nav.Typo.Element>{fnr}</Nav.Typo.Element>
      </div>
      <div className="personinfo__element">
        <Nav.Typo.EtikettLiten>Fødselsdato</Nav.Typo.EtikettLiten>
        <Nav.Typo.Element>
          <EnkeltDato dato={foedselsdato} />
        </Nav.Typo.Element>
      </div>
      <div className="personinfo__element">
        <Nav.Typo.EtikettLiten>Personstatus</Nav.Typo.EtikettLiten>
        <Nav.Typo.Element>{KV.objektTilTerm(personStatus)}</Nav.Typo.Element>
      </div>
      <div className="personinfo__element" aria-live="polite" aria-atomic>
        <Nav.Typo.EtikettLiten>Sivilstand</Nav.Typo.EtikettLiten>
        {sivilstandLoading && sivilstandLoadingContent}
        {sivilstandError && sivilstandErrorContent}
        {
          /* TODO: fjern. !sivilstandLoading && !sivilstandError && */ sivilstandData && (
            <Nav.Typo.Element>
              {aktiveSivilstander[0].type}
              <Mui.Lenkeknapp onClick={() => setVisSivilstandModal(true)} className="personinfo__vis-detaljer-button">
                Vis detaljer
              </Mui.Lenkeknapp>
            </Nav.Typo.Element>
          )
        }
      </div>
      {visSivilstandModal && (
        <SivilstandModal
          aktiveSivilstander={aktiveSivilstander}
          historiskeSivilstander={historiskeSivilstander}
          onRequestClose={() => setVisSivilstandModal(false)}
          ariaHideApp={sivilstandModalAriaHideApp}
        />
      )}
    </div>
  );
};

export default PersonInfo;
