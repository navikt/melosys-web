import { useEffect, useState } from "react";

import * as Nav from "../../../../navFrontend";
import * as Api from "../../../../services/api";
import { unwrapMelding } from "../../../skjema/utils";
import { useSendBrevValidering, useSendBrevVerdier } from "../sendBrevValidering";
import "./brevMottaker.less";

interface BrevMottakerNorskMyndighetProps {
  changeField: (felt: string, data: string[] | undefined) => void;
}

function BrevMottakerNorskMyndighet({ changeField }: BrevMottakerNorskMyndighetProps) {
  const formValues = useSendBrevVerdier();
  const { feil: syncErrors, visFeil } = useSendBrevValidering();
  const [tilgjengeligeNorskeMyndigheter, setTilgjengeligeNorskeMyndigheter] =
    useState<Api.DokumenterV2.TilgjengeligeNorskeMyndigheterResDto>();
  const valgteNorskeMyndigheter = formValues?.norskeMyndigheter ?? [];

  const errorMessage = visFeil ? unwrapMelding(syncErrors?.norskeMyndigheter) : undefined;

  useEffect(() => {
    Api.DokumenterV2.hentTilgjengeligeNorskeMyndigheter().then((response) =>
      setTilgjengeligeNorskeMyndigheter(response),
    );
  }, []);

  useEffect(() => {
    if (!formValues?.norskeMyndigheter) {
      changeField("norskeMyndigheter", []);
    }
  }, [formValues?.norskeMyndigheter, changeField]);

  const handleCheckboxChange = (orgnr: string) => {
    changeField(
      "norskeMyndigheter",
      valgteNorskeMyndigheter.includes(orgnr)
        ? valgteNorskeMyndigheter.filter((item) => item !== orgnr)
        : [...valgteNorskeMyndigheter, orgnr],
    );
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
