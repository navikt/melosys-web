import React from 'react';
import { Organisasjon } from 'Domene';

import * as Api from '../../../../../services/api';
import * as Nav from '../../../../../utils/navFrontend';
import * as Utils from '../../../../../utils';

import { useAsyncCallbackState } from '../../../../../hooks';

import OrganisasjonsAdresse from '../../../../adresser/organisasjonsAdresse';

import './enkeltArbeidsforholdNorgeRedigeringUtfort.css';

interface EnkeltArbeidsforholdNorgeRedigeringUtfortProps {
  org: Organisasjon,
  saksnummer: string
}

const EnkeltArbeidsforholdNorgeRedigeringUtfort = ({
  org,
  saksnummer,
}: EnkeltArbeidsforholdNorgeRedigeringUtfortProps) => {
  const [kontaktopplysninger] = useAsyncCallbackState(
    () => Api.Fagsaker.kontaktopplysninger.hent(saksnummer, org.orgnr),
    { kontaktnavn: null, kontaktorgnr: null },
    Utils.logger.error,
    [saksnummer, org.orgnr]
  );
  const [kontaktopplysningerOrg] = useAsyncCallbackState(() => Api.Organisasjoner.hentOrganisasjon(kontaktopplysninger.kontaktorgnr), {}, Utils.logger.error, [kontaktopplysninger.kontaktorgnr]);

  return (
    <div className="enkelt__arbeidsforhold__norge__redigeringutfort">
      <Nav.Row>
        <Nav.Column xs="5">
          <OrganisasjonsAdresse
            organisasjon={org}
            visNavn={false}
            visTittel={false}
          />
        </Nav.Column>
        <Nav.Column xs="3">
          <Nav.typo.Normaltekst style={{ marginTop: '0.5em' }}>Organisasjonsnummer:</Nav.typo.Normaltekst>
          <Nav.typo.Element>{org.orgnr}</Nav.typo.Element>
        </Nav.Column>
      </Nav.Row>
      <Nav.typo.Element>Kontaktopplysninger</Nav.typo.Element>
      <Nav.Row>
        {
          kontaktopplysninger.kontaktnavn &&
          <Nav.Column xs="5">
            <Nav.typo.Normaltekst>Kontaktperson:</Nav.typo.Normaltekst>
            <Nav.typo.Element>{kontaktopplysninger.kontaktnavn}</Nav.typo.Element>
          </Nav.Column>
        }
      </Nav.Row>
      <Nav.Row>
        {
          !Utils._isEmpty(kontaktopplysningerOrg) &&
          <>
            <Nav.Column xs="5">
              <OrganisasjonsAdresse
                organisasjon={kontaktopplysningerOrg}
                visTittel={false}
              />
            </Nav.Column>
            <Nav.Column xs="3">
              <Nav.typo.Normaltekst>Organisasjonsnummer</Nav.typo.Normaltekst>
              <Nav.typo.Element>{kontaktopplysningerOrg.orgnr}</Nav.typo.Element>
            </Nav.Column>
          </>
        }
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.typo.EtikettLiten>
            *Brev til arbeidsgiver sendes til denne adressen
          </Nav.typo.EtikettLiten>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

export default EnkeltArbeidsforholdNorgeRedigeringUtfort;
