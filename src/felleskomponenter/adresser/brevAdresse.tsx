import { DokumenterV2 } from "../../services/api";
import * as Nav from "../../navFrontend";

function samleFelt(separator: string, ...felt: any[]) {
  return felt?.filter((f) => f).join(separator);
}

const feltPlussKomma = (felt?: any) => (felt ? `${felt}, ` : "");

function BrevAdresse({
  mottakerNavn,
  adresselinjer = [],
  postnr,
  poststed,
  region,
  land,
  className,
  visNavn,
}: DokumenterV2.BrevAdresse & { className?: string; visNavn?: boolean }) {
  return (
    <div className={className}>
      {visNavn && (
        <Nav.BodyLong weight="semibold" size="small">
          {mottakerNavn}
        </Nav.BodyLong>
      )}
      <Nav.BodyLong size="small">
        {feltPlussKomma(samleFelt(", ", ...adresselinjer))}
        {feltPlussKomma(samleFelt(" ", postnr, poststed))}
        {feltPlussKomma(region)}
        {land}
      </Nav.BodyLong>
    </div>
  );
}

export default BrevAdresse;
