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
  elementKomponentRedigerer: ElementType,
  elementKomponentRedigeringUtfort: ElementType,
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
  elementKomponentRedigerer,
  elementKomponentRedigeringUtfort,
  tittelTekst,
  leggTil,
  leggTilTekst,
}: EnRedigeringsKnappListeProps<T>) {
  const ElementKomponentRedigerer = elementKomponentRedigerer;
  const ElementKomponentRedigeringUtfort = elementKomponentRedigeringUtfort;

  const elementer = fields.getAll();

  return (
    <EditableElement
      className="en__redigeringsknapp__liste"
      redigerbart={redigerbart}
      tittel={tittelTekst}
      tittelIkon={tittelIkon}
      tittelUnderstrek={tittelUnderstrek}
      binClickHandler={fields.removeAll}
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
                <div className={elementContainerCls}>
                  <ElementKomponentRedigerer
                    /* eslint-disable-next-line react/no-array-index-key */
                    key={index}
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
            <div className="legg__til__knapp">
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
      redigeringUtfortRender={() => <ElementKomponentRedigeringUtfort
        verdier={elementer}
      />}
    />
  );
}

export default EnRedigeringsKnappListe;
