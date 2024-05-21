import * as Nav from "../../../navFrontend";

import "./fotknapper.css";

interface FotknapperProps {
  avbrytJournalforing: () => void;
  spinner?: boolean;
}

const Fotknapper = ({ avbrytJournalforing, spinner = false }: FotknapperProps) => (
  <div className="fotknapper">
    <Nav.Button variant="primary" loading={spinner}>
      Journalfør
    </Nav.Button>
    <Nav.Button
      variant="tertiary"
      onClick={(e) => {
        e.preventDefault();
        avbrytJournalforing();
      }}
    >
      Avbryt
    </Nav.Button>
  </div>
);

export default Fotknapper;
