import { useEffect, useState } from "react";
import PT from "prop-types";

import * as Nav from "../../navFrontend";
import * as MPT from "../../proptypes";
import * as Utils from "../../utils";

// Stabil referanse, slik at useEffect under ikke resetter valgene ved hver render når defaultValg mangler
const INGEN_VALG = [];

function KodeTermCheckboxGroup({
  legend = "",
  muligeValg,
  defaultValg = INGEN_VALG,
  onChange,
  disabled = false,
  error = undefined,
}) {
  const [valgteCheckboxer, setValgteCheckboxer] = useState(
    muligeValg.map((valg) => valg.kode).filter((kode) => defaultValg.includes(kode)),
  );

  useEffect(() => {
    setValgteCheckboxer(muligeValg.map((valg) => valg.kode).filter((kode) => defaultValg.includes(kode)));
  }, [defaultValg]);

  const onChangeHandler = (nyeValgteCheckboxer) => {
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

KodeTermCheckboxGroup.propTypes = {
  legend: PT.string,
  muligeValg: PT.arrayOf(MPT.Kodeverk).isRequired,
  disabled: PT.bool,
  onChange: PT.func.isRequired,
  defaultValg: PT.arrayOf(PT.string),
  error: PT.node,
};

export default KodeTermCheckboxGroup;
