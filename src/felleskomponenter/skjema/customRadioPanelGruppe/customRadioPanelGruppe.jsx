import { Component, Fragment, useState } from "react";
import PT from "prop-types";
import classNames from "classnames";
import { Field } from "redux-form";

import * as Nav from "../../../navFrontend";
import * as SkjemaUtils from "../utils";
import * as Ikoner from "../../../resources/images";

import "./customRadioPanelGruppe.css";

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

    const { hasFocus } = this.state;

    const cls = classNames("customRadioPanel", {
      "customRadioPanel--checked": checked === true && !disabled,
      "customRadioPanel--focused": hasFocus === true && !disabled,
      "customRadioPanel--disabled": disabled === true,
    });

    return (
      <Fragment>
        <label className={cls} htmlFor={`${feltNavn}-${value}`}>
          <Nav.AkselRadio
            {...inputProps}
            className="radioPanel__Input"
            id={`${feltNavn}-${value}`}
            name={feltNavn}
            value={value}
            onFocus={() => this.toggleOutline()}
            onBlur={() => this.toggleOutline()}
            disabled={disabled}
          >
            {}
          </Nav.AkselRadio>
          <div className="radioPanel__innhold">{innhold}</div>
        </label>
        {checked && footer}
      </Fragment>
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
  onChange: PT.func.isRequired,
  checked: PT.bool,
};

CustomRadioPanel.defaultProps = {
  checked: false,
  inputProps: {},
  disabled: false,
  footer: null,
};

const CustomRadioPanelGruppe = (props) => {
  const {
    radios,
    feltNavn,
    legend,
    input: { onChange, value: currentCheckedValue },
    meta,
    notify,
    begrensVisteRadios,
    className,
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
    <Nav.SkjemaGruppe className={classNames("customRadioPanelGruppe", className)} feil={feil}>
      <Nav.RadioGroup legend={legend} onChange={onChangeAndNotify}>
        {radiosSomVises.map((radio) => (
          <CustomRadioPanel
            feltNavn={feltNavn}
            key={`${feltNavn}-${radio.value}`}
            onChange={onChange}
            value={radio.value}
            checked={currentCheckedValue === radio.value}
            {...radio}
            notify={notify}
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
    </Nav.SkjemaGruppe>
  );
};

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

CustomRadioPanelGruppe.defaultProps = {
  legend: "",
  notify: undefined,
  begrensVisteRadios: false,
  className: "",
};

const CustomRadioPanelGruppeReduxForm = ({ feltNavn, ...rest }) => (
  <Field name={feltNavn} component={CustomRadioPanelGruppe} props={{ feltNavn, ...rest }} onChange={rest?.onChange} />
);
CustomRadioPanelGruppeReduxForm.propTypes = { feltNavn: PT.string.isRequired };

export default CustomRadioPanelGruppeReduxForm;
