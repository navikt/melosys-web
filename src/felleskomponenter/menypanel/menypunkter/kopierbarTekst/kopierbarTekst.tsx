import React, { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import classNames from 'classnames';

import * as Ikoner from '../../../../resources/images';

import './kopierbarTekst.css';

interface KopierbarTekstProps {
  children: string,
}

const KopierbarTekst = ({
  children,
}: KopierbarTekstProps) => {
  const [erKopiert, setErKopiert] = useState(false);

  useEffect(() => {
    setTimeout(() => setErKopiert(false), 50);
  }, [erKopiert]);

  const containerCls = classNames({
    'kopierbar-tekst__container--kopiert': erKopiert,
    'kopierbar-tekst__container': !erKopiert,
  });

  return (
    <span className="kopierbar-tekst">
      <span className={containerCls}>
        <CopyToClipboard
          text={children}
          onCopy={() => setErKopiert(true)}>
          <span>{children}<Ikoner.Kopier className="kopier-ikon" /></span>
        </CopyToClipboard>
      </span>
    </span>
  );
};

export default KopierbarTekst;
