import { useSelector } from "react-redux";
import { Foedsel } from "../../../../../../graphql";
import * as Nav from "../../../../../../navFrontend";
import EnkeltDato from "../../../../../enkeltDato";
import "./fødsel.css";
import { landkoderSelectors } from "../../../../../../ducks/landkoder";

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

  const alleLandkoder = useSelector(landkoderSelectors.LandkoderSelector);

  let fødselsdato = null;
  let fødeland = null;

  if (fødsel) {
    fødselsdato = foedselsdato ? <EnkeltDato dato={foedselsdato} /> : foedselsaar;
    fødeland = foedeland ? alleLandkoder.find((land) => land.kode === foedeland)?.term : null;
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
      <Nav.Column xs={erLitenSkjerm ? "8" : "6"}>{fødeland || "-"}</Nav.Column>
    </div>
  );
}

export default Fødsel;
