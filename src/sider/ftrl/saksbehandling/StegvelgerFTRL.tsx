import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { FANE_STATUS, STEG } from "../../../felleskomponenter/stegvelger/stegMotor";
import * as Nav from "../../../navFrontend";
import StegLinje from "../../../felleskomponenter/stegLinje/stegLinje";
import { START, VIRKSOMHET, BESTEMMELSE, PERIODER, TRYGDEAVGIFT, VEDTAK_FTRL } from "./initialssteg";

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

  const skalViseStegIStegvelger = (steg: any) => {
    const forrigeSteg = formSkjemaStatus?.find((status) => status.stegNavn === steg.forrigeSteg);
    if (
      steg.status === FANE_STATUS.OK ||
      steg.navn === STEG.START ||
      steg.aktivtSteg ||
      (steg.status === FANE_STATUS.UBEHANDLET &&
        forrigeSteg?.stegNavn === steg.forrigeSteg &&
        forrigeSteg?.dataErGyldig)
    ) {
      return true;
    }
    return false;
  };

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
    .filter((steg) => skalViseStegIStegvelger(steg));

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
        oppdaterStatus: (formSkjemaStatus: FormSkjemaStegStatus) => {
          setFormSkjemaStatus((prev) => {
            const fantEksisterendeFormSkjemaStatus = prev?.find((status) => status.stegNavn === steg.navn);
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
