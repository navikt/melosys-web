import React, { useState, ReactNode, MouseEventHandler, MouseEvent, ElementType, useEffect } from 'react';
import classnames from 'classnames';

import * as Nav from '../../../../utils/navFrontend';
import * as Symboler from '../symboler';
import * as Mui from '../../../ui';

import './editerbartElement.css';

enum Status {
  Redigerer,
  RedigeringUtfort,
  IngenData,
}

interface EditerbartElementProps {
  redigererRender: () => ReactNode,
  ingenDataRender?: (apneRedigering: () => void) => ReactNode,
  redigeringUtfortRender: () => ReactNode,
  redigerbart: boolean,
  onBinClick: MouseEventHandler,
  tittel: string,
  tittelIkon?: ElementType,
  tittelUnderstrek?: boolean,
  understrek?: boolean,
  harData: boolean,
  visLagreKnappBareHvisHarData?: boolean,
  visLagreKnapp?: boolean,
  className?: string,
  hentNyStatusVedHarData?: boolean,
  onLagreClick?: (e: MouseEvent) => boolean | Promise<boolean>,
}

const EditerbartElement = ({
  redigererRender,
  ingenDataRender,
  redigeringUtfortRender,
  redigerbart,
  onBinClick,
  tittel,
  tittelIkon: TittelIkon,
  tittelUnderstrek,
  understrek,
  harData,
  visLagreKnappBareHvisHarData = false,
  visLagreKnapp,
  className,
  hentNyStatusVedHarData = false,
  onLagreClick,
}: EditerbartElementProps) => {
  const hentNesteStatus = (): Status => {
    if (harData) {
      return Status.RedigeringUtfort;
    } else if (ingenDataRender) {
      return Status.IngenData;
    }

    return Status.Redigerer;
  };

  const [status, setStatus] = useState(hentNesteStatus());

  useEffect(() => {
    if (!harData || hentNyStatusVedHarData) {
      setStatus(hentNesteStatus());
    }
  }, [harData]);

  const legendCls = classnames({
    understrek: tittelUnderstrek,
  });

  const legend = (
    <div className={legendCls}>
      <span style={{ marginRight: '10px' }}>
        {TittelIkon && <TittelIkon style={{ marginRight: '5px' }} />}
        <Nav.typo.Undertittel style={{ display: 'inline' }}>{tittel}</Nav.typo.Undertittel>
      </span>
      {
        status === Status.RedigeringUtfort && redigerbart &&
        <>
          <Symboler.Rediger
            style={{ marginRight: '10px' }}
            onClick={() => setStatus(Status.Redigerer)}
          />
          <Symboler.Slett
            onClick={onBinClick}
          />
        </>
      }
    </div>
  );

  const hentAktivtInnhold = () => {
    if (status === Status.RedigeringUtfort) return redigeringUtfortRender();
    else if (status === Status.Redigerer) return redigererRender();
    else if (status === Status.IngenData && ingenDataRender) {
      return ingenDataRender(() => setStatus(Status.Redigerer));
    }

    return <></>;
  };

  const skalRendreLagreKnapp = status === Status.Redigerer
    && (visLagreKnappBareHvisHarData ? harData : true)
    && (visLagreKnapp !== undefined ? visLagreKnapp : true);

  const lagreClickHandler: MouseEventHandler<HTMLButtonElement> = async e => {
    e.persist();

    if (onLagreClick) {
      const validert = await onLagreClick(e);
      if (!validert) return;
    }

    setStatus(hentNesteStatus());
  };

  const cls = classnames(className, 'editerbart__element', {
    understrek,
  });

  return (
    <div className={cls}>
      <Nav.Fieldset legend={legend}>
        {hentAktivtInnhold()}
      </Nav.Fieldset>
      {
        skalRendreLagreKnapp &&
        <Mui.Knapp
          onClick={lagreClickHandler}
          capitalCase
          disabled={!redigerbart}
          type="hoved"
          className="lagre__knapp"
        >
          Lagre
        </Mui.Knapp>
      }
    </div>
  );
};

export default EditerbartElement;
