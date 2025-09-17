import * as Nav from "../../../navFrontend";

import "./fotknapper.less";

interface FotknapperProps {
  avbrytJournalforing: () => void;
  spinner?: boolean;
}

function Fotknapper({ avbrytJournalforing, spinner = false }: FotknapperProps) {
  return (
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
}

export default Fotknapper;
