import { Fragment, useEffect } from "react";
import { ColumnWidth } from "nav-frontend-grid";

import * as Api from "../../../services/api";
import * as Nav from "../../../navFrontend";
import ValgAlternativer from "./valgAlternativer";
import BrevFelt from "./brevFelt";
import { SendBrevFormValues } from "./types";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst";

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
                <LabelMedHjelpetekst label={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} bold small />
                <ValgAlternativer
                  valg={felt.valg}
                  feltKode={felt.kode}
                  redigerbart={redigerbart}
                  changeField={changeField}
                />
              </Nav.Column>
            </Nav.Row>
          )}
          {skalViseBrevFelt(felt) && (
            <BrevFelt felt={felt} visFeltBeskrivelse={felt.valg === null} width={width} redigerbart={redigerbart} />
          )}
        </Fragment>
      ))}
    </>
  );
};

export default BrevValg;
