/*eslint-disable*/

import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { FANE_STATUS, STEG } from "./stegMotor";
import { VurderingStart } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingStart";
import { VurderingVirksomhet } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingVirksomhet";
import * as Nav from "../../navFrontend";
import { VurderingPerioder } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingPerioder";
import { VurderingTrygdeavgift } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift";
import { VurderingVedtak } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingVedtak";
import StegLinje from "../stegLinje/stegLinje";
import { VurderingBestemmelse } from "../../sider/ftrl/saksbehandling/stegKomponenter/vurderingBestemmelse";

const START = {
  navn: STEG.START,
  id: "0",
  tittel: "Start",
  vedtakSteg: false,
  nesteSteg: STEG.VIRKSOMHET,
  forrigeSteg: null,
  komponent: VurderingStart,
};
const VIRKSOMHET = {
  navn: STEG.VIRKSOMHET,
  id: "1",
  tittel: "Virksomhet",
  vedtakSteg: false,
  nesteSteg: STEG.BESTEMMELSE,
  forrigeSteg: STEG.START,
  komponent: VurderingVirksomhet,
};
const BESTEMMELSE = {
  navn: STEG.BESTEMMELSE,
  id: "2",
  tittel: "Bestemmelse",
  vedtakSteg: false,
  nesteSteg: STEG.PERIODER,
  forrigeSteg: STEG.VIRKSOMHET,
  komponent: VurderingBestemmelse,
};
const PERIODER = {
  navn: STEG.PERIODER,
  id: "3",
  tittel: "Perioder",
  vedtakSteg: false,
  nesteSteg: STEG.TRYGDEAVGIFT,
  forrigeSteg: STEG.BESTEMMELSE,
  komponent: VurderingPerioder,
};
const TRYGDEAVGIFT = {
  navn: STEG.TRYGDEAVGIFT,
  id: "4",
  tittel: "Trygdeavgift",
  vedtakSteg: false,
  nesteSteg: STEG.VEDTAK_FTRL,
  forrigeSteg: STEG.PERIODER,
  komponent: VurderingTrygdeavgift,
};
const VEDTAK_FTRL = {
  navn: STEG.VEDTAK_FTRL,
  id: "5",
  tittel: "Vedtak",
  vedtakSteg: true,
  nesteSteg: "",
  forrigeSteg: STEG.TRYGDEAVGIFT,
  komponent: VurderingVedtak,
};

export interface FormSkjemaStegStatus {
  stegNavn: string;
  dataErGyldig: boolean;
}

export const StegvelgerFTRL = () => {
  const [aktivtSteg, setAktivtSteg] = useState(STEG.START);
  const [stegMap, setStegMap] = useState([START, VIRKSOMHET, BESTEMMELSE, PERIODER, TRYGDEAVGIFT]);
  const [formSkjemaStatus, setFormSkjemaStatus] = useState<FormSkjemaStegStatus[]>();

  useEffect(() => {
    const finnesUgyldigSide = formSkjemaStatus?.find((status) => !status.dataErGyldig);
    const vedtakLagtTil = stegMap.find((steg) => steg.navn === STEG.VEDTAK_FTRL);
    if (!finnesUgyldigSide && !vedtakLagtTil) {
      setStegMap((prev) => [...prev, VEDTAK_FTRL]);
    } else {
      setStegMap([START, VIRKSOMHET, BESTEMMELSE, PERIODER, TRYGDEAVGIFT]);
    }
  }, [formSkjemaStatus]);

  const stegFaneKlasse = classNames({
    stegFane: true,
    "stegFane--aktiv": true,
  });
  const alleSynligeSteg = stegMap
    .map((steg) => {
      return {
        ...steg,
        status: formSkjemaStatus?.find((status) => status.stegNavn === steg.navn)?.dataErGyldig
          ? FANE_STATUS.OK
          : FANE_STATUS.UBEHANDLET,
        aktivtSteg: steg.navn === aktivtSteg,
      };
    })
    .filter((steg) => {
      const forrigeSteg = formSkjemaStatus?.find((status) => status.stegNavn === steg.forrigeSteg);
      if (
        steg.status === FANE_STATUS.OK ||
        steg.navn === STEG.START ||
        steg.aktivtSteg ||
        (steg.status === FANE_STATUS.UBEHANDLET &&
          forrigeSteg?.stegNavn === steg.forrigeSteg &&
          forrigeSteg.dataErGyldig)
      )
        return true;
    });

  const renderAlleSteg = stegMap.map((steg) => {
    return {
      navn: steg.navn,
      komponent: React.createElement(steg.komponent as any, {
        aktivtSteg,
        bekreft: () => {
          setAktivtSteg(steg.nesteSteg ?? "");
        },
        tilbake: () => {
          setAktivtSteg(steg.forrigeSteg ?? "");
        },
        // eslint-disable-next-line @typescript-eslint/no-shadow
        rapporterSkjema: (formSkjemaStatus: FormSkjemaStegStatus) => {
          setFormSkjemaStatus((prev) => {
            const fantEksisterendeFormSkjemaStatus = prev?.find(
              (status) => status.stegNavn === formSkjemaStatus.stegNavn
            );
            if (prev && fantEksisterendeFormSkjemaStatus) {
              return prev?.map((status) =>
                status.stegNavn === formSkjemaStatus.stegNavn ? { ...formSkjemaStatus } : status
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

  return (
    <div className="stegvelger panelSeksjon">
      <StegLinje
        steg={alleSynligeSteg}
        stegKlikk={(stegId) => setAktivtSteg(alleSynligeSteg.find((steg: any) => steg.id === stegId.toString())!!.navn)}
      />
      <Nav.Panel className={stegFaneKlasse}>
        {renderAlleSteg.map((steg) => (
          <div key={steg.navn}>{steg.komponent}</div>
        ))}
      </Nav.Panel>
    </div>
  );
};
