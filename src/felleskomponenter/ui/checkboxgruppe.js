import React, { useState } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';
import * as Mui from '.';

const Checkboxgruppe = ({
  legend,
  muligeValg,
  defaultValg,
  onChange,
  disabled,
}) => {
  const [valgteCheckboxer, setValgteCheckboxer] = useState(muligeValg.map(valg => valg.kode).filter(kode => defaultValg.includes(kode)));

  const onChangeHandler = ({ value }) => {
    const verdi = value;

    const nyeValgteCheckboxer = valgteCheckboxer.includes(verdi) ? valgteCheckboxer.filter(checkbox => checkbox !== verdi) : [...valgteCheckboxer, verdi];

    setValgteCheckboxer(nyeValgteCheckboxer);
    onChange(nyeValgteCheckboxer);
  };

  return (
    <Nav.Fieldset legend={legend}>
      {
        muligeValg.map(valg => <Mui.Checkbox
          key={valg.kode}
          name="annetBostedsland"
          label={valg.term}
          value={valg.kode}
          checked={valgteCheckboxer.includes(valg.kode)}
          disabled={disabled}
          onCheck={onChangeHandler}
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
