import React from "react";

import * as Nav from "../../../../navFrontend";
import * as Ikoner from "../../../../resources/images";
import * as Utils from "../../../../utils";
import * as Api from "../../../../services/api";

import MKV from "../../../../melosyskodeverk";

import { useAsyncCallbackState } from "../../../../hooks";

import OrganisasjonsAdresse from "../../../adresser/organisasjonsAdresse";
import { KontaktOpplysning } from "../kontaktopplysninger";

import "./fullmektigRedigeringUtfort.css";
import { HentBostedsadresseForPersonQuery } from "../familieforhold/familiemedlemmer/annenForelderModal/hentBostedsadresseForPerson.generated";
import StrukturertAdresse from "../../../adresser/strukturertAdresse";

const hentRepresentererTekst = (representererKode: string) => {
  switch (representererKode) {
    case MKV.Koder.representerer.BRUKER:
      return "Arbeidstaker";
    case MKV.Koder.representerer.ARBEIDSGIVER:
      return "Arbeidsgiver";
    case MKV.Koder.representerer.BEGGE:
      return "Både arbeidstaker og arbeidsgiver";
    default:
      return "";
  }
};

interface FullmektigRedigeringUtfortProps {
  org: Partial<Api.Organisasjon>;
  representererKode: string | null;
  kontaktopplysninger: KontaktOpplysning;
  person: HentBostedsadresseForPersonQuery["hentPersonopplysninger"] | null;
  fullmektig: Api.Fagsaker.aktoer.Aktoer;
}

const FullmektigRedigeringUtfort = ({
  org,
  representererKode,
  kontaktopplysninger,
  person,
  fullmektig,
}: FullmektigRedigeringUtfortProps) => {
  const [kontaktopplysningerOrg] = useAsyncCallbackState<Partial<Api.Organisasjon>>(
    () => Api.Organisasjoner.hentOrganisasjon(kontaktopplysninger.kontaktorgnr || ""),
    {},
    [kontaktopplysninger.kontaktorgnr]
  );

  const kontantopplysningerContent =
    !kontaktopplysninger.kontaktnavn && !kontaktopplysninger.kontaktorgnr ? (
      "Ingen kontaktopplysninger oppgitt"
    ) : (
      <>
        <Nav.Typo.Element className="kontaktopplysninger__label">Kontaktopplysninger</Nav.Typo.Element>
        <Nav.Row>
          <Nav.Column xs="3">
            <Nav.Typo.Normaltekst>Kontaktperson:</Nav.Typo.Normaltekst>
            <Nav.Typo.Element>{kontaktopplysninger.kontaktnavn || "Ikke oppgitt"}</Nav.Typo.Element>
          </Nav.Column>
        </Nav.Row>
        {!Utils._isEmpty(kontaktopplysningerOrg) ? (
          <>
            <Nav.Row>
              {!Utils._isEmpty(kontaktopplysningerOrg) && (
                <>
                  <Nav.Column xs="3">
                    <OrganisasjonsAdresse organisasjon={kontaktopplysningerOrg} visTittel={false} />
                  </Nav.Column>
                  <Nav.Column xs="5">
                    <Nav.Typo.Normaltekst>Organisasjonsnummer</Nav.Typo.Normaltekst>
                    <Nav.Typo.Element>{kontaktopplysningerOrg.orgnr}</Nav.Typo.Element>
                  </Nav.Column>
                </>
              )}
            </Nav.Row>
            <Nav.Row className="brevinfo">
              <Nav.Column xs="12">
                <Nav.Typo.EtikettLiten>*Brev sendes til denne adressen</Nav.Typo.EtikettLiten>
              </Nav.Column>
            </Nav.Row>
          </>
        ) : (
          <Nav.Row>
            <Nav.Column xs="3">
              <Nav.Typo.Normaltekst>Organisasjonsnummer</Nav.Typo.Normaltekst>
              <Nav.Typo.Element>{kontaktopplysningerOrg.orgnr || "Ikke oppgitt"}</Nav.Typo.Element>
            </Nav.Column>
          </Nav.Row>
        )}
      </>
    );

  const orgEllerFnrContent = org.orgnr ? (
    <Nav.Column xs="4">
      <Nav.Typo.Normaltekst style={{ marginTop: "0.5em" }}>Organisasjonsnummer:</Nav.Typo.Normaltekst>
      <Nav.Typo.Element>{org.orgnr}</Nav.Typo.Element>
    </Nav.Column>
  ) : (
    <Nav.Column xs="4">
      <Nav.Typo.Normaltekst style={{ marginTop: "0.5em" }}>Fødselsnr./d-nr:</Nav.Typo.Normaltekst>
      <Nav.Typo.Element>{fullmektig.personIdent}</Nav.Typo.Element>
    </Nav.Column>
  );

  return (
    <div className="fullmektig__redigering__utfort">
      <Nav.Row>
        <Nav.Column xs="3">
          {org.orgnr && <OrganisasjonsAdresse organisasjon={org} visNavn={false} visTittel={false} />}
          {person?.navn && (
            <div style={{ marginTop: "0.5em" }}>
              {Utils.person.tilSammensattNavnFraObjekt(person.navn)}
              {!Utils._isEmpty(person.bostedsadresser) && (
                <StrukturertAdresse
                  adresse={{
                    ...person.bostedsadresser[0]?.adresse,
                    landkode: person.bostedsadresser[0]?.adresse.land,
                    coAdressenavn: person.bostedsadresser[0]?.coAdressenavn,
                  }}
                />
              )}
            </div>
          )}
        </Nav.Column>
        {orgEllerFnrContent}
        <Nav.Column xs="5">
          <Nav.Typo.Element style={{ marginTop: "0.5em" }}>Hvem representerer fullmektig?</Nav.Typo.Element>
          {representererKode && (
            <span>
              <Ikoner.GreenCheckmark className="checkmark" />
              <Nav.Typo.Normaltekst className="representerer__tekst">
                {hentRepresentererTekst(representererKode)}
              </Nav.Typo.Normaltekst>
            </span>
          )}
        </Nav.Column>
      </Nav.Row>
      {org.orgnr && kontantopplysningerContent}
    </div>
  );
};

export default FullmektigRedigeringUtfort;
