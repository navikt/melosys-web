import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getFormValues, getFormSyncErrors } from "redux-form";
import { RootState } from "AppTypes";

import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Api from "../../../../services/api";
import { SendBrevFormValues, SyncErrors } from "../types";
import { unwrapMelding } from "../../../skjema/utils";
import "./brevMottaker.less";

interface BrevMottakerNorskMyndighetProps {
  changeField: (felt: string, data: string[] | undefined) => void;
}

function BrevMottakerNorskMyndighet({ changeField }: BrevMottakerNorskMyndighetProps) {
  const formValues = useSelector((state: RootState) => getFormValues(KV.Form.SEND_BREV)(state) as SendBrevFormValues);
  const syncErrors = useSelector((state: RootState) => getFormSyncErrors(KV.Form.SEND_BREV)(state)) as SyncErrors;
  const [tilgjengeligeNorskeMyndigheter, setTilgjengeligeNorskeMyndigheter] =
    useState<Api.DokumenterV2.TilgjengeligeNorskeMyndigheterResDto>();
  const [valgteNorskeMyndigheter, setValgteNorskeMyndigheter] = useState<string[]>(formValues?.norskeMyndigheter || []);

  const norskeMyndighetError = syncErrors?.norskeMyndigheter;
  const skalViseFeil = Boolean(formValues?.showFieldErrors) && Boolean(norskeMyndighetError);
  const errorMessage = skalViseFeil ? unwrapMelding(norskeMyndighetError) : undefined;

  useEffect(() => {
    Api.DokumenterV2.hentTilgjengeligeNorskeMyndigheter().then((response) =>
      setTilgjengeligeNorskeMyndigheter(response),
    );
  }, []);

  // Sync local state with form when external changes happen
  useEffect(() => {
    if (formValues?.norskeMyndigheter !== valgteNorskeMyndigheter) {
      setValgteNorskeMyndigheter(formValues?.norskeMyndigheter || []);
    }
  }, [formValues?.norskeMyndigheter]);

  useEffect(() => {
    changeField("norskeMyndigheter", valgteNorskeMyndigheter);
  }, [valgteNorskeMyndigheter, changeField]);

  const handleCheckboxChange = (orgnr: string) => {
    if (valgteNorskeMyndigheter.includes(orgnr)) {
      setValgteNorskeMyndigheter(valgteNorskeMyndigheter.filter((item) => item !== orgnr));
    } else {
      setValgteNorskeMyndigheter([...valgteNorskeMyndigheter, orgnr]);
    }
  };

  return (
    <Nav.CheckboxGroup
      className="norskmyndighet"
      legend="Hvilke etater skal brevet sendes til?"
      name="norskeMyndigheter"
      error={errorMessage}
    >
      {tilgjengeligeNorskeMyndigheter?.map((norskMyndighet) => (
        <Nav.Checkbox
          key={norskMyndighet.orgnr}
          value={norskMyndighet.orgnr}
          checked={valgteNorskeMyndigheter.includes(norskMyndighet.orgnr)}
          onChange={() => handleCheckboxChange(norskMyndighet.orgnr)}
        >
          {norskMyndighet.navn}
        </Nav.Checkbox>
      ))}
    </Nav.CheckboxGroup>
  );
}

export default BrevMottakerNorskMyndighet;
