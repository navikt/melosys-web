import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getFormValues } from "redux-form";
import MKV from "../../../../melosyskodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";

type AvsenderVelgerVirksomhetProps = {
  tomAvsender: () => void;
  settFeltInnhold: (felt: string, innhold: string | null) => void;
};

export const AvsenderVelgerVirksomhet = ({ tomAvsender, settFeltInnhold }: AvsenderVelgerVirksomhetProps) => {
  const formValues = useSelector((state) => getFormValues(KV.Form.JOURNALFORING)(state)) as any;

  useEffect(() => {
    if (formValues.avsenderType === MKV.Koder.avsendertyper.ORGANISASJON) {
      settFeltInnhold("avsenderID", formValues.virksomhetOrgnr);
      settFeltInnhold("avsenderNavn", formValues.virksomhetNavn);
    } else {
      tomAvsender();
    }
  }, [formValues.avsenderType]);

  return (
    <Skjema.RadioGruppe feltNavn="avsenderType" label="Hvem er avsender?">
      <Skjema.Radio
        feltNavn="avsenderType"
        label="Virksomhet"
        value={MKV.Koder.avsendertyper.ORGANISASJON}
        className="avsendervelger__radio"
      />
      <Skjema.Radio
        feltNavn="avsenderType"
        label="Annen"
        value={KV.AvsenderTyper.ANNEN}
        className="avsendervelger__radio"
      />
      {formValues.avsenderType === KV.AvsenderTyper.ANNEN && (
        <Skjema.Input label="" feltNavn="avsenderNavn" bredde="fullbredde" />
      )}
    </Skjema.RadioGruppe>
  );
};
