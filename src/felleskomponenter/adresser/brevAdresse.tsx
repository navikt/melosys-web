import { DokumenterV2 } from "../../services/api";
import * as Nav from "../../navFrontend";

function samleFelt(separator: string, ...felt: any[]) {
  return felt?.filter((f) => f).join(separator);
}

const feltPlussKomma = (felt?: any) => (felt ? `${felt}, ` : "");

const BrevAdresse = ({
  mottakerNavn,
  adresselinjer = [],
  postnr,
  poststed,
  region,
  land,
  className,
  visNavn,
}: DokumenterV2.BrevAdresse & { className?: string; visNavn?: boolean }) => (
  <div className={className}>
    {visNavn && <Nav.Typo.Element>{mottakerNavn}</Nav.Typo.Element>}
    <Nav.Typo.Normaltekst>
      {feltPlussKomma(samleFelt(", ", ...adresselinjer))}
      {feltPlussKomma(samleFelt(" ", postnr, poststed))}
      {feltPlussKomma(region)}
      {land}
    </Nav.Typo.Normaltekst>
  </div>
);

export default BrevAdresse;
