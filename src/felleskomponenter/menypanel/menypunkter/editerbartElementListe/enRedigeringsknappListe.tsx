import React, { ElementType } from "react";
import { FieldArrayFieldsProps } from "redux-form";
import classNames from "classnames";

import * as Mui from "../../../ui";
import * as Ikoner from "../../../../resources/images";

import EditerbartElement from "../editerbartElement";

import "./enRedigeringsknappListe.css";

export interface Redigerer<T> {
  redigerbart: boolean;
  overordnetFeltNavn: string;
  verdier: T;
  settVerdi: (felt: string, verdi: any) => void;
  slett: () => void;
}

export interface RedigeringUtfort<T> {
  verdier: T[];
}

export interface RedigererPreElementer {
  redigerbart: boolean;
  className?: string;
}

export interface RedigeringUtfortPreElementer {
  className?: string;
}

/*
 * Typene over burde egentlig kreves for komponent-props med ElementType<T>.
 * Fikk dessverre ikke til å bruke typescript med fieldarray i editbartElementListe, så derfor ligger de her.
 */

interface EnRedigeringsKnappListeProps<T> {
  redigerbart: boolean;
  tittelIkon?: ElementType;
  harData: () => boolean;
  fields: FieldArrayFieldsProps<T>;
  settFeltVerdi: (felt: string, verdi: any) => void;
  tittelUnderstrek: boolean;
  elementUnderstrek?: boolean;
  redigererPreElementerKomponent?: ElementType;
  redigeringUtfortPreElementerKomponent?: ElementType;
  redigererKomponent: ElementType;
  redigeringUtfortKomponent: ElementType;
  ingenDataKomponent?: ElementType;
  tittelTekst: string;
  leggTil: () => void;
  leggTilTekst: string;
  onBinClick?: (index: number) => void;
}

function EnRedigeringsKnappListe<T>({
  redigerbart,
  tittelIkon,
  harData,
  fields,
  settFeltVerdi,
  tittelUnderstrek,
  elementUnderstrek = false,
  redigererPreElementerKomponent,
  redigeringUtfortPreElementerKomponent,
  redigererKomponent,
  redigeringUtfortKomponent,
  ingenDataKomponent,
  tittelTekst,
  leggTil,
  leggTilTekst,
  onBinClick,
}: EnRedigeringsKnappListeProps<T>) {
  const RedigererKomponent = redigererKomponent;
  const RedigeringUtfortKomponent = redigeringUtfortKomponent;
  const IngenDataKomponent = ingenDataKomponent;
  const RedigererPreElementerKomponent = redigererPreElementerKomponent;
  const RedigeringUtfortPreElementerKomponent = redigeringUtfortPreElementerKomponent;

  const elementer = fields.getAll();

  const ingenDataRender = IngenDataKomponent
    ? (apneRedigering: () => void) => (
        <>
          <div className="ingen__data__container">
            <IngenDataKomponent />
          </div>
          {redigerbart && (
            <Mui.Knappelenke
              onClick={() => {
                apneRedigering();
                leggTil();
              }}
              ikon={Ikoner.Add}
            >
              {leggTilTekst}
            </Mui.Knappelenke>
          )}
        </>
      )
    : undefined;

  const slettElementerOgPreElementer = () => {
    if (onBinClick) onBinClick(-1);
    fields.removeAll();
  };

  return (
    <EditerbartElement
      className="en__redigeringsknapp__liste"
      redigerbart={redigerbart}
      tittel={tittelTekst}
      tittelIkon={tittelIkon}
      tittelUnderstrek={tittelUnderstrek}
      onBinClick={slettElementerOgPreElementer}
      harData={harData()}
      hentNyStatusVedHarData={false}
      visLagreKnappBareHvisHarData
      redigererRender={() => (
        <div>
          {RedigererPreElementerKomponent && (
            <RedigererPreElementerKomponent className="redigerer-pre-elementer-komponent" redigerbart={redigerbart} />
          )}
          {elementer.map((element, index) => {
            const overordnetFeltNavn = `${fields.name}[${index}]`;
            const settVerdi = (feltNavn: string, verdi: any) =>
              settFeltVerdi(`${overordnetFeltNavn}.${feltNavn}`, verdi);
            const slett = () => fields.remove(index);

            const elementContainerCls = classNames({ element__container__understrek: elementUnderstrek });

            return (
              /* eslint-disable-next-line react/no-array-index-key */
              <div className={elementContainerCls} key={index}>
                <RedigererKomponent
                  redigerbart={redigerbart}
                  overordnetFeltNavn={overordnetFeltNavn}
                  verdier={element}
                  settVerdi={settVerdi}
                  slett={slett}
                />
              </div>
            );
          })}
          {redigerbart && (
            <div>
              <Mui.Knappelenke onClick={leggTil} ikon={Ikoner.Add}>
                {leggTilTekst}
              </Mui.Knappelenke>
            </div>
          )}
        </div>
      )}
      redigeringUtfortRender={() => (
        <>
          {RedigeringUtfortPreElementerKomponent && (
            <RedigeringUtfortPreElementerKomponent className="redigering-utfort-pre-elementer-komponent" />
          )}
          <RedigeringUtfortKomponent verdier={elementer} />
        </>
      )}
      ingenDataRender={ingenDataRender}
    />
  );
}

export default EnRedigeringsKnappListe;
