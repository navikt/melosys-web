import React, { Component } from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';
import * as Nav from '../../utils/navFrontend';

import './medfolgendeBarn.css';

const uuid = require('uuid/v4');

const BarnEnkelt = ({
  barnEnkelt, indeks, onChange, checked,
}) => (
  <dl className="barnEnkelt">
    <dd>{barnEnkelt.sammensattNavn}</dd>
    <dd>
      <Nav.Checkbox
        navn={`medfolgendeBarn${indeks}`}
        label="Skal være med søker"
        onChange={onChange}
        checked={checked}
        checkboxRef={null}
      />
    </dd>
  </dl>
);

BarnEnkelt.propTypes = {
  barnEnkelt: PT.object.isRequired,
  indeks: PT.number.isRequired,
  onChange: PT.func.isRequired,
  checked: PT.bool.isRequired,
};

class BarnListe extends Component {
  onBarnChange = (event, fnr) => {
    const { checked } = event.target;
    const { fields } = this.props;
    const allFields = fields.getAll() || [];

    if (checked) {
      fields.push(fnr);
    } else {
      fields.remove(allFields.findIndex(element => element === fnr));
    }
  }

  render() {
    const { barnAlle, fields } = this.props;
    const { onBarnChange } = this;
    const allFields = fields.getAll() || [];

    return (
      <div className="barnListe">
        {barnAlle.map((barnEnkelt, indeks) => (
          <BarnEnkelt
            key={uuid()}
            barnEnkelt={barnEnkelt}
            indeks={indeks}
            onChange={event => onBarnChange(event, barnEnkelt.fnr)}
            checked={allFields.includes(barnEnkelt.fnr)}
          />))
        }
      </div>);
  }
}

BarnListe.propTypes = {
  fields: PT.object.isRequired,
  barnAlle: PT.array,
};

BarnListe.defaultProps = {
  barnAlle: [],
};

const MedfolgendeBarn = props => (
  <Nav.Fieldset legend="Barn" className="barn">
    <FieldArray
      name="medfolgendeBarn"
      component={BarnListe}
      props={props}
    />
  </Nav.Fieldset>
);

export default MedfolgendeBarn;
