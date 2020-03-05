import React, { useState } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Mui from '..';
import * as Ikoner from '../../../resources/images';

import './element.css';

const Element = ({
  kode,
  term,
  onFjern,
  onAngreFjern,
  fjernbar,
  redigerbar,
  defaultFjernet,
}) => {
  const [fjernet, setFjernet] = useState(defaultFjernet);

  const fjern = () => {
    setFjernet(true);
    onFjern(kode);
  };

  const angreFjern = () => {
    setFjernet(false);
    onAngreFjern(kode);
  };

  return (
    <Nav.Row className="element">
      <Nav.Column xs="6">{term}</Nav.Column>
      {
        fjernbar &&
        <Nav.Column xs="6">
          {
            !fjernet &&
            <Mui.Knapp disabled={!redigerbar} onClick={fjern}>&times; FJERN</Mui.Knapp>
          }
          {
            fjernet &&
            <Mui.Knapp ikon={Ikoner.AddOne} disabled={!redigerbar} onClick={angreFjern}>ANGRE FJERN</Mui.Knapp>
          }
        </Nav.Column>
      }
    </Nav.Row>
  );
};

Element.propTypes = {
  kode: PT.string.isRequired,
  term: PT.string.isRequired,
  onFjern: PT.func.isRequired,
  onAngreFjern: PT.func.isRequired,
  fjernbar: PT.bool,
  redigerbar: PT.bool.isRequired,
  defaultFjernet: PT.bool,
};

Element.defaultProps = {
  fjernbar: true,
  defaultFjernet: false,
};

export default Element;
