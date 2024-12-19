import { Fragment } from "react";
import { ColumnWidth } from "nav-frontend-grid";

import * as Api from "../../../services/api";
import * as Nav from "../../../navFrontend";
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
          {felt.valg &&
            (felt.valg.valgAlternativer.length === 1 &&
            felt.valg.valgAlternativer[0].kode === "FRITEKST" &&
            felt.valg.valgType !== "CHECKBOX" ? (
              <BrevFelt felt={felt} visFeltBeskrivelse={true} width={width} redigerbart={redigerbart} />
            ) : (
              <Nav.Row>
                <Nav.Column xs={width}>
                  <ValgAlternativer
                    valg={felt.valg}
                    feltKode={felt.kode}
                    redigerbart={redigerbart}
                    changeField={changeField}
                    beskrivelse={felt.beskrivelse}
                    hjelpetekst={felt.hjelpetekst}
                  />
                </Nav.Column>
              </Nav.Row>
            ))}

          {skalViseBrevFelt(felt) && (
            <BrevFelt felt={felt} visFeltBeskrivelse={felt.valg === null} width={width} redigerbart={redigerbart} />
          )}
        </Fragment>
      ))}
    </>
  );
};

export default BrevValg;
