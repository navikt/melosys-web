import React, { ChangeEvent, ReactNode } from "react";
import { connect, ConnectedProps } from "react-redux";
import { formValueSelector } from "redux-form";
import { RootState } from "AppTypes";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";

const journalforingFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.JOURNALFORING);

const mapStateToProps = (state: RootState) => ({
  avsenderNavn: journalforingFormValueSelector(state, "avsenderNavn"),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type AvsenderArbeidsgiverProps = PropsFromRedux & {
  settFeltInnhold: (felt: string, innhold: string) => void;
  hentOgVisRepresentant: (ident: string) => void;
  children?: ReactNode;
};

export const AvsenderArbeidsgiver = ({
  settFeltInnhold,
  hentOgVisRepresentant,
  children,
  avsenderNavn,
}: AvsenderArbeidsgiverProps) => {
  const sjekkArbeidsgiver = async (verdi: string) => {
    if (Utils.organisasjon.erOrgnrGyldig(verdi)) {
      await hentOgVisRepresentant(verdi);
    } else {
      await settFeltInnhold("representantNavn", "");
    }
  };

  const IDFeltTastOppHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    const { id: opprinneligFeltID, value } = event.target;
    if (opprinneligFeltID === "representantID") {
      await sjekkArbeidsgiver(value);
    }
  };

  return (
    <div className="avsender">
      <Skjema.Input
        feltNavn="avsenderID"
        label="Oppgi avsenders org.nr"
        onKeyUp={IDFeltTastOppHandler}
        className="avsender__input"
      />
      <div className="avsender__navn">
        <Nav.Typo.Element className="avsender__navn__label">Navn: </Nav.Typo.Element>
        <Nav.Typo.Normaltekst>{avsenderNavn || ""}</Nav.Typo.Normaltekst>
      </div>
      {children}
    </div>
  );
};

export default connector(AvsenderArbeidsgiver);
