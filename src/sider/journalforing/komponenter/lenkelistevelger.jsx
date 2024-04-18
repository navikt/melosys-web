import { useState } from "react";
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
          <Nav.Button variant="primary" size="small" disabled={erTomTittel()} onClick={lagre} className="knapper">
            Lagre
          </Nav.Button>
          <Nav.Button variant="tertiary" size="small" onClick={avbryt} className="knapper">
            Avbryt
          </Nav.Button>
        </Nav.Column>
      ) : (
        <div className="dokumentvisning">
          <span>{dokumentTittel}</span>
          <div className="ikon-wrapper">
            {visSlett && <Mui.IkonKnapp ikon={Ikoner.Bin} onClick={slettTittel} ariaLabel="Slett" />}
            <Mui.IkonKnapp ikon={Ikoner.Pencil} onClick={tittelEndres} ariaLabel="Rediger" />
          </div>
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
