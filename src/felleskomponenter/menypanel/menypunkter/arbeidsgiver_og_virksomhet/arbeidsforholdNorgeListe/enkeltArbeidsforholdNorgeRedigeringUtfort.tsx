import * as Api from "../../../../../services/api";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";

import { useAsyncCallbackState } from "../../../../../hooks";

import OrganisasjonsAdresse from "../../../../adresser/organisasjonsAdresse";

import "./enkeltArbeidsforholdNorgeRedigeringUtfort.less";

interface EnkeltArbeidsforholdNorgeRedigeringUtfortProps {
  org: Api.Organisasjon;
  saksnummer: string;
}

function EnkeltArbeidsforholdNorgeRedigeringUtfort({
  org,
  saksnummer,
}: EnkeltArbeidsforholdNorgeRedigeringUtfortProps) {
  const [kontaktopplysninger] = useAsyncCallbackState(
    () => Api.Fagsaker.kontaktopplysninger.hent(saksnummer, org.orgnr),
    { kontaktnavn: null, kontaktorgnr: null, kontakttelefon: null },
    [saksnummer, org.orgnr],
  );
  const [kontaktopplysningerOrg] = useAsyncCallbackState<Partial<Api.Organisasjon>>(
    () => Api.Organisasjoner.hentOrganisasjon(kontaktopplysninger.kontaktorgnr || ""),
    {},
    [kontaktopplysninger.kontaktorgnr],
  );

  const kontaktopplysningerContent =
    !kontaktopplysninger.kontaktnavn && !kontaktopplysninger.kontaktorgnr ? (
      "Ingen kontaktopplysninger oppgitt"
    ) : (
      <>
        <Nav.BodyLong weight="semibold" size="small">
          Kontaktopplysninger
        </Nav.BodyLong>
        <Nav.Row>
          <Nav.Column xs="5">
            <Nav.BodyLong size="small">Kontaktperson:</Nav.BodyLong>
            <Nav.BodyLong weight="semibold" size="small">
              {kontaktopplysninger.kontaktnavn || "Ikke oppgitt"}
            </Nav.BodyLong>
          </Nav.Column>
          <Nav.Column xs="5">
            <Nav.BodyLong size="small">Telefonnummer:</Nav.BodyLong>
            <Nav.BodyLong weight="semibold" size="small">
              {kontaktopplysninger.kontakttelefon || "Ikke oppgitt"}
            </Nav.BodyLong>
          </Nav.Column>
        </Nav.Row>
        {!Utils._isEmpty(kontaktopplysningerOrg) ? (
          <>
            <Nav.Row>
              <Nav.Column xs="5">
                <OrganisasjonsAdresse organisasjon={kontaktopplysningerOrg} visTittel={false} />
              </Nav.Column>
              <Nav.Column xs="3">
                <Nav.BodyLong size="small">Organisasjonsnummer</Nav.BodyLong>
                <Nav.BodyLong weight="semibold" size="small">
                  {kontaktopplysningerOrg.orgnr}
                </Nav.BodyLong>
              </Nav.Column>
            </Nav.Row>
            <Nav.Row>
              <Nav.Column xs="12">
                <Nav.Detail>*Brev til arbeidsgiver sendes til denne adressen</Nav.Detail>
              </Nav.Column>
            </Nav.Row>
          </>
        ) : (
          <Nav.Row>
            <Nav.Column xs="5">
              <Nav.BodyLong size="small">Organisasjonsnummer</Nav.BodyLong>
              <Nav.BodyLong weight="semibold" size="small">
                Ikke oppgitt
              </Nav.BodyLong>
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
          <Nav.BodyLong size="small" style={{ marginTop: "0.5em" }}>
            Organisasjonsnummer:
          </Nav.BodyLong>
          <Nav.BodyLong weight="semibold" size="small">
            {org.orgnr}
          </Nav.BodyLong>
        </Nav.Column>
      </Nav.Row>
      {kontaktopplysningerContent}
    </div>
  );
}

export default EnkeltArbeidsforholdNorgeRedigeringUtfort;
