import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { change, getFormValues } from "redux-form";
import { useDispatch } from "../../../../hooks";

import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Api from "../../../../services/api";
import { SendBrevFormValues } from "../types";
import "./brevMottaker.less";

function BrevMottakerNorskMyndighet() {
  const formValues = useSelector((state: any) => getFormValues(KV.Form.SEND_BREV)(state) as SendBrevFormValues);
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

  return (
    <Nav.CheckboxGroup
      className="norskmyndighet"
      legend="Hvilke etater skal brevet sendes til?"
      defaultValue={valgteNorskeMyndigheter}
    >
      {tilgjengeligeNorskeMyndigheter?.map((norskMyndighet) => (
        <Nav.Checkbox
          key={norskMyndighet.orgnr}
          value={norskMyndighet.orgnr}
          onChange={() => handleCheckboxChange(norskMyndighet.orgnr)}
        >
          {norskMyndighet.navn}
        </Nav.Checkbox>
      ))}
    </Nav.CheckboxGroup>
  );
}

export default BrevMottakerNorskMyndighet;
