import { Bostedsadresse, Kontaktadresse, Oppholdsadresse } from "../../../../../../graphql";
import AdresseTable from "./adresseTable";

type Adresse = Bostedsadresse | Oppholdsadresse | Kontaktadresse;

interface AdresseTableContainerProps {
  adressetype: string;
  adresser: Adresse[];
}

function AdresseTableContainer({ adressetype, adresser }: AdresseTableContainerProps) {
  const gyldigeAdresser = adresser.filter((adresse) => !adresse.erHistorisk);
  const historiskeAdresser = adresser.filter((adresse) => adresse.erHistorisk);

  return (
    <>
      <AdresseTable adressetype={adressetype} adresser={gyldigeAdresser} />
      {historiskeAdresser.length > 0 ? (
        <AdresseTable adressetype={adressetype} adresser={historiskeAdresser} historisk />
      ) : null}
    </>
  );
}

export default AdresseTableContainer;
