import React, { useState, ReactNode, MouseEventHandler, ElementType } from 'react';
import classnames from 'classnames';

import * as Nav from '../../../../utils/navFrontend';
import * as Symboler from '../symboler';
import * as Mui from '../../../ui';

import './redigerbartelement.css';

enum Status {
  Redigerer,
  RedigeringUtfort,
  IngenData,
}

interface RedigerbartElementProps {
  redigererRender: () => ReactNode,
  ingenDataRender?: (apneRedigering: () => void) => ReactNode,
  redigeringUtfortRender: () => ReactNode,
  redigerbart: boolean,
  binClickHandler: MouseEventHandler,
  tittel: string,
  tittelIkon?: ElementType,
  tittelUnderstrek?: boolean,
  harData: boolean,
  visLagreKnappBareHvisHarData?: boolean,
  className?: string,
}

const RedigerbartElement = ({
  redigererRender,
  ingenDataRender,
  redigeringUtfortRender,
  redigerbart,
  binClickHandler,
  tittel,
  tittelIkon: TittelIkon,
  tittelUnderstrek,
  harData,
  visLagreKnappBareHvisHarData = false,
  className,
}: RedigerbartElementProps) => {
  const hentNesteStatus = (): Status => {
    if (harData) {
      return Status.RedigeringUtfort;
    } else if (ingenDataRender) {
      return Status.IngenData;
    }

    return Status.Redigerer;
  };

  const [status, setStatus] = useState(hentNesteStatus());

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
          <Symboler.SlettAlt
            onClick={e => binClickHandler(e)}
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

  const visLagreKnapp = status === Status.Redigerer && (visLagreKnappBareHvisHarData ? harData : true);

  const lagreClickHandler = () => setStatus(hentNesteStatus());

  const cls = classnames(className, 'redigerbart__element');

  return (
    <div className={cls}>
      <Nav.Fieldset legend={legend}>
        {hentAktivtInnhold()}
      </Nav.Fieldset>
      {
        visLagreKnapp &&
        <Mui.Knapp
          onClick={lagreClickHandler}
          capitalCase
          disabled={!redigerbart}
          type="hoved"
        >
          Lagre
        </Mui.Knapp>
      }
    </div>
  );
};

export default RedigerbartElement;
