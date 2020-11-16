import React, { ElementType } from 'react';
import { FieldArrayFieldsProps } from 'redux-form';
import classNames from 'classnames';

import * as Mui from '../../../ui';
import * as Ikoner from '../../../../resources/images';

import EditableElement from '../editableElement';

import './enRedigeringsknappListe.css';

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
    <EditableElement
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

              const elementContainerCls = classNames({ understrek: elementUnderstrek });

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
