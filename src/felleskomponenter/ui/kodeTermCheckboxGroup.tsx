import { ReactNode, useEffect, useState } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

interface KodeTermCheckboxGroupProps {
  legend?: string;
  muligeValg: KTObject[];
  defaultValg?: string[];
  onChange: (valgteKoder: string[]) => void;
  disabled?: boolean;
  error?: ReactNode;
}

// Stabil referanse, slik at useEffect under ikke resetter valgene ved hver render når defaultValg mangler
const INGEN_VALG: string[] = [];

function KodeTermCheckboxGroup({
  legend = "",
  muligeValg,
  defaultValg = INGEN_VALG,
  onChange,
  disabled = false,
  error = undefined,
}: KodeTermCheckboxGroupProps) {
  const [valgteCheckboxer, setValgteCheckboxer] = useState(
    muligeValg.map((valg) => valg.kode).filter((kode) => defaultValg.includes(kode)),
  );

  useEffect(() => {
    setValgteCheckboxer(muligeValg.map((valg) => valg.kode).filter((kode) => defaultValg.includes(kode)));
  }, [defaultValg]);

  const onChangeHandler = (nyeValgteCheckboxer: string[]) => {
    setValgteCheckboxer(nyeValgteCheckboxer);
    onChange(nyeValgteCheckboxer);
  };

  return (
    <Nav.CheckboxGroup
      legend={legend}
      value={valgteCheckboxer}
      onChange={onChangeHandler}
      readOnly={disabled}
      error={error}
    >
      {muligeValg.map((valg) => (
        <Nav.Checkbox key={valg.kode} name="annetBostedsland" value={valg.kode} id={Utils._uuid()}>
          {valg.term}
        </Nav.Checkbox>
      ))}
    </Nav.CheckboxGroup>
  );
}

export default KodeTermCheckboxGroup;
