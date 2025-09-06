import { useState } from "react";
import PT from "prop-types";

import * as Nav from "../../../../navFrontend";
import * as Ikoner from "../../../../resources/images";

import "./element.less";

function Element({ kode, term, onFjern, onAngreFjern, fjernbar = true, redigerbar, defaultFjernet = false }) {
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
    <Nav.Row className="redigerbarliste__element">
      <Nav.Column xs="6">{term}</Nav.Column>
      {fjernbar && (
        <Nav.Column xs="6">
          {!fjernet && (
            <Nav.Button variant="secondary" icon={<Ikoner.RemoveOne />} disabled={!redigerbar} onClick={fjern}>
              Fjern
            </Nav.Button>
          )}
          {fjernet && (
            <Nav.Button variant="secondary" icon={<Ikoner.AddOne />} disabled={!redigerbar} onClick={angreFjern}>
              Angre fjern
            </Nav.Button>
          )}
        </Nav.Column>
      )}
    </Nav.Row>
  );
}

Element.propTypes = {
  kode: PT.string.isRequired,
  term: PT.string.isRequired,
  onFjern: PT.func.isRequired,
  onAngreFjern: PT.func.isRequired,
  fjernbar: PT.bool,
  redigerbar: PT.bool.isRequired,
  defaultFjernet: PT.bool,
};

export default Element;
