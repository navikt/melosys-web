import * as Api from "../../../../../services/api";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";

import { useAsyncCallbackState } from "../../../../../hooks";

import OrganisasjonsAdresse from "../../../../adresser/organisasjonsAdresse";

import "./enkeltArbeidsforholdNorgeRedigeringUtfort.css";

interface EnkeltArbeidsforholdNorgeRedigeringUtfortProps {
  org: Api.Organisasjon;
  saksnummer: string;
}

const EnkeltArbeidsforholdNorgeRedigeringUtfort = ({
  org,
  saksnummer,
}: EnkeltArbeidsforholdNorgeRedigeringUtfortProps) => {
  const [kontaktopplysninger] = useAsyncCallbackState(
    () => Api.Fagsaker.kontaktopplysninger.hent(saksnummer, org.orgnr),
    { kontaktnavn: null, kontaktorgnr: null, kontakttelefon: null },
    [saksnummer, org.orgnr]
  );
  const [kontaktopplysningerOrg] = useAsyncCallbackState<Partial<Api.Organisasjon>>(
    () => Api.Organisasjoner.hentOrganisasjon(kontaktopplysninger.kontaktorgnr || ""),
    {},
    [kontaktopplysninger.kontaktorgnr]
  );

  const kontaktopplysningerContent =
    !kontaktopplysninger.kontaktnavn && !kontaktopplysninger.kontaktorgnr ? (
      "Ingen kontaktopplysninger oppgitt"
    ) : (
      <>
        <Nav.Typo.Element>Kontaktopplysninger</Nav.Typo.Element>
        <Nav.Row>
          <Nav.Column xs="5">
            <Nav.Typo.Normaltekst>Kontaktperson:</Nav.Typo.Normaltekst>
            <Nav.Typo.Element>{kontaktopplysninger.kontaktnavn || "Ikke oppgitt"}</Nav.Typo.Element>
          </Nav.Column>
          <Nav.Column xs="5">
            <Nav.Typo.Normaltekst>Telefonnummer:</Nav.Typo.Normaltekst>
            <Nav.Typo.Element>{kontaktopplysninger.kontakttelefon || "Ikke oppgitt"}</Nav.Typo.Element>
          </Nav.Column>
        </Nav.Row>
        {!Utils._isEmpty(kontaktopplysningerOrg) ? (
          <>
            <Nav.Row>
              <Nav.Column xs="5">
                <OrganisasjonsAdresse organisasjon={kontaktopplysningerOrg} visTittel={false} />
              </Nav.Column>
              <Nav.Column xs="3">
                <Nav.Typo.Normaltekst>Organisasjonsnummer</Nav.Typo.Normaltekst>
                <Nav.Typo.Element>{kontaktopplysningerOrg.orgnr}</Nav.Typo.Element>
              </Nav.Column>
            </Nav.Row>
            <Nav.Row>
              <Nav.Column xs="12">
                <Nav.Typo.EtikettLiten>*Brev til arbeidsgiver sendes til denne adressen</Nav.Typo.EtikettLiten>
              </Nav.Column>
            </Nav.Row>
          </>
        ) : (
          <Nav.Row>
            <Nav.Column xs="5">
              <Nav.Typo.Normaltekst>Organisasjonsnummer</Nav.Typo.Normaltekst>
              <Nav.Typo.Element>Ikke oppgitt</Nav.Typo.Element>
            </Nav.Column>
          </Nav.Row>
        )}
      </>
    );

  return (
    <div className="enkelt__arbeidsforhold__norge__redigeringutfort">
      <Nav.Row>
        <Nav.Column xs="5">
          <OrganisasjonsAdresse organisasjon={org} visNavn={false} visTittel={false} />
        </Nav.Column>
        <Nav.Column xs="3">
          <Nav.Typo.Normaltekst style={{ marginTop: "0.5em" }}>Organisasjonsnummer:</Nav.Typo.Normaltekst>
          <Nav.Typo.Element>{org.orgnr}</Nav.Typo.Element>
        </Nav.Column>
      </Nav.Row>
      {kontaktopplysningerContent}
    </div>
  );
};

export default EnkeltArbeidsforholdNorgeRedigeringUtfort;
