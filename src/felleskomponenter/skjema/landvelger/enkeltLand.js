import React, { Component } from "react";
import PT from "prop-types";
import { Field } from "redux-form";

import * as Utils from "../../../utils";
import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";
import * as KV from "../../../kodeverk";
import * as SkjemaUtils from "../utils";

import "./landvelger.css";

export class EnkeltLand extends Component {
  state = {
    inputVerdi: "",
    error: null,
  };

  componentDidMount = () => {
    const inputVerdi = this.lagInputVerdi();
    this.setInputVerdi(inputVerdi);
  };

  componentDidUpdate(prevProps) {
    if (prevProps.input.value !== this.props.input.value) {
      const inputVerdi = this.lagInputVerdi();
      this.setInputVerdi(inputVerdi);
    }
  }

  setInputVerdi = (verdi) => {
    this.setState({ inputVerdi: verdi });
  };

  lagInputVerdi = () => {
    const { value } = this.props.input;
    const { landkoder } = this.props;
    const landkodeObjekt = value && KV.kodeTilObjekt(value, landkoder);
    const inputVerdi = landkodeObjekt ? Utils.land.landTekstFormat(landkodeObjekt) : "";
    return inputVerdi;
  };

  reduxOppdaterLand = (landkode) => {
    if (!landkode) {
      const e = new Error("landkode må inneholde verdi.");
      throw e;
    }
    const { onChange } = this.props.input;
    onChange(landkode);

    if (this.props.onChange) {
      this.props.onChange(landkode);
    }
  };

  reduxFjernLand = () => {
    const { onChange } = this.props.input;
    onChange("");

    if (this.props.onChange) {
      this.props.onChange();
    }
  };

  fokusInnHandler = (e) => {
    e.target.select();
  };

  inputTastNedHandler = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.fokusUtHandler();
    }
  };

  /** Søk etter land inkluderer landkode, dvs dersom saksbehandler skriver inn hele teksten "Sverige (SE)".
   * så vil søket fortsatt returnere riktig treff, selv om den EGENTLIGE termen kun er "Sverige".
   * @param inputVerdi
   * @returns {*}
   */
  finnFlereLand = (inputVerdi) => {
    const { landkoder } = this.props;
    if (!inputVerdi) return [];
    return landkoder.filter((land) =>
      Utils.land.landTekstFormat(land).toLowerCase().includes(inputVerdi.toLowerCase())
    );
  };

  finnEttLand = (inputVerdi) => {
    const landListe = this.finnFlereLand(inputVerdi);
    return landListe.length === 1 ? landListe[0] : false;
  };

  oppdaterLandReduxOgKomponentState = (landkodeObjekt) => {
    this.reduxOppdaterLand(landkodeObjekt.kode);
    this.setState({ inputVerdi: Utils.land.landTekstFormat(landkodeObjekt), error: null });
  };

  fokusUtHandler = () => {
    const { inputVerdi } = this.state;

    if (!inputVerdi) {
      this.reduxFjernLand();
      this.tomFeilmelding();
      return;
    }

    const landkodeObjekt = this.finnEttLand(inputVerdi);

    if (landkodeObjekt) {
      this.oppdaterLandReduxOgKomponentState(landkodeObjekt);
    } else {
      this.setState({ error: "Finner ikke landet du har skrevet inn." });
    }
  };

  inputEndringHandler = (e) => {
    const inputVerdi = e.target.value;
    this.setState({ inputVerdi });

    const landkodeObjekt = this.finnEttLand(inputVerdi);

    if (inputVerdi === Utils.land.landTekstFormat(landkodeObjekt)) {
      this.oppdaterLandReduxOgKomponentState(landkodeObjekt);
    }
  };

  tomFeilmelding = () => {
    this.setState({ error: null });
  };

  render() {
    const { fokusInnHandler, fokusUtHandler, inputTastNedHandler, inputEndringHandler } = this;

    const { label, meta, dataListID, disabled, bredde, placeholder } = this.props;

    const { inputVerdi } = this.state;

    const { touched, active } = meta;

    const skjemaError = touched && !active ? SkjemaUtils.mapReduxFormFeilTilNavFeil(meta) : undefined;

    const { error: internError = "" } = this.state;
    const feilObjekt =
      skjemaError || internError
        ? { feilmelding: `${(skjemaError && skjemaError.feilmelding) || ""} ${internError || ""}` }
        : null;

    return (
      <div>
        <Nav.Input
          disabled={disabled}
          list={dataListID}
          label={label}
          bredde={bredde}
          feil={feilObjekt}
          className="landliste__linje__input"
          value={inputVerdi}
          onBlur={fokusUtHandler}
          onFocus={fokusInnHandler}
          onChange={inputEndringHandler}
          onKeyDown={inputTastNedHandler}
          placeholder={placeholder}
        />
      </div>
    );
  }
}

EnkeltLand.propTypes = {
  dataListID: PT.string.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  meta: PT.object.isRequired,
  label: PT.node,
  feil: PT.string,
  input: PT.object.isRequired,
  disabled: PT.bool,
  bredde: PT.string,
  onChange: PT.func,
  placeholder: PT.string,
};

EnkeltLand.defaultProps = {
  label: "",
  feil: "",
  disabled: false,
  bredde: "XL",
  onChange: null,
  placeholder: undefined,
};

const EnkeltLandWrapper = (props) => <Field name={props.feltNavn} component={EnkeltLand} props={props} />;

EnkeltLandWrapper.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default EnkeltLandWrapper;
