import { KeyboardEvent, useState } from "react";
import classNames from "classnames";
import * as Ikon from "../../../resources/images";
import LeggBehandlingTilbake from "./leggbehandlingtilbake";
import AvsluttSak from "./avsluttsak";
import "./behandlingsmeny.css";
import { Accordion } from "@navikt/ds-react";
import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import MKV from "../../../melosyskodeverk";
import FerdigbehandleAarsavregning from "./ferdigbehandleAarsavregning";

const { ÅRSAVREGNING } = MKV.Koder.behandlinger.behandlingstyper;
export const Behandlingsmeny = () => {
  const [visBehandlingsmeny, setVisBehandlingsmeny] = useState(false);
  const toggleBehandlingsmeny = () => setVisBehandlingsmeny(!visBehandlingsmeny);
  const erÅrsavregning = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector) === ÅRSAVREGNING;

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      toggleBehandlingsmeny();
    }
  };

  const knappCls = classNames("behandlingsmeny__knapp", { behandlingsmeny__knapp__aapen: visBehandlingsmeny });
  const hamburgerCls = classNames("behandlingsmeny__hamburger", {
    behandlingsmeny__hamburger__aapen: visBehandlingsmeny,
  });

  return (
    <div className="behandlingsmeny">
      <div
        className={knappCls}
        role="button"
        tabIndex={0}
        onClick={toggleBehandlingsmeny}
        onKeyPress={handleKeyPress}
        aria-label="Behandlingsmeny"
        title="Behandlingsmeny"
      >
        <Ikon.Hamburger className={hamburgerCls} />
      </div>
      {visBehandlingsmeny && (
        <div className="behandlingsmeny__meny">
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>Legg behandling tilbake</Accordion.Header>
              <Accordion.Content>
                <LeggBehandlingTilbake />
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item>
              <Accordion.Header>Avslutt sak/behandling</Accordion.Header>
              <Accordion.Content>{erÅrsavregning ? <FerdigbehandleAarsavregning /> : <AvsluttSak />}</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default Behandlingsmeny;
