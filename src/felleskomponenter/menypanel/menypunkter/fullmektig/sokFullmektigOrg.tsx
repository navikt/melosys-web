import React, {ChangeEventHandler, useState} from "react";

import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";
import * as Api from "../../../../services/api";

import {isApiError} from "../../../../services";
import {useHentBostedsadresseForPersonLazyQuery} from "../familieforhold/familiemedlemmer/annenForelderModal/hentBostedsadresseForPerson.generated";

interface SokFullmektigOrgProps {
  onIdentFunnet: (orgnr: string, personIdent: string) => Promise<any>;
  defaultIdent: string | null;
}

function SokFullmektigOrg(props: SokFullmektigOrgProps) {
  const {onIdentFunnet, defaultIdent} = props;

  const [ident, setIdent] = useState(defaultIdent || "");
  const [feilmelding, setFeilmelding] = useState<string | undefined>(undefined);
  const [korrekteLengdeOrgnrOppgittMinstEnGang, setKorrekteLengdeOrgnrOppgittMinstEnGang] = useState(false);
  const [korrekteLengdeFnrDnrOppgittMinstEnGang, setKorrekteLengdeFnrDnrOppgittMinstEnGang] = useState(false);
  const [hentBostedsadresseForPerson] = useHentBostedsadresseForPersonLazyQuery()

  const identFunnetHandler = async (funnetOrgnr: string, funnetPersonIdent: string) => {
    try {
      await onIdentFunnet(funnetOrgnr, funnetPersonIdent);
    } catch (e: any) {
      setFeilmelding(e.message);
    }
  };

  const erFnrEllerDnrLengde = (sokIdent: string) => {
    return !Utils.person.erFnrLengde(sokIdent) || !Utils.person.erDnrLengde(sokIdent)
  }

  const sok = async (sokIdent: string) => {
    if (!Utils.organisasjon.erOrgnrLengde(sokIdent)) {
      if (korrekteLengdeOrgnrOppgittMinstEnGang) {
        setFeilmelding("Org.nr. er 9 siffer");
      }
    }

    if (!erFnrEllerDnrLengde(sokIdent)) {
      if (korrekteLengdeFnrDnrOppgittMinstEnGang) {
        setFeilmelding("F-nr/D-nr er 11 siffer");
      }
    }

    if (Utils.organisasjon.erOrgnrLengde(sokIdent)) {
      setKorrekteLengdeOrgnrOppgittMinstEnGang(true);
      setKorrekteLengdeFnrDnrOppgittMinstEnGang(false);
    }

    if (erFnrEllerDnrLengde(sokIdent)) {
      setKorrekteLengdeFnrDnrOppgittMinstEnGang(true);
      setKorrekteLengdeOrgnrOppgittMinstEnGang(false);
    }

    if (Utils.organisasjon.erOrgnrLengde(sokIdent) && Utils.organisasjon.erOrgnrGyldig(sokIdent)) {
      try {
        await Api.Organisasjoner.hentOrganisasjon(sokIdent);
        identFunnetHandler(sokIdent, "");
      } catch (e) {
        if (isApiError(e)) {
          if (e.response.status === 404) setFeilmelding("Kunne ikke finne organisasjon");
          else setFeilmelding("Ukjent feil ved søk på org.nr.");
        }
      }
    } else if (Utils.person.erGyldigFnr(sokIdent) || Utils.person.erGyldigDnr(sokIdent)) {
      try {
        await hentBostedsadresseForPerson({ variables: { ident: sokIdent } });
        identFunnetHandler("", sokIdent);
      } catch (e) {
        if (isApiError(e)) {
          if (e.response.status === 404) setFeilmelding("Kunne ikke finne person");
          else setFeilmelding("Ukjent feil ved søk på fnr eller dnr");
        }
      }
    } else if (korrekteLengdeOrgnrOppgittMinstEnGang) {
      setFeilmelding("Ugyldig org.nr.");
    } else {
      setFeilmelding("Ugyldig f-nr eller d-nr");
    }
  }

  const vedEndretInput: ChangeEventHandler<HTMLInputElement> = (event) => {
    setIdent(event.target.value);
    setFeilmelding(undefined);
    sok(event.target.value?.replace(" ", ""));
  };

  return (
    <Nav.Row>
      <Nav.Column xs="9">
        <Nav.Input
          label="Organisasjonsnummer. eller fødselsnr./d-nr:"
          placeholder="Skriv inn..."
          onChange={vedEndretInput}
          value={ident}
          feil={feilmelding}
        />
      </Nav.Column>
    </Nav.Row>
  );
}

export default SokFullmektigOrg;
