import React, { Component } from 'react';
import PT from 'prop-types';
import classNames from 'classnames';

import * as Nav from '../../../utils/navFrontend';

class CustomRadioPanel extends Component {
  constructor(props) {
    super(props);
    this.state = { hasFocus: false };
  }

  toggleOutline() {
    this.setState({ hasFocus: !this.state.hasFocus });
  }

  render() {
    const {
      checked, disabled, innhold, feltNavn, onChange, inputProps,
    } = this.props;

    const { hasFocus } = this.state;

    const cls = classNames('inputPanel radioPanel', {
      'inputPanel--checked': checked === true && !disabled,
      'inputPanel--focused': hasFocus === true && !disabled,
      'inputPanel--disabled': disabled === true,
    });

    return (
      <label className={cls}>
        <input
          {...inputProps}
          className="inputPanel__field"
          type="radio"
          name={feltNavn}
          checked={checked}
          disabled={disabled}
          onFocus={() => this.toggleOutline()}
          onBlur={() => this.toggleOutline()}
          onChange={event => onChange(event)}
        />
        <span className="inputPanel__label">{innhold}</span>
      </label>
    );
  }
}

CustomRadioPanel.propTypes = {
  feltNavn: PT.string.isRequired,
  onChange: PT.func.isRequired,
  checked: PT.bool,
  inputProps: PT.object,
};

CustomRadioPanel.defaultProps = {
  checked: false,
  inputProps: {},
};

const CustomRadioPanelGruppe = props => {
  const {
    radios, feltNavn, legend, feil, checked, onChange,
  } = props;

  return (
    <Nav.SkjemaGruppe className="inputPanelGruppe" feil={feil}>
      <Nav.Fieldset legend={legend}>
        {radios.map(radio => (
          <CustomRadioPanel
            feltNavn={feltNavn}
            key={`${feltNavn}-${radio.value}`}
            checked={checked === radio.value}
            onChange={event => onChange(event, radio.value)}
            {...radio}
          />
        ))}
      </Nav.Fieldset>
    </Nav.SkjemaGruppe>
  );
};

CustomRadioPanelGruppe.propTypes = {
  radios: PT.array.isRequired,
  feltNavn: PT.string.isRequired,
  onChange: PT.func.isRequired,
  legend: PT.string,
  feil: PT.object,
  checked: PT.string,
};

CustomRadioPanelGruppe.defaultProps = {
  legend: '',
  feil: undefined,
  checked: '',
};

export default CustomRadioPanelGruppe;
