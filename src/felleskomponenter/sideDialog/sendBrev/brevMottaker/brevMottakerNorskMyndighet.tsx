import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { change, getFormValues } from "redux-form";

import * as KV from "../../../../kodeverk";
import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import { SendBrevFormValues } from "../types";

function BrevMottakerNorskMyndighet() {
  const formValues = useSelector((state) => getFormValues(KV.Form.SEND_BREV)(state) as SendBrevFormValues);
  const formErrors = useSelector(
    (state: { form?: { [key: string]: any } }) => state.form?.[KV.Form.SEND_BREV]?.syncErrors,
  );

  const [tilgjengeligeNorskeMyndigheter, setTilgjengeligeNorskeMyndigheter] =
    useState<Api.DokumenterV2.TilgjengeligeNorskeMyndigheterResDto>();
  const [valgteNorskeMyndigheter, setValgteNorskeMyndigheter] = useState<string[]>(formValues?.norskeMyndigheter || []);

  const dispatch = useDispatch();

  useEffect(() => {
    Api.DokumenterV2.hentTilgjengeligeNorskeMyndigheter().then((response) =>
      setTilgjengeligeNorskeMyndigheter(response),
    );
  }, []);

  useEffect(() => {
    dispatch(change(KV.Form.SEND_BREV, "norskeMyndigheter", valgteNorskeMyndigheter));
  }, [valgteNorskeMyndigheter]);

  const handleCheckboxChange = (item: string) => {
    if (valgteNorskeMyndigheter.includes(item)) {
      setValgteNorskeMyndigheter(valgteNorskeMyndigheter.filter((i) => i !== item));
    } else {
      setValgteNorskeMyndigheter([...valgteNorskeMyndigheter, item]);
    }
  };

  const skalViseFeil = formErrors?.norskeMyndigheter && formErrors.norskeMyndigheter !== undefined;
  const feilmelding = formErrors?.norskeMyndigheter
    ? Utils.feilmelding.hentEnkeltFeilmelding(formErrors.norskeMyndigheter)
    : undefined;

  return (
    <Nav.CheckboxGroup legend="Hvilke etater skal brevet sendes til?" defaultValue={valgteNorskeMyndigheter}>
      {tilgjengeligeNorskeMyndigheter?.map((norskMyndighet) => (
        <Nav.Checkbox
          key={norskMyndighet.orgnr}
          value={norskMyndighet.orgnr}
          onChange={() => handleCheckboxChange(norskMyndighet.orgnr)}
          error={!!feilmelding}
        >
          {norskMyndighet.navn}
        </Nav.Checkbox>
      ))}
      {skalViseFeil && <Nav.ErrorMessage size="small">{feilmelding}</Nav.ErrorMessage>}
    </Nav.CheckboxGroup>
  );
}

export default BrevMottakerNorskMyndighet;
