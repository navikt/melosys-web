import { ElementType, MouseEvent } from "react";
import { FieldArrayFieldsProps } from "redux-form";
import classNames from "classnames";
import { Button } from "@navikt/ds-react";
import { PlusCircleIcon } from "@navikt/aksel-icons";

import EditerbartElement, { SymbolsynlighetConfig } from "../editerbartElement";

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
  kanLeggeTilFlereElementer?: boolean;
  onBinClick?: (index: number) => void;
  symbolsynlighet?: SymbolsynlighetConfig;
  onLagreClick?: (e: MouseEvent) => boolean | Promise<boolean>;
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
  kanLeggeTilFlereElementer = true,
  onBinClick,
  symbolsynlighet,
  onLagreClick,
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
            <Button
              size="small"
              variant="tertiary"
              onClick={() => {
                apneRedigering();
                leggTil();
              }}
              icon={<PlusCircleIcon />}
            >
              {leggTilTekst}
            </Button>
          )}
        </>
      )
    : undefined;

  const binClickHandler = () => {
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
      onBinClick={binClickHandler}
      harData={harData()}
      symbolsynlighet={symbolsynlighet}
      visLagreKnappBareHvisHarData
      onLagreClick={onLagreClick}
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
          {redigerbart && kanLeggeTilFlereElementer && (
            <div>
              <Button size="small" variant="tertiary" onClick={leggTil} icon={<PlusCircleIcon />}>
                {leggTilTekst}
              </Button>
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
