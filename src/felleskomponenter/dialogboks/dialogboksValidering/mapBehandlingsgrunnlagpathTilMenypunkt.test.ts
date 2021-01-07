import each from "jest-each";

import mapBehandlingsgrunnlagpathTilMenypunkt from "./mapBehandlingsgrunnlagpathTilMenypunkt";

import * as KV from "../../../kodeverk";

const { Arbeidssteder, ArbeidsgiverOgVirksomhet } = KV.Menypunkter;

describe("mapBehandlingsgrunnlagpathTilMenypunkt", () => {
  each([
    [
      "behandlingsgrunnlag.arbeidUtland[0].foretakNavn",
      { menypunkt: Arbeidssteder.undertitler.arbeidsstedLand, entryNr: 1, felt: "Navn" },
    ],
    [
      "behandlingsgrunnlag.arbeidUtland[0].adresse.gatenavn",
      { menypunkt: Arbeidssteder.undertitler.arbeidsstedLand, entryNr: 1, felt: "Gateadresse" },
    ],
    [
      "behandlingsgrunnlag.arbeidUtland[1].adresse.landkode",
      { menypunkt: Arbeidssteder.undertitler.arbeidsstedLand, entryNr: 2, felt: "Land" },
    ],
    [
      "behandlingsgrunnlag.maritimtArbeid[1].enhetNavn",
      {
        menypunkt: `${Arbeidssteder.undertitler.arbeidsstedOffshore}/${Arbeidssteder.undertitler.arbeidsstedSkip}`,
        entryNr: 2,
        felt: "Navn",
      },
    ],
    [
      "behandlingsgrunnlag.luftfartBaser[1].hjemmebaseNavn",
      { menypunkt: Arbeidssteder.undertitler.arbeidsstedFly, entryNr: 2, felt: "Navn på hjemmebase" },
    ],
    [
      "behandlingsgrunnlag.foretakUtland[1].navn",
      { menypunkt: ArbeidsgiverOgVirksomhet.tittel, entryNr: 2, felt: "Navn på virksomheten" },
    ],
    [
      "behandlingsgrunnlag.foretakUtland[9].adresse.landkode",
      { menypunkt: ArbeidsgiverOgVirksomhet.tittel, entryNr: 10, felt: "Land" },
    ],
  ]).it("For behandlingsgrunnlagfelt %p, returnerer resultat %p", (feltPath, forventetResultat) => {
    expect(mapBehandlingsgrunnlagpathTilMenypunkt(feltPath)).toEqual(forventetResultat);
  });
});
