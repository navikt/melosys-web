import React from "react";
import * as Nav from "../../navFrontend";
import * as Mui from "../../felleskomponenter/ui";
import * as Ikoner from "../../resources/images";
import * as Utils from "../../utils";
import { FellesInputFnrDnrOrgnrSaksnr } from "../../felleskomponenter/skjema/input/fellesInputFnrDnrOrgnrSaksnr";

interface IdentOgNavnProps {
  tittel: string;
  feltNavn: string;
  label: string;
  navn: string;
}

const IdentOgNavn = ({ tittel, feltNavn, label, navn }: IdentOgNavnProps) => (
  <>
    <Mui.Undertittel tekst={tittel} ikon={Ikoner.AccountCircle} className="undertittel" understrek />
    <div className="innrykk marginBottom">
      <FellesInputFnrDnrOrgnrSaksnr feltNavn={feltNavn} label={label} />
      {!Utils._isEmpty(navn) && (
        <span>
          <Nav.Typo.Element className="navnTittel">Navn:</Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="navn">{navn}</Nav.Typo.Normaltekst>
        </span>
      )}
    </div>
  </>
);

export default IdentOgNavn;
