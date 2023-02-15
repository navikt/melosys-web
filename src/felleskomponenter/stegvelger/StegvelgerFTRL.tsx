/* eslint-disable */
import React, { useContext, useEffect, useState } from "react";
import { FANE_STATUS, STEG } from "./stegMotor";
import { FellesHandlersContext } from "../../contexts";
import { VurderingStart } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingStart";
import { VurderingVirksomhet } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingVirksomhet";
import classNames from "classnames";
import * as Nav from "../../navFrontend";
import { VurderingPerioder } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingPerioder";
import { VurderingTrygdeavgift } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift";
import VurderingVedtak from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingVedtak";
import StegLinje from "../stegLinje/stegLinje";
import { VurderingBestemmelse } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingBestemmelse";
import { useFormContext } from "react-hook-form";

type stegMapType = {
  aktivtSteg: string;
  status: string;
};

const stegMap = [
  {
    navn: STEG.START,
    id: "0",
    tittel: "Start",
    vedtakSteg: false,
    nesteSteg: STEG.VIRKSOMHET,
    forrigeSteg: null,
    komponent: VurderingStart,
  },
  {
    navn: STEG.VIRKSOMHET,
    id: "1",
    tittel: "Virksomhet",
    vedtakSteg: false,
    nesteSteg: STEG.BESTEMMELSE,
    forrigeSteg: STEG.START,
    komponent: VurderingVirksomhet,
  },
  {
    navn: STEG.BESTEMMELSE,
    id: "2",
    tittel: "Bestemmelse",
    vedtakSteg: false,
    nesteSteg: STEG.PERIODER,
    forrigeSteg: STEG.VIRKSOMHET,
    komponent: VurderingBestemmelse,
  },
  {
    navn: STEG.PERIODER,
    id: "3",
    tittel: "Perioder",
    vedtakSteg: false,
    nesteSteg: STEG.TRYGDEAVGIFT,
    forrigeSteg: STEG.BESTEMMELSE,
    komponent: VurderingPerioder,
  },
  {
    navn: STEG.TRYGDEAVGIFT,
    id: "4",
    tittel: "Trygdeavgift",
    vedtakSteg: false,
    nesteSteg: STEG.VEDTAK_FTRL,
    forrigeSteg: STEG.PERIODER,
    komponent: VurderingTrygdeavgift,
  },
  {
    navn: STEG.VEDTAK_FTRL,
    id: "5",
    tittel: "Vedtak",
    vedtakSteg: false,
    nesteSteg: null,
    forrigeSteg: STEG.TRYGDEAVGIFT,
    komponent: VurderingVedtak,
  },
];

export interface FormSkjemaStegStatus {
  stegNavn: string;
  dataErGyldig: boolean;
}

export const StegvelgerFTRL = () => {
  const [aktivtSteg, setAktivtSteg] = useState(STEG.START);
  const [formSkjemaStatus, setFormSkjemaStatus] = useState<FormSkjemaStegStatus[]>();

  const stegFaneKlasse = classNames({
    stegFane: true,
    "stegFane--aktiv": true,
  });

  const alleSteg = stegMap.map((steg) => {
    return {
      ...steg,
      status: formSkjemaStatus?.find((status) => status.stegNavn === steg.navn)?.dataErGyldig
        ? FANE_STATUS.OK
        : FANE_STATUS.UBEHANDLET,
      aktivtSteg: steg.navn === aktivtSteg,
    };
  });

  const renderAlleSteg = alleSteg.map((steg) => {
    return {
      navn: steg.navn,
      komponent: React.createElement(steg.komponent as any, {
        bekreft: () => {
          setAktivtSteg(steg.nesteSteg ?? "");
        },
        tilbake: () => {
          setAktivtSteg(steg.forrigeSteg ?? "");
        },
        rapporterSkjema: (formSkjemaStatus: FormSkjemaStegStatus) => {
          setFormSkjemaStatus((prev) => {
            const fantEksisterendeFormSkjemaStatus = prev?.find(
              (status) => status.stegNavn === formSkjemaStatus.stegNavn
            );
            if (prev && fantEksisterendeFormSkjemaStatus) {
              return prev?.map((status) =>
                status.stegNavn === formSkjemaStatus.stegNavn ? Object.assign({}, formSkjemaStatus) : status
              );
            }
            if (prev && !fantEksisterendeFormSkjemaStatus) {
              return [...prev, formSkjemaStatus];
            }
            return [formSkjemaStatus];
          });
        },
      }),
    };
  });

  const aktivtStegKomponent = renderAlleSteg.find((steg: any) => steg.navn === aktivtSteg)!!;

  return (
    <div className="stegvelger panelSeksjon">
      <StegLinje
        steg={alleSteg}
        stegKlikk={(stegId) => setAktivtSteg(alleSteg.find((steg: any) => steg.id === stegId.toString())!!.navn)}
      />
      <Nav.Panel className={stegFaneKlasse}>{aktivtStegKomponent.komponent}</Nav.Panel>
    </div>
  );
};
