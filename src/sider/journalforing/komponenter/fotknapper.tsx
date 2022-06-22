import React from "react";

import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";

interface FotknapperProps {
  avbrytJournalforing: () => void;
  kanSubmittes: boolean;
  spinner?: boolean;
}

const Fotknapper = ({ avbrytJournalforing, kanSubmittes, spinner = false }: FotknapperProps) => (
  <div className="journalforing__fotknapper">
    <Nav.Row>
      <Nav.Column xs="6">
        <Mui.Knapp type="hoved" htmlType="submit" disabled={!kanSubmittes} spinner={spinner} autoDisableVedSpinner>
          JOURNALFØR
        </Mui.Knapp>
      </Nav.Column>
      <Nav.Column xs="6">
        <Mui.Knapp onClick={avbrytJournalforing}>Avbryt Journalføring</Mui.Knapp>
      </Nav.Column>
    </Nav.Row>
  </div>
);

export default Fotknapper;
