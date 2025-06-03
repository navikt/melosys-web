/* eslint react/no-array-index-key:off */
import { Component } from "react";
import { v4 as uuid } from "uuid";
import PT from "prop-types";

import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";

import "./listevelger.css";

/** Dette er komponent for ett enkeltvalg. Dersom tillatFritekst === true, vil Nav.Input brukes
 * slik at brukeren kan redigere innholdet i feltet også ETTER at det er lagt til.
 */
function ListevelgerValgtElement({
  label,
  slettElement,
  oppdaterElement = () => {},
  tillatFritekst = false,
  disabled = false,
}) {
  const element = tillatFritekst ? (
    <Nav.TextField
      value={label}
      label=""
      className="listevelger__linje__input"
      onChange={oppdaterElement}
      onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
    />
  ) : (
    <div className="listevelger__linje__input">{label}</div>
  );

  return (
    <div className="listevelger__linje">
      <div className="listevelger__innhold">{element}</div>
      <Nav.Button variant="secondary" disabled={disabled} className="listevelger__linje__knapp" onClick={slettElement}>
        Fjern
      </Nav.Button>
    </div>
  );
}

ListevelgerValgtElement.propTypes = {
  disabled: PT.bool,
  label: PT.string.isRequired,
  slettElement: PT.func.isRequired,
  tillatFritekst: PT.bool,
  oppdaterElement: PT.func,
};

/** Komponenten lar brukeren legge til flere valg.
 * For hvert nye valg legges dette til som en FieldArray i Redux Form.
 */
class ListevelgerFlervalg extends Component {
  state = { valgteElementer: [], inputVerdi: "", feilmelding: "" };

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
    const { fields, tillatFritekst } = this.props;
    const alleValg = fields.getAll() || [];
    return !tillatFritekst && alleValg.some((valg) => valg === verdi);
  };

  leggValgTilListe = (e) => {
    e.preventDefault();
    const { inputVerdi, valgteElementer } = this.state;
    const { verdiTilKode, erAlleredeLagtTil } = this;
    const { fields, tillatFritekst, onChange, handleLagre } = this.props;

    const valg = tillatFritekst ? inputVerdi : verdiTilKode(inputVerdi);

    if (erAlleredeLagtTil(valg)) {
      this.setState({ feilmelding: "Dette valget finnes allerede i listen." });
      return false;
    }

    if (valg) {
      if (handleLagre) {
        handleLagre(valg);
      }
      fields.push(valg);
      valgteElementer.push(valg);

      this.setState({ inputVerdi: "", valgteElementer, feilmelding: null });
    } else {
      this.setState({
        feilmelding: tillatFritekst
          ? "Velg tittel på vedlegg fra listen eller skriv din egen"
          : "I dette feltet må du velge fra alternativene i nedtrekkslisten.",
      });
    }

    if (onChange) {
      onChange({ value: valgteElementer });
    }

    return true;
  };

  slettValgFraListe = (index) => {
    const { fields, onChange } = this.props;

    if (onChange) {
      onChange({ value: this.state.valgteElementer });
    }

    fields.remove(index);
  };

  oppdaterEksisterendeValg = (verdi, index) => {
    const { fields } = this.props;
    fields.remove(index);
    fields.insert(index, verdi);
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
    const { error } = this.props.meta;
    const { feilmelding } = this.state;
    const feilmeldingTekst = error || feilmelding;

    return feilmeldingTekst || null;
  };

  render() {
    const { fields, placeholder, label, muligeValg, disabled, visValgtListe } = this.props;

    const { byggValgtListe } = this;

    const alleFelter = fields.getAll() || [];
    const feil = this.byggFeilmelding();

    return (
      <div>
        {visValgtListe && byggValgtListe(alleFelter)}
        <div className="listevelger__linje">
          <Nav.TextField
            id={`listevelger-${fields.name}`}
            label={label}
            error={feil}
            placeholder={placeholder}
            onChange={this.vedEndring}
            onKeyDown={this.vedTastNed}
            value={this.state.inputVerdi}
            list={`dataliste-${fields.name}`}
            className="listevelger__linje__input"
            disabled={disabled}
          />
          <Nav.Button
            variant="secondary"
            className="listevelger__linje__knapp listevelger__linje__knapp--leggtil"
            onClick={this.leggValgTilListe}
            disabled={disabled}
          >
            Legg til
          </Nav.Button>
        </div>
        <datalist id={`dataliste-${fields.name}`}>
          {muligeValg.map((valg) => (
            <option key={uuid()} value={KV.objektTilTerm(valg)} label={KV.objektTilTerm(valg)} />
          ))}
        </datalist>
      </div>
    );
  }
}

ListevelgerFlervalg.propTypes = {
  fields: PT.object.isRequired,
  label: PT.string,
  meta: PT.object.isRequired,
  muligeValg: PT.array.isRequired,
  tillatFritekst: PT.bool.isRequired,
  placeholder: PT.string,
  onAdd: PT.func,
  onChange: PT.func,
  onDelete: PT.func,
  disabled: PT.bool.isRequired,
  visValgtListe: PT.bool,
  handleLagre: PT.func,
};

ListevelgerFlervalg.defaultProps = {
  placeholder: "",
  label: "",
  onAdd: undefined,
  onDelete: undefined,
  onChange: undefined,
  visValgtListe: true,
  handleLagre: undefined,
};

export default ListevelgerFlervalg;
