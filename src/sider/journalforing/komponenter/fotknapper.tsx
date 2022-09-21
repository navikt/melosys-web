import React from "react";

import * as Mui from "../../../felleskomponenter/ui";

interface FotknapperProps {
  avbrytJournalforing: () => void;
  kanSubmittes: boolean;
  spinner?: boolean;
}

const Fotknapper = ({ avbrytJournalforing, kanSubmittes, spinner = false }: FotknapperProps) => (
  <div className="journalforing__fotknapper">
    <Mui.Knapp type="hoved" htmlType="submit" disabled={!kanSubmittes} spinner={spinner} autoDisableVedSpinner>
      Journalfør
    </Mui.Knapp>
    <Mui.Knapp type="flat" className="journalforing__fotknapper__avbryt" onClick={avbrytJournalforing}>
      Avbryt
    </Mui.Knapp>
  </div>
);

export default Fotknapper;
