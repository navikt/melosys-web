import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Tags from "../../tags";
import * as Api from "../../../../services/api";

import Fullmektige from "./fullmektige";
import "./fullmektigcontainer.css";
import ChevronKnapp from "../../../chevronKnapp/chevronKnapp";
import { useState } from "react";
import FullmektigHistorikk from "./fullmektigHistorikk";
import { AdresseOgFeil } from "./types";

interface FullmektigProps {
  redigerbart: boolean;
  visArbeidsforholdRolleEtiketter: boolean;
}

function Fullmektig({ redigerbart, visArbeidsforholdRolleEtiketter }: FullmektigProps) {
  const [expanded, setExpanded] = useState(false);

  const finnOrganisasjonAdresse = (orgnr: string): Promise<AdresseOgFeil> => {
    return Api.Adresser.hentOrganisasjonAdresse(orgnr)
      .then((adresse) => {
        if (!adresse.mottakerNavn) {
          return { adresse: undefined, feil: "Kunne ikke finne organisasjonen" };
        }
        if (adresse.ugyldig) {
          return { adresse: undefined, feil: "Kunne ikke finne adresse til organisasjonen" };
        }
        return { adresse, feil: undefined };
      })
      .catch(() => ({ adresse: undefined, feil: "Kunne ikke finne organisasjonen" }));
  };

  const finnPersonAdresse = (personIdent: string): Promise<AdresseOgFeil> => {
    return Api.Adresser.hentPersonAdresse(personIdent)
      .then((adresse) => {
        if (!adresse.mottakerNavn) {
          return { adresse: undefined, feil: "Kunne ikke finne personen" };
        }
        if (adresse.ugyldig) {
          return { adresse: undefined, feil: "Kunne ikke finne adresse til personen" };
        }
        return { adresse, feil: undefined };
      })
      .catch(() => ({ adresse: undefined, feil: "Kunne ikke finne personen" }));
  };

  return (
    <div className="fullmektig__container">
      <div className="tittel">
        <Nav.Heading level="2" style={{ display: "inline", marginRight: "1em" }}>
          {KV.Menypunkter.Fullmektig.tittel}
        </Nav.Heading>
        {visArbeidsforholdRolleEtiketter && <Tags.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
      </div>
      <Fullmektige
        redigerbart={redigerbart}
        finnOrganisasjonAdresse={finnOrganisasjonAdresse}
        finnPersonAdresse={finnPersonAdresse}
      />
      <ChevronKnapp
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        label={expanded ? "Lukk historikk" : "Vis historikk"}
      />
      {expanded && (
        <div className="horisontalScroll">
          <FullmektigHistorikk
            finnOrganisasjonAdresse={finnOrganisasjonAdresse}
            finnPersonAdresse={finnPersonAdresse}
          />
        </div>
      )}
    </div>
  );
}

export default Fullmektig;
