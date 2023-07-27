import { ElementType, MouseEvent } from "react";
import { FieldArrayFieldsProps } from "redux-form";
import classNames from "classnames";

import * as Mui from "../../../ui";
import * as Ikoner from "../../../../resources/images";

import EditerbartElement, { visAlltidBinSymbolsynlighet } from "../editerbartElement";

import "./flereRedigeringsknapperListe.css";

interface FlereRedigeringsKnapperListeProps<T> {
  redigerbart: boolean;
  tittelIkon?: ElementType;
  hentNavn?: (element: T) => string;
  harData: (element: T) => boolean;
  fields: FieldArrayFieldsProps<T>;
  settFeltVerdi: (felt: string, verdi: any) => void;
  elementUnderstrek?: boolean;
  redigererKomponent: ElementType;
  redigeringUtfortKomponent: ElementType;
  ingenDataKomponent?: ElementType;
  tittelTekst: string;
  leggTil: () => void;
  leggTilTekst: string;
  onBinClick?: (index: number) => void;
  onLagreClick?: (e: MouseEvent) => boolean | Promise<boolean>;
}

function FlereRedigeringsKnapperListe<T>({
  redigerbart,
  tittelIkon,
  hentNavn,
  harData,
  fields,
  settFeltVerdi,
  elementUnderstrek = false,
  redigererKomponent,
  redigeringUtfortKomponent,
  ingenDataKomponent,
  tittelTekst,
  leggTil,
  leggTilTekst,
  onBinClick,
  onLagreClick,
}: FlereRedigeringsKnapperListeProps<T>) {
  const RedigererKomponent = redigererKomponent;
  const RedigeringUtfortKomponent = redigeringUtfortKomponent;
  const IngenDataKomponent = ingenDataKomponent;

  const elementer = fields.getAll();

  return (
    <div className="flere__redigeringsknapper__liste">
      {elementer.map((element, index) => {
        const slett = () => {
          if (onBinClick) onBinClick(index);
          fields.remove(index);
        };
        const overordnetFeltNavn = `${fields.name}[${index}]`;
        const settVerdi = (feltNavn: string, verdi: any) => settFeltVerdi(`${overordnetFeltNavn}.${feltNavn}`, verdi);
        const navn = hentNavn ? hentNavn(element) : "";

        const elementContainerCls = classNames("elementer__container", { understrek: elementUnderstrek });

        return (
          /* eslint-disable-next-line react/no-array-index-key */
          <div className={elementContainerCls} key={index}>
            <EditerbartElement
              redigerbart={redigerbart}
              harData={harData(element)}
              tittel={`${tittelTekst}${navn ? `: ${navn}` : ""}`}
              tittelIkon={tittelIkon}
              tittelUnderstrek
              onBinClick={slett}
              symbolsynlighet={visAlltidBinSymbolsynlighet}
              onLagreClick={onLagreClick}
              redigererRender={() => (
                <RedigererKomponent
                  redigerbart={redigerbart}
                  overordnetFeltNavn={overordnetFeltNavn}
                  verdier={element}
                  settVerdi={settVerdi}
                />
              )}
              redigeringUtfortRender={() => <RedigeringUtfortKomponent verdier={element} />}
              ingenDataRender={IngenDataKomponent ? () => <IngenDataKomponent /> : undefined}
            />
          </div>
        );
      })}
      {redigerbart && (
        <div className="legg__til__knapp">
          <Mui.Lenkeknapp onClick={leggTil} ikon={Ikoner.Add}>
            {leggTilTekst}
          </Mui.Lenkeknapp>
        </div>
      )}
    </div>
  );
}

export default FlereRedigeringsKnapperListe;
