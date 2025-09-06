import { Component, useState } from "react";
import PT from "prop-types";
import classNames from "classnames";
import { Field } from "redux-form";

import * as Nav from "../../../navFrontend";
import * as SkjemaUtils from "../utils";
import * as Ikoner from "../../../resources/images";

import "./customRadioPanelGruppe.less";

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
    this.setState((prevState) => ({ hasFocus: !prevState.hasFocus }));
  }

  render() {
    const { checked, disabled, innhold, footer, feltNavn, inputProps, value } = this.props;

    return (
      <>
        <label className="customRadioPanel" htmlFor={`${feltNavn}-${value}`}>
          <Nav.Radio
            {...inputProps}
            className="radioPanel__Input"
            id={`${feltNavn}-${value}`}
            value={value}
            onFocus={() => this.toggleOutline()}
            onBlur={() => this.toggleOutline()}
            disabled={disabled}
          >
            {}
          </Nav.Radio>
          <div className="radioPanel__innhold">{innhold}</div>
        </label>
        {checked && footer}
      </>
    );
  }
}

CustomRadioPanel.propTypes = {
  feltNavn: PT.string.isRequired,
  innhold: PT.node.isRequired,
  footer: PT.node,
  inputProps: PT.object,
  disabled: PT.bool,
  value: PT.oneOfType([PT.string, PT.number]).isRequired,
  checked: PT.bool,
};

CustomRadioPanel.defaultProps = {
  checked: false,
  inputProps: {},
  disabled: false,
  footer: null,
};

function CustomRadioPanelGruppe(props) {
  const {
    radios,
    feltNavn,
    legend = "",
    input: { onChange, value: currentCheckedValue },
    meta,
    notify,
    begrensVisteRadios = false,
    className = "",
  } = props;

  const { touched, active } = meta;
  const feil = touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

  const [visAlle, setVisAlle] = useState(!begrensVisteRadios);
  const radiosSomVises = visAlle ? radios : radios.slice(0, 4);
  const alleRadiosVisesPåEnSide = radios?.length <= 4;

  const onChangeAndNotify = (value) => {
    if (notify) notify(value);
    onChange(value);
  };

  return (
    <div className={classNames("customRadioPanelGruppe", className)}>
      <Nav.RadioGroup legend={legend} onChange={onChangeAndNotify}>
        {radiosSomVises.map((radio) => (
          <CustomRadioPanel
            feltNavn={feltNavn}
            key={`${feltNavn}-${radio.value}`}
            value={radio.value}
            checked={currentCheckedValue === radio.value}
            {...radio}
          />
        ))}
      </Nav.RadioGroup>
      {begrensVisteRadios && !alleRadiosVisesPåEnSide && (
        <div className="visMerMindre">
          <button type="button" onClick={() => setVisAlle(!visAlle)}>
            {visAlle ? (
              <>
                Vis mindre
                <Ikoner.Up />
              </>
            ) : (
              <>
                Vis flere saker
                <Ikoner.Down />
              </>
            )}
          </button>
        </div>
      )}
      {feil ? <Nav.Alert variant="error">{feil}</Nav.Alert> : null}
    </div>
  );
}

CustomRadioPanelGruppe.propTypes = {
  radios: PT.array.isRequired,
  feltNavn: PT.string.isRequired,
  input: PT.object.isRequired,
  meta: PT.object.isRequired,
  legend: PT.string,
  notify: PT.func,
  begrensVisteRadios: PT.bool,
  className: PT.string,
};

function CustomRadioPanelGruppeReduxForm({ feltNavn, ...rest }) {
  return (
    <Field name={feltNavn} component={CustomRadioPanelGruppe} props={{ feltNavn, ...rest }} onChange={rest?.onChange} />
  );
}
CustomRadioPanelGruppeReduxForm.propTypes = { feltNavn: PT.string.isRequired };

export default CustomRadioPanelGruppeReduxForm;
