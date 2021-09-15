import React from "react";

import * as Nav from "../../../../../utils/navFrontend";

import Bostedsadresser from "./bostedsadresser";
import Oppholdsadresser from "./oppholdsadresser";
import Kontaktadresser from "./kontaktadresser";

import { useHentAdresserQuery, HentAdresserQuery } from "./hentAdresser";

interface AdresserProps {
  data: HentAdresserQuery;
}

export const Adresser = ({ data }: AdresserProps) => {
  const { bostedsadresser, oppholdsadresser, kontaktadresser } = data.hentSaksopplysninger.persondata;

  return (
    <div>
      {bostedsadresser.length > 0 && <Bostedsadresser bostedsadresser={bostedsadresser} />}
      {oppholdsadresser.length > 0 && <Oppholdsadresser oppholdsadresser={oppholdsadresser} />}
      {kontaktadresser.length > 0 && <Kontaktadresser kontaktadresser={kontaktadresser} />}
    </div>
  );
};

interface AdresserWrapperProps {
  behandlingID: number;
}

const AdresserWrapper = ({ behandlingID }: AdresserWrapperProps) => {
  const { error, loading, data } = useHentAdresserQuery({ variables: { behandlingID } });

  if (error) return <Nav.AlertStripe type="feil">Kunne ikke hente adresser!</Nav.AlertStripe>;
  if (loading) return <div>Laster adresser...</div>;
  if (!data) return null;

  return <Adresser data={data} />;
};

export default AdresserWrapper;
