import React from "react";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";

import MKV from "../../../../melosyskodeverk";
import { AvsenderArbeidsgiver } from "./index";

type AvsenderFullmektigProps = {
  avsenderID?: string;
  settFeltInnhold: (felt: string, innhold: string) => void;
  hentOgVisRepresentant: (ident: string) => void;
};

const AvsenderFullmektig = ({ avsenderID = "", settFeltInnhold, hentOgVisRepresentant }: AvsenderFullmektigProps) => {
  const representererMap: { [key: string]: string } = {
    [MKV.Koder.representerer.BRUKER]: "Bruker",
    [MKV.Koder.representerer.ARBEIDSGIVER]: "Arbeidsgiver",
    [MKV.Koder.representerer.BEGGE]: "Både bruker og arbeidsgiver",
  };

  const erOrgnr = Utils.organisasjon.erOrgnrGyldig(avsenderID);
  const erFnrEllerDnr = Utils.person.erGyldigFnrEllerDnr(avsenderID);

  return (
    <AvsenderArbeidsgiver
      avsenderID={avsenderID}
      avsenderType={KV.AvsenderTyper.FULLMEKTIG}
      settFeltInnhold={settFeltInnhold}
      hentOgVisRepresentant={hentOgVisRepresentant}
    >
      {erOrgnr && (
        <Skjema.Select
          feltNavn="representantRepresenterer"
          label="Hvem representerer fullmektig?"
          className="avsender__input"
        >
          {MKV.KTObjects.representerer.map((representerer: KTObject) => (
            <option key={representerer.kode} value={representerer.kode}>
              {representererMap[representerer.kode]}
            </option>
          ))}
        </Skjema.Select>
      )}
      {erFnrEllerDnr && <Nav.Typo.Normaltekst>Fullmektig representerer bruker</Nav.Typo.Normaltekst>}
    </AvsenderArbeidsgiver>
  );
};

export default AvsenderFullmektig;
