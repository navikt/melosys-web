import { Fragment } from "react";
import { ColumnWidth } from "nav-frontend-grid";

import * as Api from "../../../services/api";
import * as Nav from "../../../navFrontend";
import ValgAlternativer from "./valgAlternativer";
import BrevFelt from "./brevFelt";
import { SendBrevFormValues } from "./types";

interface BrevValgProps {
  formValues: SendBrevFormValues;
  formErrors: Record<string, any>;
  width: ColumnWidth;
  redigerbart: boolean;
  changeField: (felt: string, data: any) => void;
  finnValgAlternativ: (felt: Api.DokumenterV2.Felt) => Api.DokumenterV2.ValgAlternativ | undefined;
  visFeil?: boolean;
}

function BrevValg({
  formValues,
  formErrors,
  width,
  redigerbart,
  changeField,
  finnValgAlternativ,
  visFeil,
}: BrevValgProps) {
  const skalViseBrevFelt = (felt: Api.DokumenterV2.Felt) => felt.valg === null || finnValgAlternativ(felt)?.visFelt;
  const erstattFritekstValgMedBrevFelt = (felt: Api.DokumenterV2.Felt) =>
    felt.valg!.valgAlternativer.length === 1 &&
    felt.valg!.valgAlternativer[0].kode === "FRITEKST" &&
    felt.valg!.valgType !== "CHECKBOX";
  return (
    <div>
      {formValues.valgtBrev?.felter?.map((felt) => (
        <Fragment key={felt.kode}>
          {felt.valg &&
            (erstattFritekstValgMedBrevFelt(felt) ? (
              <BrevFelt
                felt={felt}
                visFeltBeskrivelse
                width={width}
                redigerbart={redigerbart}
                formErrors={formErrors}
                formValues={formValues}
                visFeil={visFeil}
              />
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
                    formErrors={formErrors}
                    formValues={formValues}
                    visFeil={visFeil}
                  />
                </Nav.Column>
              </Nav.Row>
            ))}

          {skalViseBrevFelt(felt) && (
            <BrevFelt
              felt={felt}
              visFeltBeskrivelse={felt.valg === null}
              width={width}
              redigerbart={redigerbart}
              formErrors={formErrors}
              formValues={formValues}
              visFeil={visFeil}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

export default BrevValg;
