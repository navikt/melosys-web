import React, { ChangeEvent, ReactNode } from "react";
import { connect, ConnectedProps } from "react-redux";
import { formValueSelector } from "redux-form";
import { RootState } from "AppTypes";

import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import { FellesInputFnrDnrOrgnrSaksnr } from "../../../../felleskomponenter/skjema/input/fellesInputFnrDnrOrgnrSaksnr";

const journalforingFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.JOURNALFORING);

const mapStateToProps = (state: RootState) => ({
  avsenderNavn: journalforingFormValueSelector(state, "avsenderNavn"),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type AvsenderArbeidsgiverProps = PropsFromRedux & {
  settFeltInnhold: (felt: string, innhold: string | null) => void;
  hentOgVisRepresentant: (ident: string) => void;
  children?: ReactNode;
};

export const AvsenderArbeidsgiver = ({
  settFeltInnhold,
  hentOgVisRepresentant,
  children,
  avsenderNavn,
}: AvsenderArbeidsgiverProps) => {
  const IDFeltTastOppHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    const { value } = event.target;
    if (Utils.organisasjon.erOrgnrGyldig(value)) {
      hentOgVisRepresentant(value);
    } else {
      settFeltInnhold("representantNavn", null);
    }
  };

  return (
    <div className="avsender">
      <FellesInputFnrDnrOrgnrSaksnr
        feltNavn="avsenderID"
        label="Oppgi avsenders org.nr"
        startTom
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
