import React, { useState, ReactNode, MouseEventHandler } from 'react';

import * as Nav from '../../../../utils/navFrontend';
import * as Symboler from '../symboler';
import * as Mui from '../../../ui';

interface RedigerbartElementProps {
  redigererRender: () => ReactNode,
  ingenDataRender: (apneRedigering: () => void) => ReactNode,
  redigeringUtfortRender: () => ReactNode,
  redigerbart: boolean,
  binClickHandler: MouseEventHandler,
  tittel: string,
  harData: boolean,
}

const RedigerbartElement = ({
  redigererRender,
  ingenDataRender,
  redigeringUtfortRender,
  redigerbart,
  binClickHandler,
  tittel,
  harData,
}: RedigerbartElementProps) => {
  const [redigerer, setRedigerer] = useState(false);

  const redigeringUtfort = !redigerer && harData;

  const legend = redigerbart ? (
    <>
      <span style={{ marginRight: '10px' }}>{tittel}</span>
      {
        redigeringUtfort &&
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
    </>
  ) : undefined;

  const hentAktivtInnhold = () => {
    if (redigeringUtfort) return redigeringUtfortRender();
    else if (redigerer) return redigererRender();
    return ingenDataRender(() => setRedigerer(true));
  };

  return (
    <>
      <Nav.Fieldset legend={legend}>
        {hentAktivtInnhold()}
      </Nav.Fieldset>
      {
        redigerer &&
        <Mui.Knapp
          onClick={() => setRedigerer(false)}
          capitalCase
          disabled={!redigerbart}
          type="hoved"
        >
          Lagre
        </Mui.Knapp>
      }
    </>
  );
};

export default RedigerbartElement;
