import { Foedsel } from "../../../../../../graphql";
import * as Nav from "../../../../../../navFrontend";
import EnkeltDato from "../../../../../enkeltDato";
import "../personinfo.css";

interface FødselProps {
  fødsel?: {
    foedeland?: string | null;
    foedested?: string | null;
    foedselsaar?: number;
    foedselsdato?: string | null;
  };
  personopplysninger?: string;
  erLitenSkjerm: boolean;
}

export function Fødsel({ fødsel, personopplysninger, erLitenSkjerm }: FødselProps) {
  const { foedeland, foedested, foedselsaar, foedselsdato } = fødsel || {};

  let fødselsdato = null;
  if (fødsel) {
    fødselsdato = foedselsdato ? <EnkeltDato dato={foedselsdato} /> : foedselsaar;
  }

  return (
    <div className="fødsel">
      <Nav.Column xs={erLitenSkjerm ? "4" : "6"}>
        <Nav.BodyLong weight="semibold" size="small">
          Fødselsnummer:
        </Nav.BodyLong>
      </Nav.Column>
      <Nav.Column xs={erLitenSkjerm ? "8" : "6"}>{personopplysninger || "-"}</Nav.Column>

      <Nav.Column xs={erLitenSkjerm ? "4" : "6"}>
        <Nav.BodyLong weight="semibold" size="small">
          Fødselsdato:
        </Nav.BodyLong>
      </Nav.Column>
      <Nav.Column xs={erLitenSkjerm ? "8" : "6"}>{fødselsdato || "-"}</Nav.Column>

      <Nav.Column xs={erLitenSkjerm ? "4" : "6"}>
        <Nav.BodyLong weight="semibold" size="small">
          Fødested:
        </Nav.BodyLong>
      </Nav.Column>
      <Nav.Column xs={erLitenSkjerm ? "8" : "6"}>{foedested || "-"}</Nav.Column>

      <Nav.Column xs={erLitenSkjerm ? "4" : "6"}>
        <Nav.BodyLong weight="semibold" size="small">
          Fødeland:
        </Nav.BodyLong>
      </Nav.Column>
      <Nav.Column xs={erLitenSkjerm ? "8" : "6"}>{foedeland || "-"}</Nav.Column>
    </div>
  );
}

export default Fødsel;
