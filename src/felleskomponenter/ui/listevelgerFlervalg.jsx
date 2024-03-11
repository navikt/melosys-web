/* eslint react/no-array-index-key:off */
import { Component } from "react";
import PT from "prop-types";

import * as Utils from "../../utils";
import * as KV from "../../kodeverk";
import * as Nav from "../../navFrontend";
import * as MPT from "../../proptypes";

import "./listevelgerFlervalg.css";

/** Dette er komponent for ett enkeltvalg. Dersom tillatFritekst === true, vil Nav.Input brukes
 * slik at brukeren kan redigere innholdet i feltet også ETTER at det er lagt til.
 */
const ListevelgerValgtElement = ({ label, slettElement, oppdaterElement, tillatFritekst, disabled }) => {
  const element = tillatFritekst ? (
    <Nav.Input
      disabled={disabled}
      value={label}
      label=""
      className="listevelgerFlervalg__linje__input"
      onChange={oppdaterElement}
      onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
    />
  ) : (
    <div className="listevelgerFlervalg__linje__input">{label}</div>
  );

  return (
    <div className="listevelgerFlervalg__linje">
      <div className="listevelgerFlervalg__innhold">{element}</div>
      <Nav.Knapp mini disabled={disabled} className="listevelgerFlervalg__linje__knapp" onClick={slettElement}>
        Fjern
      </Nav.Knapp>
    </div>
  );
};

ListevelgerValgtElement.propTypes = {
  disabled: PT.bool,
  label: PT.string.isRequired,
  slettElement: PT.func.isRequired,
  tillatFritekst: PT.bool,
  oppdaterElement: PT.func,
};

ListevelgerValgtElement.defaultProps = {
  oppdaterElement: () => {},
  tillatFritekst: false,
  disabled: false,
};

/** Komponenten lar brukeren legge til flere valg.
 * For hvert nye valg legges dette til som en FieldArray i Redux Form.
 */
class ListevelgerFlervalg extends Component {
  state = { valgteElementer: this.props.defaultElementer, inputVerdi: "", feilmelding: "" };

  vedEndring = (event) => {
    this.setState({ inputVerdi: event.target.value, feilmelding: "" });
  };

  vedTastNed = (event) => {
    if (event.key === "Enter") {
      this.leggValgTilListe(event);
    }
  };

  kodeTilVerdi = (kode) => {
    const { muligeValg = [] } = this.props;
    const valgtKodeverkObjekt = muligeValg.find((item) => KV.objektTilKode(item) === kode);
    return valgtKodeverkObjekt && KV.objektTilTerm(valgtKodeverkObjekt);
  };

  verdiTilKode = (verdi) => {
    const { muligeValg = [] } = this.props;
    const valgtKodeverkObjekt = muligeValg.find((item) => KV.objektTilTerm(item) === verdi);
    return valgtKodeverkObjekt && KV.objektTilKode(valgtKodeverkObjekt);
  };

  erAlleredeLagtTil = (verdi) => {
    const { tillatFritekst } = this.props;
    const { valgteElementer = [] } = this.state;
    return !tillatFritekst && valgteElementer.some((valg) => valg === verdi);
  };

  leggValgTilListe = (e) => {
    e.preventDefault();
    const { inputVerdi, valgteElementer } = this.state;
    const { verdiTilKode, erAlleredeLagtTil } = this;
    const { tillatFritekst, onChange } = this.props;

    const valg = tillatFritekst ? inputVerdi : verdiTilKode(inputVerdi);

    if (erAlleredeLagtTil(valg)) {
      this.setState({ feilmelding: "Dette valget finnes allerede i listen." });
      return false;
    }

    if (valg) {
      this.setState((prevState) => ({
        inputVerdi: "",
        valgteElementer: [...prevState.valgteElementer, valg],
        feilmelding: null,
      }));
      if (onChange) {
        onChange({ value: [...valgteElementer, valg] });
      }
    } else {
      this.setState({
        feilmelding: tillatFritekst
          ? "Velg tittel på vedlegg fra listen eller skriv din egen"
          : "I dette feltet må du velge fra alternativene i nedtrekkslisten.",
      });
    }

    return true;
  };

  slettValgFraListe = (index) => {
    const { onChange } = this.props;

    const { valgteElementer } = this.state;

    if (onChange) {
      onChange({ value: valgteElementer.filter((element, i) => i !== index) });
    }

    this.setState((prevState) => ({ valgteElementer: prevState.valgteElementer.filter((element, i) => i !== index) }));
  };

  oppdaterEksisterendeValg = (verdi, index) => {
    this.setState((prevState) => ({
      valgteElementer: prevState.valgteElementer.map((element, i) =>
        i !== index ? element : { ...element, ...verdi }
      ),
    }));
  };

  byggValgtRedigerbartElement = (verdi, index) => (
    <ListevelgerValgtElement
      key={index}
      label={verdi}
      slettElement={() => this.slettValgFraListe(index)}
      oppdaterElement={(event) => this.oppdaterEksisterendeValg(event.target.value, index)}
      tillatFritekst
      disabled={this.props.disabled}
    />
  );

  byggValgtElement = (verdi, index) => (
    <ListevelgerValgtElement
      key={index}
      label={verdi}
      slettElement={() => this.slettValgFraListe(index)}
      disabled={this.props.disabled}
    />
  );

  byggValgtListe = (eksisterendeValg) => {
    const { byggValgtElement, byggValgtRedigerbartElement } = this;

    const { tillatFritekst } = this.props;

    return eksisterendeValg.map((verdi, index) => {
      const lesbarVerdi = tillatFritekst ? verdi : this.kodeTilVerdi(verdi);
      return tillatFritekst ? byggValgtRedigerbartElement(verdi, index) : byggValgtElement(lesbarVerdi, index);
    });
  };

  byggFeilmelding = () => {
    const internFeilmelding = this.state.feilmelding;
    const eksternFeilmelding = this.props.feil;
    const feilmeldingtekst = eksternFeilmelding || internFeilmelding;

    return feilmeldingtekst || null;
  };

  render() {
    const { placeholder, label, muligeValg, disabled, data_cy } = this.props;

    const { valgteElementer } = this.state;

    const { byggValgtListe } = this;

    const feil = this.byggFeilmelding();

    const datalistID = Utils._uuid();

    return (
      <div className="listevelgerFlervalg" data-cy={data_cy}>
        {byggValgtListe(valgteElementer)}
        <div className="listevelgerFlervalg__linje">
          <Nav.Input
            id={`listevelger-${datalistID}`}
            label={label}
            feil={feil}
            placeholder={placeholder}
            onChange={this.vedEndring}
            onKeyDown={this.vedTastNed}
            value={this.state.inputVerdi}
            list={datalistID}
            className="listevelgerFlervalg__linje__input"
            disabled={disabled}
          />
          <Nav.Knapp
            mini
            className="listevelgerFlervalg__linje__knapp listevelgerFlervalg__linje__knapp--leggtil"
            onClick={this.leggValgTilListe}
            disabled={disabled}
          >
            Legg til
          </Nav.Knapp>
        </div>
        <datalist id={datalistID}>
          {muligeValg.map((valg) => (
            <option key={Utils._uuid()} value={KV.objektTilTerm(valg)} label={KV.objektTilTerm(valg)} />
          ))}
        </datalist>
      </div>
    );
  }
}

ListevelgerFlervalg.propTypes = {
  className: PT.string,
  defaultElementer: PT.arrayOf(PT.string),
  disabled: PT.bool.isRequired,
  feil: PT.string,
  label: PT.string.isRequired,
  muligeValg: PT.arrayOf(MPT.Kodeverk).isRequired,
  onChange: PT.func,
  placeholder: PT.string,
  tillatFritekst: PT.bool.isRequired,
  data_cy: PT.string,
};

ListevelgerFlervalg.defaultProps = {
  className: "",
  defaultElementer: [],
  feil: undefined,
  onChange: undefined,
  placeholder: "",
  data_cy: undefined,
};

export default ListevelgerFlervalg;
