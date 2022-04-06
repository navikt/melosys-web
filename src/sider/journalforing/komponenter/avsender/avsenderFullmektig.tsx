import React from "react";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";

import MKV from "../../../../melosyskodeverk";
import { AvsenderOrganisasjon } from "./index";

type AvsenderFullmektigProps = {
  avsenderID?: string;
  settFeltInnhold: () => void;
  hentOgVisRepresentant: () => void;
};

const AvsenderFullmektig = ({ avsenderID = "", settFeltInnhold, hentOgVisRepresentant }: AvsenderFullmektigProps) => {
  const representererMap: { [key: string]: string } = {
    [MKV.Koder.representerer.ARBEIDSGIVER]: "Arbeidsgiver",
    [MKV.Koder.representerer.BRUKER]: "Arbeidstaker",
    [MKV.Koder.representerer.BEGGE]: "Både arbeidsgiver og arbeidstaker",
  };

  const erOrgnr = Utils.organisasjon.erOrgnrGyldig(avsenderID);
  const erFnrEllerDnr = Utils.person.erGyldigFnrEllerDnr(avsenderID);

  return (
    <AvsenderOrganisasjon
      avsenderID={avsenderID}
      avsenderType={KV.AvsenderTyper.FULLMEKTIG}
      settFeltInnhold={settFeltInnhold}
      hentOgVisRepresentant={hentOgVisRepresentant}
    >
      {erOrgnr && (
        <Skjema.Select
          feltNavn="representantRepresenterer"
          label="Hvem er dette fullmektig for"
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
    </AvsenderOrganisasjon>
  );
};

export default AvsenderFullmektig;
