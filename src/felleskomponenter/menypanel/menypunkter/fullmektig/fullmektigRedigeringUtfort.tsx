import React from "react";
import { Organisasjon } from "Domene";

import * as Nav from "../../../../utils/navFrontend";
import * as Ikoner from "../../../../resources/images";
import * as Utils from "../../../../utils";
import * as Api from "../../../../services/api";

import MKV from "../../../../melosyskodeverk";

import { useAsyncCallbackState } from "../../../../hooks";

import OrganisasjonsAdresse from "../../../adresser/organisasjonsAdresse";
import { KontaktOpplysning } from "../kontaktopplysninger";

import "./fullmektigRedigeringUtfort.css";

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
  org: Partial<Organisasjon>;
  representererKode: string | null;
  kontaktopplysninger: KontaktOpplysning;
}

const FullmektigRedigeringUtfort = ({
  org,
  representererKode,
  kontaktopplysninger,
}: FullmektigRedigeringUtfortProps) => {
  const [kontaktopplysningerOrg] = useAsyncCallbackState(
    () => Api.Organisasjoner.hentOrganisasjon(kontaktopplysninger.kontaktorgnr),
    {},
    Utils.logger.error,
    [kontaktopplysninger.kontaktorgnr]
  );

  const kontantopplysningerContent =
    !kontaktopplysninger.kontaktnavn && !kontaktopplysninger.kontaktorgnr ? (
      "Ingen kontaktopplysninger oppgitt"
    ) : (
      <>
        <Nav.typo.Element className="kontaktopplysninger__label">Kontaktopplysninger</Nav.typo.Element>
        <Nav.Row>
          <Nav.Column xs="3">
            <Nav.typo.Normaltekst>Kontaktperson:</Nav.typo.Normaltekst>
            <Nav.typo.Element>{kontaktopplysninger.kontaktnavn || "Ikke oppgitt"}</Nav.typo.Element>
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
                    <Nav.typo.Normaltekst>Organisasjonsnummer</Nav.typo.Normaltekst>
                    <Nav.typo.Element>{kontaktopplysningerOrg.orgnr}</Nav.typo.Element>
                  </Nav.Column>
                </>
              )}
            </Nav.Row>
            <Nav.Row className="brevinfo">
              <Nav.Column xs="12">
                <Nav.typo.EtikettLiten>*Brev sendes til denne adressen</Nav.typo.EtikettLiten>
              </Nav.Column>
            </Nav.Row>
          </>
        ) : (
          <Nav.Row>
            <Nav.Column xs="3">
              <Nav.typo.Normaltekst>Organisasjonsnummer</Nav.typo.Normaltekst>
              <Nav.typo.Element>{kontaktopplysningerOrg.orgnr || "Ikke oppgitt"}</Nav.typo.Element>
            </Nav.Column>
          </Nav.Row>
        )}
      </>
    );

  return (
    <div className="fullmektig__redigering__utfort">
      <Nav.Row>
        <Nav.Column xs="3">
          {org && <OrganisasjonsAdresse organisasjon={org} visNavn={false} visTittel={false} />}
        </Nav.Column>
        <Nav.Column xs="4">
          <Nav.typo.Normaltekst style={{ marginTop: "0.5em" }}>Organisasjonsnummer:</Nav.typo.Normaltekst>
          <Nav.typo.Element>{org.orgnr}</Nav.typo.Element>
        </Nav.Column>
        <Nav.Column xs="5">
          <Nav.typo.Element style={{ marginTop: "0.5em" }}>Hvem er dette fullmektig for?</Nav.typo.Element>
          {representererKode && (
            <span>
              <Ikoner.GreenCheckmark className="checkmark" />
              <Nav.typo.Normaltekst className="representerer__tekst">
                {hentRepresentererTekst(representererKode)}
              </Nav.typo.Normaltekst>
            </span>
          )}
        </Nav.Column>
      </Nav.Row>
      {kontantopplysningerContent}
    </div>
  );
};

export default FullmektigRedigeringUtfort;
