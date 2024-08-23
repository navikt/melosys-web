import { Component } from "react";
import PT from "prop-types";
import classnames from "classnames";

import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";
import * as KV from "../../../kodeverk";
import * as Utils from "../../../utils";

import { lagDatalistID } from "./utils";

import MKV from "../../../melosyskodeverk";

import "./landvelger.css";

class EnkeltLandPure extends Component {
  state = {
    inputVerdi: "",
    error: null,
  };

  componentDidMount() {
    this.oppdaterInputVerdi();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value || prevProps.landkoder !== this.props.landkoder) {
      this.oppdaterInputVerdi();
    }
  }

  setInputVerdi = (verdi) => {
    this.setState({ inputVerdi: verdi });
  };

  oppdaterInputVerdi = () => {
    const { value } = this.props;
    const { landkoder } = this.props;
    const landkodeObjekt = value && KV.kodeTilObjekt(value, landkoder);
    const inputVerdi = landkodeObjekt ? Utils.land.landTekstFormat(landkodeObjekt) : "";
    this.setInputVerdi(inputVerdi);
  };

  oppdaterLand = (landkode) => {
    const { onChange } = this.props;
    onChange(landkode);
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

  fokusUtHandler = () => {
    const { changeOnEmptyValue } = this.props;
    const { inputVerdi } = this.state;

    if (!inputVerdi) {
      this.tomFeilmelding();
      if (changeOnEmptyValue) this.oppdaterLand(inputVerdi);
      return;
    }

    const landkodeObjekt = this.finnEttLand(inputVerdi);

    if (landkodeObjekt) {
      this.oppdaterLand(landkodeObjekt.kode);
      this.setState({ inputVerdi: Utils.land.landTekstFormat(landkodeObjekt), error: null });
    } else {
      this.setState({ error: "Finner ikke landet du har skrevet inn." });
    }
  };

  inputEndringHandler = (e) => {
    const inputVerdi = e.target.value;
    this.setState({ inputVerdi });
  };

  tomFeilmelding = () => {
    this.setState({ error: null });
  };

  render() {
    const { fokusInnHandler, fokusUtHandler, inputTastNedHandler, inputEndringHandler } = this;

    const { label, bredde, className, disabled } = this.props;

    const { inputVerdi } = this.state;
    const { error: landError = "" } = this.state;
    const feilObjekt = landError ? `${landError}` : null;

    const cl = classnames({ landliste__linje__input: true, [className]: true });

    const dataListID = lagDatalistID();

    return (
      <div>
        <Nav.TextField
          list={dataListID}
          label={label}
          bredde={bredde}
          error={feilObjekt}
          className={cl}
          value={inputVerdi}
          onBlur={fokusUtHandler}
          onFocus={fokusInnHandler}
          onChange={inputEndringHandler}
          onKeyDown={inputTastNedHandler}
          readOnly={disabled}
          id={Utils._uuid()}
        />
        <div className="landliste__dataliste">
          <datalist id={dataListID}>
            {MKV.KTObjects.landkoder.map((item) => (
              <option
                key={item.kode}
                value={Utils.land.landTekstFormat(item)}
                label={Utils.land.landTekstFormat(item)}
              />
            ))}
          </datalist>
        </div>
      </div>
    );
  }
}

EnkeltLandPure.propTypes = {
  className: PT.string,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  value: PT.string.isRequired,
  onChange: PT.func.isRequired,
  bredde: PT.string,
  label: PT.string,
  feil: PT.string,
  disabled: PT.bool,
  changeOnEmptyValue: PT.bool,
};

EnkeltLandPure.defaultProps = {
  className: "",
  label: "",
  feil: "",
  bredde: "fullbredde",
  disabled: false,
  changeOnEmptyValue: false,
};

export default EnkeltLandPure;
