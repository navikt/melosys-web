import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import PT from 'prop-types';
import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Ikoner from '../../../resources/images';
import * as Nav from '../../../utils/navFrontend';
import { formSelectors } from '../../../ducks/form';

function LenkeListeVelger(props) {
  const {
    feltNavn, placeholder, muligeValg, linkTo, dokumentTittel, undoTittel, updateTittel,
    settFeltInnhold,
  } = props;
  const [visListevelger, setState] = useState(false);
  const style = { marginBottom: '1em' };

  const tittelEndres = () => {
    setState(!visListevelger);
  };
  const avbryt = () => {
    settFeltInnhold(feltNavn, undoTittel);
    setState(false);
  };
  const lagre = () => {
    updateTittel();
    setState(false);
  };
  return (
    <Nav.Row>
      <Nav.Column xs="9">
        {!visListevelger && <Link to={linkTo} target="_blank" className="informasjon__dokumentlenke">{dokumentTittel}</Link>}
      </Nav.Column>
      <Nav.Column xs="3">
        {!visListevelger && <Nav.Lenker onClick={tittelEndres}><img src={Ikoner.Pencil} alt="Edit" /><span>&nbsp;Endre tittel</span></Nav.Lenker>}
      </Nav.Column>
      <Nav.Column xs="12" style={style}>
        {visListevelger &&
          <Fragment>
            <Skjema.ListeVelger feltNavn={feltNavn} label="" placeholdere={placeholder} muligeValg={muligeValg} />
            <Nav.Knapp onClick={lagre}>Lagre Tittel</Nav.Knapp>&nbsp;<Nav.Flatknapp onClick={avbryt}>Avbryt</Nav.Flatknapp>
          </Fragment>
        }
      </Nav.Column>
    </Nav.Row>
  );
}

LenkeListeVelger.propTypes = {
  feltNavn: PT.string.isRequired,
  linkTo: PT.string.isRequired,
  dokumentTittel: PT.string.isRequired,
  undoTittel: PT.string.isRequired,
  updateTittel: PT.func.isRequired,
  label: PT.string,
  placeholder: PT.string,
  muligeValg: PT.arrayOf(PT.string),
  settFeltInnhold: PT.func.isRequired,
};
LenkeListeVelger.defaultProps = {
  label: '',
  placeholder: '',
  muligeValg: [],
};

const mapStateToProps = state => ({
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
});

const mapDispatchToProps = dispatch => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change('journalforing', feltNavn, verdi)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LenkeListeVelger);
