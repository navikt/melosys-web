import React, { useState } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';

const createCheckbox = (kode, term, checked, disabled = false) => ({
  label: term,
  value: kode,
  id: kode,
  checked,
  disabled,
});
// muligeValg.map(begrunnelse => createCheckbox(begrunnelse.kode, begrunnelse.term, defaultValg.includes(begrunnelse.kode)))

const Checkboxgruppe = ({
  legend,
  muligeValg,
  defaultValg,
  onChange,
  disabled,
}) => {
  const [valgteCheckboxer, setValgteCheckboxer] = useState(muligeValg.map(valg => valg.kode).filter(kode => defaultValg.includes(kode)));

  const checkboxer = muligeValg.map(begrunnelse => createCheckbox(
    begrunnelse.kode,
    begrunnelse.term,
    valgteCheckboxer.includes(begrunnelse.kode),
    disabled
  ));

  const onChangeHandler = e => {
    const verdi = e.target.id;

    let nyeValgteCheckboxer = [...valgteCheckboxer];

    if (valgteCheckboxer.includes(verdi)) {
      nyeValgteCheckboxer = valgteCheckboxer.filter(checkbox => checkbox !== verdi);
    } else {
      nyeValgteCheckboxer = [...valgteCheckboxer, verdi];
    }

    setValgteCheckboxer(nyeValgteCheckboxer);
    onChange(nyeValgteCheckboxer);
  };

  return (
    <Nav.CheckboksPanelGruppe
      checkboxes={checkboxer}
      legend={legend}
      onChange={onChangeHandler}
    />
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
