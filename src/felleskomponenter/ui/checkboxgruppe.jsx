import { useEffect, useState } from "react";
import PT from "prop-types";

import * as Nav from "../../navFrontend";
import * as MPT from "../../proptypes";
import * as Utils from "../../utils";
import Checkbox from "./checkbox";

const Checkboxgruppe = ({ legend, muligeValg, defaultValg, onChange, disabled, size }) => {
  const [valgteCheckboxer, setValgteCheckboxer] = useState(
    muligeValg.map((valg) => valg.kode).filter((kode) => defaultValg.includes(kode))
  );

  useEffect(() => {
    setValgteCheckboxer(muligeValg.map((valg) => valg.kode).filter((kode) => defaultValg.includes(kode)));
  }, [defaultValg]);

  const onChangeHandler = ({ value }) => {
    const verdi = value;

    const nyeValgteCheckboxer = valgteCheckboxer.includes(verdi)
      ? valgteCheckboxer.filter((checkbox) => checkbox !== verdi)
      : [...valgteCheckboxer, verdi];

    setValgteCheckboxer(nyeValgteCheckboxer);
    onChange(nyeValgteCheckboxer);
  };

  return (
    <Nav.CheckboxGroup legend={legend} defaultValue={valgteCheckboxer} size={size}>
      {muligeValg.map((valg) => (
        <Checkbox
          key={valg.kode}
          name="annetBostedsland"
          label={valg.term}
          value={valg.kode}
          disabled={disabled}
          onCheck={onChangeHandler}
          id={Utils._uuid()}
        />
      ))}
    </Nav.CheckboxGroup>
  );
};

Checkboxgruppe.propTypes = {
  legend: PT.string,
  muligeValg: PT.arrayOf(MPT.Kodeverk).isRequired,
  disabled: PT.bool,
  onChange: PT.func.isRequired,
  defaultValg: PT.arrayOf(PT.string),
  size: PT.string,
};

Checkboxgruppe.defaultProps = {
  legend: "",
  disabled: false,
  defaultValg: [],
  size: "medium",
};

export default Checkboxgruppe;
