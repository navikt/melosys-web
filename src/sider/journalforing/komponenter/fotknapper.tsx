import * as Mui from "../../../felleskomponenter/ui";

import "./fotknapper.css";

interface FotknapperProps {
  avbrytJournalforing: () => void;
  spinner?: boolean;
}

const Fotknapper = ({ avbrytJournalforing, spinner = false }: FotknapperProps) => (
  <div className="fotknapper">
    <Mui.Knapp type="hoved" htmlType="submit" spinner={spinner} autoDisableVedSpinner>
      Journalfør
    </Mui.Knapp>
    <Mui.Knapp type="flat" className="fotknapper__avbryt" onClick={avbrytJournalforing}>
      Avbryt
    </Mui.Knapp>
  </div>
);

export default Fotknapper;
