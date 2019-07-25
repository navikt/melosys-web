import React, { Component } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';
import * as Nav from '../../../../utils/navFrontend';
import * as KV from '../../../../kodeverk';

import './medfolgendeFamilie.css';

const uuid = require('uuid/v4');

const FamiliemedlemmerEnkelt = ({
  familiemedlemmerEnkelt, indeks, onChange, checked, disabled,
}) => (
  <dl className="familiemedlemmerEnkelt">
    <dd className="enkelt__navn">{familiemedlemmerEnkelt.sammensattNavn} ({familiemedlemmerEnkelt.fnr})</dd>
    <dd className="enkelt__relasjonstype">{KV.objektTilTerm(familiemedlemmerEnkelt.relasjonstype)}</dd>
    <dd className="enkelt__ermed">
      <Nav.Checkbox
        navn={`medfolgendeFamilie${indeks}`}
        label="Skal være med søker"
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        checkboxRef={null}
      />
    </dd>
  </dl>
);

FamiliemedlemmerEnkelt.propTypes = {
  familiemedlemmerEnkelt: PT.object.isRequired,
  indeks: PT.number.isRequired,
  onChange: PT.func.isRequired,
  checked: PT.bool.isRequired,
  disabled: PT.bool.isRequired,
};

class FamiliemedlemmerListe extends Component {
  onBarnChange = (event, fnr) => {
    const { checked } = event.target;
    const { fields } = this.props;
    const allFields = fields.getAll() || [];

    if (checked) {
      fields.push(fnr);
    } else {
      fields.remove(allFields.findIndex(element => element === fnr));
    }
  };

  render() {
    const { disabled, medfolgendeFamilie, fields } = this.props;
    if (!medfolgendeFamilie) return null;
    const { onBarnChange } = this;
    const allFields = fields.getAll() || [];

    return (
      <div className="familiemedlemmerListe">
        {medfolgendeFamilie.map((familiemedlemmerEnkelt, indeks) => (
          <FamiliemedlemmerEnkelt
            key={uuid()}
            familiemedlemmerEnkelt={familiemedlemmerEnkelt}
            indeks={indeks}
            onChange={event => onBarnChange(event, familiemedlemmerEnkelt.fnr)}
            checked={allFields.includes(familiemedlemmerEnkelt.fnr)}
            disabled={disabled}
          />))
        }
      </div>);
  }
}

FamiliemedlemmerListe.propTypes = {
  disabled: PT.bool.isRequired,
  fields: PT.object.isRequired,
  medfolgendeFamilie: PT.array,
};

FamiliemedlemmerListe.defaultProps = {
  medfolgendeFamilie: [],
};

const Familiemedlemmer = props => (
  <Nav.Fieldset legend="Familiemedlemmer:" className="familiemedlemmer">
    <FieldArray
      name="medfolgendeFamilie"
      component={FamiliemedlemmerListe}
      props={props}
    />
  </Nav.Fieldset>
);

export default Familiemedlemmer;
