import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { change, getFormValues } from "redux-form";

import * as KV from "../../../../kodeverk";
import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";
import { SendBrevFormValues } from "../types";

const BrevMottakerNorskMyndighet = () => {
  const formValues = useSelector((state) => getFormValues(KV.Form.SEND_BREV)(state) as SendBrevFormValues);
  const [tilgjengeligeNorskeMyndigheter, setTilgjengeligeNorskeMyndigheter] =
    useState<Api.DokumenterV2.TilgjengeligeNorskeMyndigheterResDto>();
  const [valgteNorskeMyndigheter, setValgteNorskeMyndigheter] = useState<string[]>(formValues?.norskeMyndigheter || []);

  const dispatch = useDispatch();

  useEffect(() => {
    Api.DokumenterV2.hentTilgjengeligeNorskeMyndigheter().then((response) =>
      setTilgjengeligeNorskeMyndigheter(response)
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
    <>
      <Nav.Typo.Element className="brevmottaker__norskeMyndigheter">
        Hvilke etater skal brevet sendes til?
      </Nav.Typo.Element>
      <Nav.Row>
        <Nav.Column xs="12">
          {tilgjengeligeNorskeMyndigheter?.map((norskMyndighet) => (
            <Nav.AkselCheckbox
              key={norskMyndighet.orgnr}
              checked={valgteNorskeMyndigheter.includes(norskMyndighet.orgnr)}
              onChange={() => handleCheckboxChange(norskMyndighet.orgnr)}
            >
              {norskMyndighet.navn}
            </Nav.AkselCheckbox>
          ))}
        </Nav.Column>
      </Nav.Row>
    </>
  );
};

export default BrevMottakerNorskMyndighet;
