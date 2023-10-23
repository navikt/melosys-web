import { Personopplysninger } from "../../../../graphql";
import { Organisasjon } from "../../../../services/modules/types";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";
import { Type } from "./types";

const Adresse = ({
  type,
  person,
  organisasjon,
  visNavn = true,
  className,
}: {
  type?: Type;
  person?: Personopplysninger;
  organisasjon?: Partial<Organisasjon>;
  visNavn?: boolean;
  className?: string;
}) => {
  const felt = (felt?: any) => felt ?? "";
  const feltPlussKomma = (felt?: any) => (felt ? felt + ", " : "");

  function samleFelt(...felt: any[]) {
    return felt?.filter((f) => f).join(" ");
  }

  if (type === Type.PERSON && person) {
    const adresse = person.bostedsadresser[0].adresse;
    const coAdresse = `${
      person.bostedsadresser[0].coAdressenavn ? " C/O " + person.bostedsadresser[0].coAdressenavn : ""
    }`;
    return (
      <div className={className}>
        {visNavn && (
          <Nav.Typo.Element>
            {Utils.person.tilSammensattNavnFraObjekt(person.navn)}
            {coAdresse}
          </Nav.Typo.Element>
        )}
        <Nav.Typo.Normaltekst>
          {feltPlussKomma(adresse.tilleggsnavn)}
          {feltPlussKomma(samleFelt(adresse.gatenavn, adresse.husnummerEtasjeLeilighet))}
          {feltPlussKomma(adresse.postboks)}
          {feltPlussKomma(samleFelt(adresse.postnummer, adresse.poststed))}
          {feltPlussKomma(adresse.region)}
          {Utils.streng.storeForbokstaverForLand(adresse.land)}
        </Nav.Typo.Normaltekst>
      </div>
    );
  }
  if (type === Type.ORGANISASJON && organisasjon) {
    const adresse = !Utils.adresse.erRegisterAdresseObjektTomt(organisasjon.postadresse)
      ? organisasjon.postadresse
      : organisasjon.forretningsadresse;
    return (
      <div className={className}>
        {visNavn && <Nav.Typo.Element>{organisasjon.navn}</Nav.Typo.Element>}
        <Nav.Typo.Normaltekst>
          {feltPlussKomma(
            samleFelt(
              adresse?.gateadresse.gatenavn,
              adresse?.gateadresse.gatenummer,
              felt(adresse?.gateadresse.husnummer) + felt(adresse?.gateadresse.husbokstav)
            )
          )}
          {feltPlussKomma(samleFelt(adresse?.postnr, adresse?.poststed))}
          {Utils.streng.storeForbokstaverForLand(
            typeof adresse?.land === "object" ? adresse?.land?.term!! : adresse?.land!!
          )}
        </Nav.Typo.Normaltekst>
      </div>
    );
  }
  return null;
};

export default Adresse;
