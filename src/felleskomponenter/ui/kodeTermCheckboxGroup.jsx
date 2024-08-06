import { useEffect, useState } from "react";
import PT from "prop-types";

import * as Nav from "../../navFrontend";
import * as MPT from "../../proptypes";
import * as Utils from "../../utils";

const KodeTermCheckboxGroup = ({ legend, muligeValg, defaultValg, onChange, disabled }) => {
  const [valgteCheckboxer, setValgteCheckboxer] = useState(
    muligeValg.map((valg) => valg.kode).filter((kode) => defaultValg.includes(kode))
  );

  useEffect(() => {
    setValgteCheckboxer(muligeValg.map((valg) => valg.kode).filter((kode) => defaultValg.includes(kode)));
  }, [defaultValg]);

  const onChangeHandler = (kode) => {
    const nyeValgteCheckboxer = valgteCheckboxer.includes(kode)
      ? valgteCheckboxer.filter((checkbox) => checkbox !== kode)
      : [...valgteCheckboxer, kode];

    setValgteCheckboxer(nyeValgteCheckboxer);
    onChange(nyeValgteCheckboxer);
  };

  return (
    <Nav.CheckboxGroup legend={legend} defaultValue={valgteCheckboxer} readOnly={disabled}>
      {muligeValg.map((valg) => (
        <Nav.Checkbox
          key={valg.kode}
          name="annetBostedsland"
          value={valg.kode}
          onClick={() => onChangeHandler(valg.kode)}
          id={Utils._uuid()}
        >
          {valg.term}
        </Nav.Checkbox>
      ))}
    </Nav.CheckboxGroup>
  );
};

KodeTermCheckboxGroup.propTypes = {
  legend: PT.string,
  muligeValg: PT.arrayOf(MPT.Kodeverk).isRequired,
  disabled: PT.bool,
  onChange: PT.func.isRequired,
  defaultValg: PT.arrayOf(PT.string),
  size: PT.string,
};

KodeTermCheckboxGroup.defaultProps = {
  legend: "",
  disabled: false,
  defaultValg: [],
};

export default KodeTermCheckboxGroup;
