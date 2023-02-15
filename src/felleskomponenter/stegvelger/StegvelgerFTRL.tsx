/* eslint-disable */
import React, { useContext, useState } from "react";
import { FANE_STATUS, STEG } from "./stegMotor";
import { FellesHandlersContext } from "../../contexts";
import { VurderingStart } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingStart";
import { VurderingVirksomhet } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingVirksomhet";
import classNames from "classnames";
import * as Nav from "../../navFrontend";
import VurderingPerioder from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingPerioder";
import VurderingTrygdeavgift from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift";
import VurderingVedtak from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingVedtak";
import StegLinje from "../stegLinje/stegLinje";
import { VurderingBestemmelse } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingBestemmelse";

type stegMapType = {
  aktivtSteg: string;
  status: string;
};

const stegMap = ({ aktivtSteg, status }: stegMapType) => [
  {
    navn: STEG.START,
    id: "0",
    tittel: "Start",
    status: status,
    aktivtSteg: aktivtSteg === STEG.START,
    vedtakSteg: false,
    nesteSteg: STEG.VIRKSOMHET,
    forrigeSteg: null,
    komponent: VurderingStart,
  },
  {
    navn: STEG.VIRKSOMHET,
    id: "1",
    tittel: "Virksomhet",
    status: status,
    aktivtSteg: aktivtSteg === STEG.VIRKSOMHET,
    vedtakSteg: false,
    nesteSteg: STEG.BESTEMMELSE,
    forrigeSteg: STEG.START,
    komponent: VurderingVirksomhet,
  },
  {
    navn: STEG.BESTEMMELSE,
    id: "2",
    tittel: "Bestemmelse",
    status: status,
    aktivtSteg: aktivtSteg === STEG.BESTEMMELSE,
    vedtakSteg: false,
    nesteSteg: STEG.PERIODER,
    forrigeSteg: STEG.VIRKSOMHET,
    komponent: VurderingBestemmelse,
  },
  {
    navn: STEG.PERIODER,
    id: "3",
    tittel: "Perioder",
    status: status,
    aktivtSteg: aktivtSteg === STEG.PERIODER,
    vedtakSteg: false,
    nesteSteg: STEG.TRYGDEAVGIFT,
    forrigeSteg: STEG.BESTEMMELSE,
    komponent: VurderingPerioder,
  },
  {
    navn: STEG.TRYGDEAVGIFT,
    id: "4",
    tittel: "Trygdeavgift",
    status: status,
    aktivtSteg: aktivtSteg === STEG.TRYGDEAVGIFT,
    vedtakSteg: false,
    nesteSteg: STEG.VEDTAK_FTRL,
    forrigeSteg: STEG.PERIODER,
    komponent: VurderingTrygdeavgift,
  },
  {
    navn: STEG.VEDTAK_FTRL,
    id: "5",
    tittel: "Vedtak",
    status: status,
    aktivtSteg: aktivtSteg === STEG.VEDTAK_FTRL,
    vedtakSteg: false,
    nesteSteg: null,
    forrigeSteg: STEG.TRYGDEAVGIFT,
    komponent: VurderingVedtak,
  },
];

export const StegvelgerFTRL = () => {
  const [aktivtSteg, setAktivtSteg] = useState(STEG.START);
  const stegFaneKlasse = classNames({
    stegFane: true,
    "stegFane--aktiv": true,
  });
  const alleSteg = stegMap({ aktivtSteg, status: FANE_STATUS.UBEHANDLET });
  const steg = alleSteg.find((steg: any) => steg.navn === aktivtSteg)!!;

  return (
    <div className="stegvelger panelSeksjon">
      <StegLinje
        steg={alleSteg}
        stegKlikk={(stegId) => setAktivtSteg(alleSteg.find((steg: any) => steg.id === stegId.toString())!!.navn)}
      />
      <Nav.Panel className={stegFaneKlasse}>
        {React.createElement(steg?.komponent as any, {
          bekreft: () => {
            setAktivtSteg(steg.nesteSteg ?? "");
          },
          tilbake: () => {
            setAktivtSteg(steg.forrigeSteg ?? "");
          },
        })}
      </Nav.Panel>
    </div>
  );
};
