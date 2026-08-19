import { Fragment } from "react";
import { ColumnWidth } from "nav-frontend-grid";

import * as Api from "../../../services/api";
import * as Nav from "../../../navFrontend";
import ValgAlternativer from "./valgAlternativer";
import BrevFelt from "./brevFelt";
import { SendBrevFormValues } from "./types";
import { Felt, ValgAlternativ } from "../../../services/modules/dokumenter-v2";
import { Betingelse, PlaceholderVerdi } from "../../../services/modules/placeholdere";

import "./brevValg.less";

interface BrevValgProps {
  formValues: SendBrevFormValues;
  width: ColumnWidth;
  redigerbart: boolean;
  changeField: (felt: string, data: any) => void;
  finnValgAlternativ: (felt: Api.DokumenterV2.Felt) => Api.DokumenterV2.ValgAlternativ | undefined;
  placeholderVerdier?: PlaceholderVerdi[];
  gyldigeNokler?: string[];
  gyldigeBetingelsesNokler?: string[];
  betingelser?: Betingelse[];
}

// For tittel-feltet for fritekstbrev ønsker vi å fjerne margin under for å unngå ekstra avstand til input-feltet (som ikke har noen label)
function erFritekstFelt(
  formValues: SendBrevFormValues,
  finnValgAlternativ: (felt: Felt) => ValgAlternativ | undefined,
): boolean {
  if (
    formValues.type === "FRITEKSTBREV" ||
    formValues.type === "GENERELT_FRITEKSTBREV_BRUKER" ||
    formValues.type === "GENERELT_FRITEKSTBREV_VIRKSOMHET" ||
    formValues.type === "GENERELT_FRITEKSTBREV_ARBEIDSGIVER"
  ) {
    const brevTittelFelt = formValues.valgtBrev?.felter?.find((felt) => felt.kode === "BREV_TITTEL");
    if (brevTittelFelt) {
      const valgtAlternativ = finnValgAlternativ(brevTittelFelt);
      return (
        valgtAlternativ?.kode !== undefined &&
        (valgtAlternativ.kode === "FRITEKST_BRUKER_OG_VIRKSOMHET" || valgtAlternativ.kode === "FRITEKST")
      );
    }
  }
  return false;
}

function BrevValg({
  formValues,
  width,
  redigerbart,
  changeField,
  finnValgAlternativ,
  placeholderVerdier,
  gyldigeNokler,
  gyldigeBetingelsesNokler,
  betingelser,
}: BrevValgProps) {
  const skalViseBrevFelt = (felt: Api.DokumenterV2.Felt) => {
    // For utenlandsk trygdemyndighet skal vi kun vise selve valget (ingen ekstra BrevFelt)
    if (felt.kode === "UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER") return false;
    return felt.valg === null || finnValgAlternativ(felt)?.visFelt;
  };

  return (
    <div>
      {formValues.valgtBrev?.felter?.map((felt) => (
        <Fragment key={felt.kode}>
          {felt.valg && (
            <Nav.Row>
              <Nav.Column xs={width}>
                <ValgAlternativer
                  className={erFritekstFelt(formValues, finnValgAlternativ) ? "overskrift-i-fritekst-brev" : undefined}
                  valg={felt.valg}
                  feltKode={felt.kode}
                  redigerbart={redigerbart}
                  changeField={changeField}
                  beskrivelse={felt.beskrivelse}
                  hjelpetekst={felt.hjelpetekst}
                />
              </Nav.Column>
            </Nav.Row>
          )}
          {skalViseBrevFelt(felt) && (
            <BrevFelt
              felt={felt}
              visFeltBeskrivelse={felt.valg === null}
              width={width}
              redigerbart={redigerbart}
              placeholderVerdier={placeholderVerdier}
              gyldigeNokler={gyldigeNokler}
              gyldigeBetingelsesNokler={gyldigeBetingelsesNokler}
              betingelser={betingelser}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

export default BrevValg;
