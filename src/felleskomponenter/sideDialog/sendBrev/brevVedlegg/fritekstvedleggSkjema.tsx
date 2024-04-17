import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../skjema";
import { DokumenterV2 } from "../../../../services/api";
import bem from "../../../../bemUtils";

import "./fritekstvedleggSkjema.css";
import { begrensAntallTegn } from "../../../../utils/normalisering";
import { ColumnWidth } from "nav-frontend-grid";

interface FritekstvedleggSkjemaProps {
  felt: DokumenterV2.Felt;
  index?: number;
  /* Index benyttes for å oppnå en rerendering av HtmlEditor. Dersom vi redigerer først ett eksisterende fritekstvedlegg
  og begynner en redigering på et annet eksisterende vedlegg uten å lagre vil ikke HtmlEditor rerenderes med ny verdi da
  denne hentes fra redux-form
   */
  resetFritekstvedlegg: () => void;
  leggTilFritekstvedlegg: () => void;
  width?: ColumnWidth;
}

const TEGNBEGRENSNING = 60;

const FritekstvedleggSkjema = ({
  felt,
  index,
  resetFritekstvedlegg,
  leggTilFritekstvedlegg,
  width,
}: FritekstvedleggSkjemaProps) => {
  const cls = bem("fritekstvedleggSkjema");
  const placeholder = `Skriv inn tittel, maks ${TEGNBEGRENSNING} tegn`;

  return (
    <Nav.Row className={cls.block}>
      <Nav.Typo.Element className={cls.element("heading")}>Fritekstvedlegg</Nav.Typo.Element>
      <Nav.Typo.Undertekst>Dokumentet journalføres og legges til som et vedlegg til brevet</Nav.Typo.Undertekst>
      <Nav.Panel className={cls.element("skjema")}>
        <Nav.Row>
          <Nav.Column xs={width}>
            <Skjema.Input
              feltNavn={`felt.${felt.kode}_TITTEL.feltVerdi`}
              label="Tittel"
              normalize={begrensAntallTegn(TEGNBEGRENSNING)}
              placeholder={placeholder}
            />
          </Nav.Column>
        </Nav.Row>
        <Skjema.HTMLEditor feltNavn={`felt.${felt.kode}_FRITEKST.feltVerdi`} key={index} />
        <Nav.Row>
          <Nav.Hovedknapp mini onClick={leggTilFritekstvedlegg}>
            Lagre fritekstvedlegg
          </Nav.Hovedknapp>
          <Nav.Knapp mini onClick={resetFritekstvedlegg}>
            Avbryt
          </Nav.Knapp>
        </Nav.Row>
      </Nav.Panel>
    </Nav.Row>
  );
};

export default FritekstvedleggSkjema;
