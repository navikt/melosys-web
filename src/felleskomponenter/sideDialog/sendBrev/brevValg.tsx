import React, { Fragment } from "react";
import { ColumnWidth } from "nav-frontend-grid";

import * as Api from "../../../services/api";
import * as Nav from "../../../navFrontend";

import FeltBeskrivelse from "./feltBeskrivelse";
import ValgAlternativer from "./valgAlternativer";
import BrevFelt from "./brevFelt";
import { SendBrevFormValues } from "./types";

interface BrevValgProps {
  formValues: SendBrevFormValues;
  width: ColumnWidth;
  redigerbart: boolean;
  changeField: (felt: string, data: any) => void;
  finnValgAlternativ: (felt: Api.DokumenterV2.Felt) => Api.DokumenterV2.ValgAlternativ | undefined;
}

const BrevValg = ({ formValues, width, redigerbart, changeField, finnValgAlternativ }: BrevValgProps) => {
  const skalViseBrevFelt = (felt: Api.DokumenterV2.Felt) => felt.valg === null || finnValgAlternativ(felt)?.visFelt;

  return (
    <>
      {formValues.valgtBrev?.felter?.map((felt) => (
        <Fragment key={felt.kode}>
          {felt.valg && (
            <Nav.Row>
              <Nav.Column xs={width}>
                <FeltBeskrivelse beskrivelse={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} />
                <ValgAlternativer
                  valg={felt.valg}
                  feltKode={felt.kode}
                  redigerbart={redigerbart}
                  changeField={changeField}
                />
              </Nav.Column>
            </Nav.Row>
          )}
          {skalViseBrevFelt(felt) && <BrevFelt felt={felt} visFeltBeskrivelse={felt.valg === null} width={width} />}
        </Fragment>
      ))}
    </>
  );
};

export default BrevValg;
