import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getFormValues } from "redux-form";
import MKV from "../../../../melosyskodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

interface AvsenderVelgerForVirksomhetProps {
  tomAvsender: () => void;
  kopierVirksomhetTilAvsender: () => void;
  mottaksKanalErElektronisk: boolean;
}

export function AvsenderVelgerForVirksomhet({
  tomAvsender,
  kopierVirksomhetTilAvsender,
  mottaksKanalErElektronisk,
}: AvsenderVelgerForVirksomhetProps) {
  const formValues = useSelector((state) => getFormValues(KV.Form.JOURNALFORING)(state)) as any;

  useEffect(() => {
    if (formValues.avsenderType === MKV.Koder.avsendertyper.ORGANISASJON) {
      kopierVirksomhetTilAvsender();
    } else {
      tomAvsender();
    }
  }, [formValues.avsenderType]);

  return (
    <Skjema.RadioGroup
      legend="Hvem er avsender?"
      name="avsenderType"
      size="medium"
      readOnly={mottaksKanalErElektronisk}
    >
      <Nav.Radio value={MKV.Koder.avsendertyper.ORGANISASJON}>Virksomhet</Nav.Radio>
      <Nav.Radio value={KV.AvsenderTyper.FRITEKST}>Fritekst</Nav.Radio>
      {formValues.avsenderType === KV.AvsenderTyper.FRITEKST && <Skjema.Input label="" feltNavn="avsenderNavn" />}
    </Skjema.RadioGroup>
  );
}
