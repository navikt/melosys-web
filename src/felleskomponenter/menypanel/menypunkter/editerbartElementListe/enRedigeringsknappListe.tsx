import React, { ElementType } from 'react';
import { FieldArrayFieldsProps } from 'redux-form';
import classNames from 'classnames';

import * as Mui from '../../../ui';
import * as Ikoner from '../../../../resources/images';

import EditerbartElement from '../editerbartElement';

import './enRedigeringsknappListe.css';

export interface Redigerer<T> {
  redigerbart: boolean,
  overordnetFeltNavn: string,
  verdier: T,
  settVerdi: (felt: string, verdi: any) => void,
  slett: () => void,
}

export interface RedigeringUtfort<T> {
  verdier: T[],
}

/**
 * Typene over burde egentlig kreves for komponent-props med ElementType<T>.
 * Fikk dessverre ikke til å bruke typescript med fieldarray i editbartElementListe, så derfor ligger de her.
 */

interface EnRedigeringsKnappListeProps<T> {
  redigerbart: boolean,
  tittelIkon: ElementType,
  harData: () => boolean,
  fields: FieldArrayFieldsProps<T>,
  settFeltVerdi: (felt: string, verdi: any) => void,
  tittelUnderstrek: boolean,
  elementUnderstrek?: boolean,
  redigererKomponent: ElementType,
  redigeringUtfortKomponent: ElementType,
  tittelTekst: string,
  leggTil: () => void,
  leggTilTekst: string,
}

function EnRedigeringsKnappListe<T>({
  redigerbart,
  tittelIkon,
  harData,
  fields,
  settFeltVerdi,
  tittelUnderstrek,
  elementUnderstrek = false,
  redigererKomponent,
  redigeringUtfortKomponent,
  tittelTekst,
  leggTil,
  leggTilTekst,
}: EnRedigeringsKnappListeProps<T>) {
  const RedigererKomponent = redigererKomponent;
  const RedigeringUtfortKomponent = redigeringUtfortKomponent;

  const elementer = fields.getAll();

  return (
    <EditerbartElement
      className="en__redigeringsknapp__liste"
      redigerbart={redigerbart}
      tittel={tittelTekst}
      tittelIkon={tittelIkon}
      tittelUnderstrek={tittelUnderstrek}
      onBinClick={fields.removeAll}
      harData={harData()}
      hentNyStatusVedHarData={false}
      visLagreKnappBareHvisHarData
      redigererRender={() => (
        <div>
          {
            elementer.map((element, index) => {
              const overordnetFeltNavn = `${fields.name}[${index}]`;
              const settVerdi = (feltNavn: string, verdi: any) => settFeltVerdi(`${overordnetFeltNavn}.${feltNavn}`, verdi);
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
            })
          }
          {
            redigerbart &&
            <div>
              <Mui.Knappelenke
                onClick={leggTil}
                ikon={Ikoner.Add}
              >
                {leggTilTekst}
              </Mui.Knappelenke>
            </div>
          }
        </div>
      )}
      redigeringUtfortRender={() => <RedigeringUtfortKomponent
        verdier={elementer}
      />}
    />
  );
}

export default EnRedigeringsKnappListe;
