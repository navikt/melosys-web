import React, { useState } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';

const Checkboxgruppe = ({
  legend,
  muligeValg,
  defaultValg,
  onChange,
  disabled,
}) => {
  const [valgteCheckboxer, setValgteCheckboxer] = useState(muligeValg.map(valg => valg.kode).filter(kode => defaultValg.includes(kode)));

  const onChangeHandler = e => {
    const verdi = e.target.value;

    const nyeValgteCheckboxer = valgteCheckboxer.includes(verdi) ? valgteCheckboxer.filter(checkbox => checkbox !== verdi) : [...valgteCheckboxer, verdi];

    setValgteCheckboxer(nyeValgteCheckboxer);
    onChange(nyeValgteCheckboxer);
  };

  return (
    <Nav.Fieldset legend={legend}>
      {
        muligeValg.map(valg => <Nav.Checkbox
          key={valg.kode}
          name="annetBostedsland"
          label={valg.term}
          value={valg.kode}
          defaultChecked={valgteCheckboxer.includes(valg.kode)}
          disabled={disabled}
          onChange={onChangeHandler}
        />)
      }
    </Nav.Fieldset>
  );
};

Checkboxgruppe.propTypes = {
  legend: PT.string,
  muligeValg: PT.arrayOf(MPT.Kodeverk).isRequired,
  disabled: PT.bool,
  onChange: PT.func.isRequired,
  defaultValg: PT.arrayOf(PT.string),
};

Checkboxgruppe.defaultProps = {
  legend: '',
  disabled: false,
  defaultValg: [],
};

export default Checkboxgruppe;
