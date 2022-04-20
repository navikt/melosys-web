import React, { ChangeEvent, ReactNode, useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { formValueSelector } from "redux-form";
import { RootState } from "AppTypes";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Konstanter from "../../../../constants";
import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";

import MKV from "../../../../melosyskodeverk";

const journalforingFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.JOURNALFORING);

const mapStateToProps = (state: RootState) => ({
  avsenderNavn: journalforingFormValueSelector(state, "avsenderNavn"),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type AvsenderArbeidsgiverProps = PropsFromRedux & {
  settFeltInnhold: (felt: string, innhold: string) => void;
  hentOgVisRepresentant: (ident: string) => void;
  avsenderID?: string;
  avsenderType: string;
  children?: ReactNode;
};

export const AvsenderArbeidsgiver = ({
  settFeltInnhold,
  hentOgVisRepresentant,
  avsenderID = "",
  avsenderType,
  children,
  avsenderNavn,
}: AvsenderArbeidsgiverProps) => {
  useEffect(() => {
    if (avsenderType === KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG) {
      settFeltInnhold("representantRepresenterer", MKV.Koder.representerer.BRUKER);
    }
    return () => {
      settFeltInnhold("representantRepresenterer", "");
    };
  }, []);

  useEffect(() => {
    if (avsenderType === KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG || avsenderType === KV.AvsenderTyper.FULLMEKTIG) {
      settFeltInnhold("representantID", avsenderID);
    }
    return () => {
      settFeltInnhold("representantID", "");
    };
  }, [avsenderID]);

  const erGyldigOrgnummer = (verdi: string) => verdi.length === Konstanter.ANTALL_TALL_I_ORGNR;

  const sjekkArbeidsgiver = async (verdi: string) => {
    if (erGyldigOrgnummer(verdi)) {
      // TODO await this.spinner('representantNavn');
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
        label="Fullmektigs org.nr. eller f.nr./d-nr."
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
