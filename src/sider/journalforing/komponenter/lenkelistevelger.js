import React, { useState } from "react";
import { connect } from "react-redux";
import { change, formValueSelector } from "redux-form";
import PT from "prop-types";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Utils from "../../../utils";
import * as Ikoner from "../../../resources/images";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";
import * as KV from "../../../kodeverk";
import { formSelectors } from "../../../ducks/form";

function LenkeListeVelger(props) {
  const {
    feltNavn,
    muligeValg,
    dokumentTittel,
    undoTittel,
    updateTittel,
    settFeltInnhold,
    currentTittel,
    visSlett,
    slettTittel,
  } = props;
  const [visListevelger, setVisListevelger] = useState(false);

  const tittelEndres = () => {
    setVisListevelger(!visListevelger);
  };
  const avbryt = () => {
    settFeltInnhold(feltNavn, undoTittel);
    setVisListevelger(false);
  };
  const lagre = () => {
    updateTittel();
    setVisListevelger(false);
  };
  const erTomTittel = () => Utils._isEmpty(currentTittel(feltNavn));

  const dokumentKolonneStr = visSlett ? "10" : "11";
  const ikonKolonneStr = visSlett ? "2" : "1";

  return (
    <Nav.Row>
      {visListevelger ? (
        <Nav.Column xs="12" className="tittelendring">
          <Skjema.ListeVelger
            feltNavn={feltNavn}
            label=""
            placeholdere="Velg eller skriv inn egen tittel"
            muligeValg={muligeValg}
          />
          <Mui.Knapp type="hoved" disabled={erTomTittel()} onClick={lagre} className="knapper">
            Lagre
          </Mui.Knapp>
          <Mui.Knapp type="flat" onClick={avbryt} className="knapper">
            Avbryt
          </Mui.Knapp>
        </Nav.Column>
      ) : (
        <div className="dokumentvisning">
          <Nav.Column xs={dokumentKolonneStr}>{dokumentTittel}</Nav.Column>
          <Nav.Column xs={ikonKolonneStr} className="endreSlettIkonContainer">
            {visSlett && (
              <Nav.Lenker href="#" onClick={slettTittel} className="slettIkon">
                <Ikoner.Bin />
              </Nav.Lenker>
            )}
            <Nav.Lenker href="#" onClick={tittelEndres}>
              <Ikoner.Pencil />
            </Nav.Lenker>
          </Nav.Column>
        </div>
      )}
    </Nav.Row>
  );
}

LenkeListeVelger.propTypes = {
  feltNavn: PT.string.isRequired,
  dokumentTittel: PT.string.isRequired,
  undoTittel: PT.string,
  updateTittel: PT.func.isRequired,
  visSlett: PT.bool,
  slettTittel: PT.func,
  label: PT.string,
  muligeValg: PT.arrayOf(PT.shape({ term: PT.string })),
  settFeltInnhold: PT.func.isRequired,
  currentTittel: PT.func.isRequired,
};
LenkeListeVelger.defaultProps = {
  label: "",
  undoTittel: "",
  muligeValg: [],
  visSlett: false,
  slettTittel: undefined,
};
const selector = formValueSelector(KV.Form.JOURNALFORING);
const mapStateToProps = (state) => ({
  currentTittel: (feltNavn) => selector(state, feltNavn),
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
});

const mapDispatchToProps = (dispatch) => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change(KV.Form.JOURNALFORING, feltNavn, verdi)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LenkeListeVelger);
