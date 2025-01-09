import * as Nav from "../../../../../navFrontend";

import AdresseTableContainer from "./adresseTable";

import { HentAdresserQuery, useHentAdresserQuery } from "./hentAdresser";

interface AdresserProps {
  data: HentAdresserQuery;
}

export function Adresser({ data }: AdresserProps) {
  const { bostedsadresser, oppholdsadresser, kontaktadresser } = data.hentSaksopplysninger.persondata;

  return (
    <div>
      {bostedsadresser.length > 0 && <AdresseTableContainer adresser={bostedsadresser} adressetype="Bostedsadresse" />}
      {oppholdsadresser.length > 0 && (
        <AdresseTableContainer adresser={oppholdsadresser} adressetype="Oppholdsadresse" />
      )}
      {kontaktadresser.length > 0 && <AdresseTableContainer adresser={kontaktadresser} adressetype="Kontaktadresse" />}
    </div>
  );
}

interface AdresserWrapperProps {
  behandlingID: number;
}

function AdresserWrapper({ behandlingID }: AdresserWrapperProps) {
  const { error, loading, data } = useHentAdresserQuery({ variables: { behandlingID } });

  if (error) return <Nav.Alert variant="error">Kunne ikke hente adresser!</Nav.Alert>;
  if (loading) return <div>Laster adresser...</div>;
  if (!data) return null;

  return <Adresser data={data} />;
}

export default AdresserWrapper;
