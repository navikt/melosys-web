import { useCallback, useState } from "react";

import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";
import * as Api from "../../../../services/api";

import { isApiError } from "../../../../services";
import { hentBostedsadresseForPerson } from "../../../../graphql/adresse";
import { EnkelFellesInputFnrDnrOrgnrSaksnr } from "../../../enkelFellesInputFnrDnrOrgnrSaksnr";

interface SokFullmektigOrgProps {
  onIdentFunnet: (orgnr: string, personIdent: string) => Promise<any>;
  defaultOrgnrIdent: string | null;
}

function SokFullmektigOrgOrIdent(props: SokFullmektigOrgProps) {
  const { onIdentFunnet, defaultOrgnrIdent } = props;

  const [ident, setIdent] = useState(defaultOrgnrIdent || "");
  const [feilmelding, setFeilmelding] = useState<string | undefined>(undefined);

  const identFunnetHandler = async (funnetOrgnr: string, funnetPersonIdent: string) => {
    try {
      await onIdentFunnet(funnetOrgnr, funnetPersonIdent);
    } catch (e: any) {
      setFeilmelding(e.message);
    }
  };

  const sok = async (sokIdent: string) => {
    if (Utils.organisasjon.erOrgnrGyldig(sokIdent)) {
      try {
        await Api.Organisasjoner.hentOrganisasjon(sokIdent);
        identFunnetHandler(sokIdent, "");
      } catch (e) {
        if (isApiError(e)) {
          if (e.response.status === 404) setFeilmelding("Kunne ikke finne organisasjon");
          else setFeilmelding("Ukjent feil ved søk på org.nr.");
        }
      }
    } else if (Utils.person.erGyldigFnrEllerDnr(sokIdent)) {
      try {
        await hentBostedsadresseForPerson(sokIdent);
        identFunnetHandler("", sokIdent);
      } catch (e) {
        if (isApiError(e)) {
          if (e.response.status === 404) setFeilmelding("Kunne ikke finne person");
          else setFeilmelding("Ukjent feil ved søk på fnr eller dnr");
        }
      }
    } else {
      setFeilmelding("Ugyldig orgnr, f-nr eller d-nr");
    }
  };

  const debouncedSok = useCallback(Utils._debounce(sok, 400), []);

  const vedEndretInput = (sokStreng: string) => {
    setIdent(sokStreng);
    setFeilmelding(undefined);
    debouncedSok(sokStreng);
  };

  return (
    <Nav.Row>
      <Nav.Column xs="9">
        <EnkelFellesInputFnrDnrOrgnrSaksnr
          label="Organisasjonsnr. eller fødselsnr./d-nr.: "
          placeholder="Skriv inn..."
          onChange={vedEndretInput}
          value={ident}
          feil={feilmelding}
        />
      </Nav.Column>
    </Nav.Row>
  );
}

export default SokFullmektigOrgOrIdent;
