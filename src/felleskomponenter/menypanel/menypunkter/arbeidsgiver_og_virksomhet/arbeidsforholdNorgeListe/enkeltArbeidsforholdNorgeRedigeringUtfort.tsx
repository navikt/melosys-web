import React from 'react';
import { Organisasjon } from 'Domene';

import * as Api from '../../../../../services/api';

import { useAsyncCallbackState } from '../../../../../hooks';

interface EnkeltArbeidsforholdNorgeRedigeringUtfortProps {
  org: Organisasjon,
  saksnummer: string
}

const EnkeltArbeidsforholdNorgeRedigeringUtfort = ({
  org,
  saksnummer,
}: EnkeltArbeidsforholdNorgeRedigeringUtfortProps) => {
  const [kontaktopplysninger] = useAsyncCallbackState(() => Api.Fagsaker.kontaktopplysninger.hent(saksnummer, org.orgnr), null);

  return (
    <div></div>
  );
};

export default EnkeltArbeidsforholdNorgeRedigeringUtfort;
