import { ElementType, MouseEvent, MouseEventHandler, ReactNode, useState } from "react";
import classnames from "classnames";

import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../ui";

import Legend from "./legend";
import { Status, SymbolsynlighetConfig } from "./types";

import "./editerbartElement.css";

interface EditerbartElementProps {
  redigererRender: (lukkRedigering: () => void) => ReactNode;
  ingenDataRender?: (apneRedigering: () => void) => ReactNode;
  redigeringUtfortRender: () => ReactNode;
  redigerbart: boolean;
  onBinClick?: MouseEventHandler;
  tittel: string;
  tittelIkon?: ElementType;
  tittelUnderstrek?: boolean;
  understrek?: boolean;
  harData: boolean;
  visLagreKnappBareHvisHarData?: boolean;
  visLagreKnapp?: boolean;
  className?: string;
  onLagreClick?: (e: MouseEvent) => boolean | Promise<boolean>;
  symbolsynlighet?: SymbolsynlighetConfig;
}

const defaultSymbolsynlighet: SymbolsynlighetConfig = {
  [Status.Redigerer]: { bin: false, pencil: false },
  [Status.IngenData]: { bin: false, pencil: false },
  [Status.RedigeringUtfort]: { bin: true, pencil: true },
};

export const visAlltidBinSymbolsynlighet: SymbolsynlighetConfig = {
  [Status.Redigerer]: { bin: true, pencil: false },
  [Status.IngenData]: { bin: true, pencil: false },
  [Status.RedigeringUtfort]: { bin: true, pencil: true },
};

export const visAldriBinSymbolsynlighet: SymbolsynlighetConfig = {
  [Status.Redigerer]: { bin: false, pencil: false },
  [Status.IngenData]: { bin: false, pencil: false },
  [Status.RedigeringUtfort]: { bin: false, pencil: true },
};

export const ikkeVisBinIngenDataSymbolsynlighet: SymbolsynlighetConfig = {
  [Status.Redigerer]: { bin: true, pencil: false },
  [Status.IngenData]: { bin: false, pencil: false },
  [Status.RedigeringUtfort]: { bin: true, pencil: true },
};

const EditerbartElement = ({
  redigererRender,
  ingenDataRender,
  redigeringUtfortRender,
  redigerbart,
  onBinClick = () => {},
  tittel,
  tittelIkon,
  tittelUnderstrek,
  understrek,
  harData,
  visLagreKnappBareHvisHarData = false,
  visLagreKnapp,
  className,
  onLagreClick,
  symbolsynlighet = {},
}: EditerbartElementProps) => {
  const hentNesteStatus = (): Status => {
    if (harData) {
      return Status.RedigeringUtfort;
    }
    if (ingenDataRender) {
      return Status.IngenData;
    }

    return Status.Redigerer;
  };

  const [status, setStatus] = useState(hentNesteStatus());

  const hentAktivtInnhold = () => {
    if (status === Status.RedigeringUtfort) return redigeringUtfortRender();
    if (status === Status.Redigerer) return redigererRender(() => setStatus(Status.IngenData));
    if (status === Status.IngenData && ingenDataRender) {
      return ingenDataRender(() => setStatus(Status.Redigerer));
    }

    return null;
  };

  const skalRendreLagreKnapp =
    status === Status.Redigerer &&
    (visLagreKnappBareHvisHarData ? harData : true) &&
    (visLagreKnapp !== undefined ? visLagreKnapp : true);

  const lagreClickHandler: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.persist();

    if (onLagreClick) {
      try {
        const validert = await onLagreClick(event);
        if (!validert) return;
      } catch (error) {
        return;
      }
    }

    setStatus(hentNesteStatus());
  };

  const cls = classnames(className, "editerbart__element", {
    understrek,
  });

  const legend = (
    <Legend
      redigerbart={redigerbart}
      tittelIkon={tittelIkon}
      tittel={tittel}
      tittelUnderstrek={tittelUnderstrek}
      onBinClick={(e) => {
        setStatus(Status.IngenData);
        onBinClick(e);
      }}
      onPencilClick={() => setStatus(Status.Redigerer)}
      symbolsynlighet={{ ...defaultSymbolsynlighet, ...symbolsynlighet }[status] || { pencil: true, bin: true }}
    />
  );

  return (
    <div className={cls}>
      <Nav.Fieldset legend={legend}>{hentAktivtInnhold()}</Nav.Fieldset>
      {skalRendreLagreKnapp && (
        <Mui.Knapp
          onClick={lagreClickHandler}
          capitalCase
          disabled={!redigerbart}
          type="hoved"
          className="lagre__knapp"
        >
          Lagre
        </Mui.Knapp>
      )}
    </div>
  );
};

export default EditerbartElement;
