import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Utils from "../../utils";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { Innsynsmelding } from "../alertmeldinger";
import StegLinje from "../stegLinje/stegLinje";
import StegFane from "../stegFane";
import { FANE_STATUS } from "../stegvelger";
import MKV from "../../melosyskodeverk";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { NyVurderingMelding } from "../alertmeldinger/alertmeldinger";

interface AktueltSteg {
  id: string;
  tittel: string;
  stegPosisjon: number;
  status: string;
  aktivtSteg: boolean;
  vedtakSteg: boolean;
  komponent: any;
}

interface EnkelStegvelgerProps {
  alleSteg: AktueltSteg[];
}

export default ({ alleSteg }: EnkelStegvelgerProps) => {
  const [aktuelleSteg, setAktuellesteg] = useState<AktueltSteg[]>([alleSteg[0]]);
  const [aktivtStegIndex, setAktivtStegIndex] = useState(0);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const inngangStegErAktivt = aktivtStegIndex === 0;

  const hentNesteSteg = (stegPosisjon: number) => alleSteg.find((steg) => steg.stegPosisjon === stegPosisjon + 1);

  useEffect(() => {
    setAktuellesteg(
      aktuelleSteg?.map((steg: AktueltSteg) => ({ ...steg, aktivtSteg: steg.stegPosisjon === aktivtStegIndex }))
    );
  }, [aktivtStegIndex]);

  const oppdaterStatus = (stegId: string) => (isSchemaValid: boolean) => {
    const nyeSteg = aktuelleSteg?.map((steg: AktueltSteg) =>
      steg.id === stegId ? { ...steg, status: isSchemaValid ? FANE_STATUS.OK : FANE_STATUS.UBEHANDLET } : steg
    );

    const førsteUgyldigeSteg = nyeSteg.find((steg) => steg.status === FANE_STATUS.UBEHANDLET);

    if (førsteUgyldigeSteg) {
      nyeSteg.length = førsteUgyldigeSteg.stegPosisjon + 1;
    } else {
      const nesteSteg = hentNesteSteg(nyeSteg[nyeSteg.length - 1].stegPosisjon);
      if (nesteSteg) nyeSteg.push(nesteSteg);
    }

    setAktuellesteg(nyeSteg);
  };

  const bekreft = () => {
    setAktivtStegIndex(aktivtStegIndex + 1);
  };

  const tilbake = () => {
    setAktivtStegIndex(aktivtStegIndex - 1);
  };

  const handleKlikk = (stegIndex: number) => {
    setAktivtStegIndex(stegIndex);
  };

  return (
    <div className="stegvelger panelSeksjon">
      {!Utils._isEmpty(aktuelleSteg) && (
        <div>
          <StegLinje steg={aktuelleSteg} stegKlikk={handleKlikk} />
          {!redigerbart && <Innsynsmelding />}

          {erNyVurdering && redigerbart && inngangStegErAktivt && <NyVurderingMelding />}
          {aktuelleSteg.map((steg) => (
            <StegFane
              faneData={steg}
              id={steg.id}
              key={steg.id}
              rest={{
                oppdaterStatus: oppdaterStatus(steg.id),
                bekreft,
                tilbake,
                aktivtSteg: steg.aktivtSteg,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
