import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getFormValues } from "redux-form";
import MKV from "../../../../melosyskodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

type AvsenderVelgerForVirksomhetProps = {
  tomAvsender: () => void;
  kopierVirksomhetTilAvsender: () => void;
};

export const AvsenderVelgerForVirksomhet = ({
  tomAvsender,
  kopierVirksomhetTilAvsender,
}: AvsenderVelgerForVirksomhetProps) => {
  const formValues = useSelector((state) => getFormValues(KV.Form.JOURNALFORING)(state)) as any;

  useEffect(() => {
    if (formValues.avsenderType === MKV.Koder.avsendertyper.ORGANISASJON) {
      kopierVirksomhetTilAvsender();
    } else {
      tomAvsender();
    }
  }, [formValues.avsenderType]);

  return (
    <Nav.RadioGroup legend="Hvem er avsender?">
      <Skjema.Radio feltNavn="avsenderType" label="Virksomhet" value={MKV.Koder.avsendertyper.ORGANISASJON} />
      <Skjema.Radio feltNavn="avsenderType" label="Fritekst" value={KV.AvsenderTyper.FRITEKST} />
      {formValues.avsenderType === KV.AvsenderTyper.FRITEKST && <Skjema.Input label="" feltNavn="avsenderNavn" />}
    </Nav.RadioGroup>
  );
};
