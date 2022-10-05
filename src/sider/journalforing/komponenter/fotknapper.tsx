import React from "react";

import * as Mui from "../../../felleskomponenter/ui";

import "./fotknapper.css";

interface FotknapperProps {
  avbrytJournalforing: () => void;
  kanSubmittes: boolean;
  spinner?: boolean;
}

const Fotknapper = ({ avbrytJournalforing, kanSubmittes, spinner = false }: FotknapperProps) => (
  <div className="fotknapper">
    <Mui.Knapp type="hoved" htmlType="submit" disabled={!kanSubmittes} spinner={spinner} autoDisableVedSpinner>
      Journalfør
    </Mui.Knapp>
    <Mui.Knapp type="flat" className="fotknapper__avbryt" onClick={avbrytJournalforing}>
      Avbryt
    </Mui.Knapp>
  </div>
);

export default Fotknapper;
