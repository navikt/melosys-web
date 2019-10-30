import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import PT from 'prop-types';
import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Ikoner from '../../../resources/images';
import * as Nav from '../../../utils/navFrontend';

function LenkeListeVelger(props) {
  const [visListevelger, setState] = useState(false);
  const {
    feltNavn, label, placeholder, muligeValg, linkTo, dokumentTittel,
  } = props;
  const tittelEndres = () => {
    setState(!visListevelger);
  };
  return (
    <Nav.Row>
      <Nav.Column xs="6">
        <Link to={linkTo} target="_blank" className="informasjon__dokumentlenke">{dokumentTittel}</Link>
      </Nav.Column>
      <Nav.Column xs="6">
        {/* <Nav.Knapp mini className="innhold__element" onClick={tittelEndres}><img src={Ikoner.Pencil} alt="Edit" /><span>Endre tittel</span></Nav.Knapp> */}
        {!visListevelger && <Nav.Lenker onClick={tittelEndres}><img src={Ikoner.Pencil} alt="Edit" /><span>Endre tittel</span></Nav.Lenker>}
      </Nav.Column>
      <Nav.Column xs="12">
        {visListevelger &&
          <Fragment>
            <Skjema.ListeVelger feltNavn={feltNavn} label={label} placeholdere={placeholder} muligeValg={muligeValg} />
            <Nav.Knapp onClick={tittelEndres}>Lagre Tittel</Nav.Knapp>&nbsp;<Nav.Flatknapp onClick={tittelEndres}>Avbryt</Nav.Flatknapp>
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
  label: PT.string,
  placeholder: PT.string,
  muligeValg: PT.arrayOf(PT.string),
};
LenkeListeVelger.defaultProps = {
  label: '',
  placeholder: '',
  muligeValg: [],
};
export default LenkeListeVelger;
