import React, { Component, Fragment } from 'react';
import PT from 'prop-types';
import classNames from 'classnames';
import { Field } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';

import './customRadioPanelGruppe.css';

/**
 * Radiopanelet tar imot en hel react-komponent via "innhold"-prop
 * som gjør at den kan vises med vanlig input-felt og med et rikere innhold
 * enn Nav-frontend RadioPanelGruppe (pr 19. april)
 */
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
      checked, disabled, innhold, footer, feltNavn, inputProps, value, onChange, notify,
    } = this.props;

    const { hasFocus } = this.state;

    const cls = classNames('customRadioPanel', {
      'customRadioPanel--checked': checked === true && !disabled,
      'customRadioPanel--focused': hasFocus === true && !disabled,
      'customRadioPanel--disabled': disabled === true,
    });
    const onChangeAndNotify = event => {
      notify(event.target.value);
      onChange(event);
    };
    return (
      <Fragment>
        <label className={cls} htmlFor={`${feltNavn}-${value}`}>
          <input
            {...inputProps}
            className="radioPanel__Input"
            type="radio"
            id={`${feltNavn}-${value}`}
            name={feltNavn}
            checked={checked}
            disabled={disabled}
            value={value}
            onFocus={() => this.toggleOutline()}
            onBlur={() => this.toggleOutline()}
            onChange={onChangeAndNotify}
          />
          <div className="radioPanel__innhold">{innhold}</div>
        </label>
        {
          checked && footer
        }
      </Fragment>
    );
  }
}

CustomRadioPanel.propTypes = {
  feltNavn: PT.string.isRequired,
  innhold: PT.node.isRequired,
  footer: PT.node.isRequired,
  checked: PT.bool,
  inputProps: PT.object,
  disabled: PT.bool,
  value: PT.oneOfType([PT.string, PT.number]).isRequired,
  onChange: PT.func.isRequired,
  notify: PT.func.isRequired,
};

CustomRadioPanel.defaultProps = {
  checked: false,
  inputProps: {},
  disabled: false,
};

const CustomRadioPanelGruppe = props => {
  const {
    radios, feltNavn, legend, input: { onChange, value: currentCheckedValue }, meta, notify,
  } = props;

  const feil = (meta.invalid) ? { feilmelding: meta.error.melding } : null;

  return (
    <Nav.SkjemaGruppe className="customRadioPanelGruppe" feil={feil}>
      <Nav.Fieldset legend={legend}>
        {radios.map(radio => (
          <CustomRadioPanel
            feltNavn={feltNavn}
            key={`${feltNavn}-${radio.value}`}
            onChange={event => onChange(event.target.value)}
            value={radio.value}
            checked={currentCheckedValue === radio.value}
            {...radio}
            notify={notify}
          />
        ))}
      </Nav.Fieldset>
    </Nav.SkjemaGruppe>
  );
};

CustomRadioPanelGruppe.propTypes = {
  radios: PT.array.isRequired,
  feltNavn: PT.string.isRequired,
  input: PT.object.isRequired,
  meta: PT.object.isRequired,
  legend: PT.string,
  notify: PT.func.isRequired,
};

CustomRadioPanelGruppe.defaultProps = {
  legend: '',
};

const CustomRadioPanelGruppeReduxForm = ({ feltNavn, ...rest }) => (<Field name={feltNavn} component={CustomRadioPanelGruppe} props={{ feltNavn, ...rest }} />);
CustomRadioPanelGruppeReduxForm.propTypes = { feltNavn: PT.string.isRequired };

export default CustomRadioPanelGruppeReduxForm;
