import React, { useState, ReactNode, MouseEventHandler, ElementType } from 'react';
import classnames from 'classnames';

import * as Nav from '../../../../utils/navFrontend';
import * as Symboler from '../symboler';
import * as Mui from '../../../ui';

import './redigerbartelement.css';

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
}: RedigerbartElementProps) => {
  const [redigerer, setRedigerer] = useState(!ingenDataRender);

  const redigeringUtfort = !redigerer && harData;

  const legendCls = classnames({
    understrek: tittelUnderstrek,
  });

  const legend = (
    <div className={legendCls}>
      <span style={{ marginRight: '10px' }}>
        {TittelIkon && <TittelIkon style={{ marginRight: '5px' }} />}{tittel}
      </span>
      {
        redigeringUtfort && redigerbart &&
        <>
          <Symboler.Rediger
            style={{ marginRight: '10px' }}
            onClick={() => setRedigerer(true)}
          />
          <Symboler.SlettAlt
            onClick={e => binClickHandler(e)}
          />
        </>
      }
    </div>
  );

  const hentAktivtInnhold = () => {
    if (redigeringUtfort) return redigeringUtfortRender();
    else if (redigerer) return redigererRender();
    else if (ingenDataRender) return ingenDataRender(() => setRedigerer(true));

    return <></>;
  };

  const visLagreKnapp = redigerer && (visLagreKnappBareHvisHarData ? harData : true);

  return (
    <div className="redigerbart__element">
      <Nav.Fieldset legend={legend}>
        {hentAktivtInnhold()}
      </Nav.Fieldset>
      {
        visLagreKnapp &&
        <Mui.Knapp
          onClick={() => setRedigerer(false)}
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
