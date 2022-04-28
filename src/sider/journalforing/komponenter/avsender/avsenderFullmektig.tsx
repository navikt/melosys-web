import React, { ChangeEvent, useEffect } from "react";
import { formValueSelector } from "redux-form";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";

import MKV from "../../../../melosyskodeverk";

const journalforingFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.JOURNALFORING);

const mapStateToProps = (state: RootState) => ({
  avsenderNavn: journalforingFormValueSelector(state, "avsenderNavn"),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type AvsenderFullmektigProps = PropsFromRedux & {
  avsenderID?: string;
  settFeltInnhold: (felt: string, innhold: string) => void;
  hentOgVisRepresentant: (ident: string) => void;
};

const AvsenderFullmektig = ({
  avsenderID = "",
  settFeltInnhold,
  hentOgVisRepresentant,
  avsenderNavn,
}: AvsenderFullmektigProps) => {
  useEffect(() => {
    settFeltInnhold("representantID", avsenderID);
  }, [avsenderID]);

  const IDFeltTastOppHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    const { value } = event.target;
    if (Utils.organisasjon.erOrgnrGyldig(value)) {
      await hentOgVisRepresentant(value);
    } else if (Utils.person.erGyldigFnrEllerDnr(value.replace(" ", ""))) {
      await hentOgVisRepresentant(value.replace(" ", ""));
      await settFeltInnhold("representantRepresenterer", "Bruker");
    } else {
      await settFeltInnhold("representantNavn", "");
      await settFeltInnhold("representantRepresenterer", "");
    }
  };

  const representererMap: { [key: string]: string } = {
    [MKV.Koder.representerer.BRUKER]: "Bruker",
    [MKV.Koder.representerer.ARBEIDSGIVER]: "Arbeidsgiver",
    [MKV.Koder.representerer.BEGGE]: "Både bruker og arbeidsgiver",
  };

  return (
    <div className="avsender">
      <Skjema.Input
        feltNavn="avsenderID"
        label="Fullmektigs org.nr. eller f.nr./d-nr."
        onKeyUp={IDFeltTastOppHandler}
        className="avsender__input"
      />
      <div className="avsender__navn">
        <Nav.Typo.Element className="avsender__navn__label">Navn: </Nav.Typo.Element>
        <Nav.Typo.Normaltekst>{avsenderNavn || ""}</Nav.Typo.Normaltekst>
      </div>
      {Utils.organisasjon.erOrgnrGyldig(avsenderID) && (
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
      {Utils.person.erGyldigFnrEllerDnr(avsenderID) && (
        <Nav.Typo.Normaltekst>Fullmektig representerer bruker</Nav.Typo.Normaltekst>
      )}
    </div>
  );
};

export default connector(AvsenderFullmektig);
