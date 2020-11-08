import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { FieldArray, change } from 'redux-form';
import classNames from 'classnames';

import * as Mui from '../../../ui';
import * as Ikoner from '../../../../resources/images';

import EditableElement from '../editableElement';

import './editableElementListe.css';

export const InnerEditableElementListe = ({
  leggTilTekst,
  redigerbart,
  fields,
  elementKomponentRedigerer,
  elementKomponentRedigeringUtfort,
  defaultElement,
  className,
  settFeltVerdi,
  hentNavn,
  tittelTekst,
  harData,
  tittelIkon,
  elementUnderstrek,
}) => {
  const EditableElementListeCls = classNames('editableElementListe', className);
  const elementContainerCls = classNames('elementContainer', { understrek: elementUnderstrek });

  const elementer = fields.getAll();
  const leggTil = () => fields.push(defaultElement);
  const ElementKomponentRedigerer = elementKomponentRedigerer;
  const ElementKomponentRedigeringUtfort = elementKomponentRedigeringUtfort;

  return (
    <div className={EditableElementListeCls}>
      {
        elementer.map((element, index) => {
          const slett = () => fields.remove(index);
          const overordnetFeltNavn = `${fields.name}[${index}]`;
          const settVerdi = (feltNavn, verdi) => settFeltVerdi(`${overordnetFeltNavn}.${feltNavn}`, verdi);
          const navn = hentNavn(element);

          return (
            /* eslint-disable-next-line react/no-array-index-key */
            <div className={elementContainerCls} key={index}>
              <EditableElement
                redigerbart={redigerbart}
                harData={harData(element)}
                tittel={`${tittelTekst}${navn ? `: ${navn}` : ''}`}
                tittelIkon={tittelIkon}
                tittelUnderstrek
                hentNyStatusVedHarData={false}
                binClickHandler={slett}
                redigererRender={() => <ElementKomponentRedigerer
                  redigerbart={redigerbart}
                  overordnetFeltNavn={overordnetFeltNavn}
                  verdier={element}
                  settVerdi={settVerdi}
                />}
                redigeringUtfortRender={() => <ElementKomponentRedigeringUtfort
                  verdier={element}
                />}
              />
            </div>
          );
        })
      }
      {
        redigerbart &&
        <div className="leggTilKnapp">
          <Mui.Knappelenke
            onClick={leggTil}
            ikon={Ikoner.Add}
          >
            {leggTilTekst}
          </Mui.Knappelenke>
        </div>
      }
    </div>
  );
};

InnerEditableElementListe.propTypes = {
  leggTilTekst: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  fields: PT.object.isRequired,
  elementKomponentRedigerer: PT.elementType.isRequired,
  elementKomponentRedigeringUtfort: PT.elementType.isRequired,
  elementClassName: PT.string,
  defaultElement: PT.any,
  className: PT.string,
  settFeltVerdi: PT.func.isRequired,
  hentNavn: PT.func.isRequired,
  tittelTekst: PT.string.isRequired,
  harData: PT.func.isRequired,
  tittelIkon: PT.elementType.isRequired,
  elementUnderstrek: PT.bool,
};

InnerEditableElementListe.defaultProps = {
  elementClassName: undefined,
  defaultElement: {},
  className: undefined,
  elementUnderstrek: false,
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  settFeltVerdi: (field, value) => dispatch(change(ownProps.meta.form, field, value)),
});

const ConnectedInnerElementListe = connect(null, mapDispatchToProps)(InnerEditableElementListe);

const EditableElementListe = ({
  feltNavn,
  ...rest
}) => (
  <FieldArray
    component={ConnectedInnerElementListe}
    name={feltNavn}
    props={rest}
    rerenderOnEveryChange
  />
);

EditableElementListe.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default EditableElementListe;
