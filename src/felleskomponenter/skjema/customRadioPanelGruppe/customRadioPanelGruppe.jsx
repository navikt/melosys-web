import React, { Component, Fragment, useState } from "react";
import PT from "prop-types";
import classNames from "classnames";
import { Field } from "redux-form";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import * as SkjemaUtils from "../utils";
import * as Ikoner from "../../../resources/images";

import "./customRadioPanelGruppe.css";

export const CustomRadioPanelElement = ({ tittel, hoyreSideTittel, data }) => (
  <div className="customRadioPanelElement">
    <div className="customRadioPanelTittel">
      <Nav.Typo.Undertittel>{tittel}</Nav.Typo.Undertittel>
      {hoyreSideTittel && <>{hoyreSideTittel}</>}
    </div>
    <dl>
      {data.map(({ term, description }) => {
        if (!description) return null;

        return (
          <Fragment key={Utils._uuid()}>
            <dt>{term}</dt>
            <dd>{description}</dd>
          </Fragment>
        );
      })}
    </dl>
  </div>
);

CustomRadioPanelElement.propTypes = {
  tittel: PT.node,
  hoyreSideTittel: PT.node,
  data: PT.arrayOf(
    PT.shape({
      term: PT.string,
      description: PT.node,
    })
  ).isRequired,
};

CustomRadioPanelElement.defaultProps = {
  tittel: undefined,
  hoyreSideTittel: undefined,
};

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
    const { checked, disabled, innhold, footer, feltNavn, inputProps, value, onChange, notify } = this.props;

    const { hasFocus } = this.state;

    const cls = classNames("customRadioPanel", {
      "customRadioPanel--checked": checked === true && !disabled,
      "customRadioPanel--focused": hasFocus === true && !disabled,
      "customRadioPanel--disabled": disabled === true,
    });
    const onChangeAndNotify = (event) => {
      if (notify) notify(event.target.value);
      onChange(event);
    };
    return (
      <Fragment>
        <label className={cls} htmlFor={`${feltNavn}-${value}`}>
          <Nav.Radio
            {...inputProps}
            className="radioPanel__Input"
            label=""
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
        {checked && footer}
      </Fragment>
    );
  }
}

CustomRadioPanel.propTypes = {
  feltNavn: PT.string.isRequired,
  innhold: PT.node.isRequired,
  footer: PT.node,
  checked: PT.bool,
  inputProps: PT.object,
  disabled: PT.bool,
  value: PT.oneOfType([PT.string, PT.number]).isRequired,
  onChange: PT.func.isRequired,
  notify: PT.func,
};

CustomRadioPanel.defaultProps = {
  checked: false,
  inputProps: {},
  disabled: false,
  notify: undefined,
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

  return (
    <Nav.SkjemaGruppe className={classNames("customRadioPanelGruppe", className)} feil={feil}>
      <Nav.Fieldset legend={legend}>
        {radiosSomVises.map((radio) => (
          <CustomRadioPanel
            feltNavn={feltNavn}
            key={`${feltNavn}-${radio.value}`}
            onChange={(event) => onChange(event.target.value)}
            value={radio.value}
            checked={currentCheckedValue === radio.value}
            {...radio}
            notify={notify}
          />
        ))}
      </Nav.Fieldset>
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
