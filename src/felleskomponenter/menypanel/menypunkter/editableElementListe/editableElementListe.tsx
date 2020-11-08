import React, { ElementType } from 'react';
import PT from 'prop-types';
import { connect, ConnectedProps } from 'react-redux';
import { FieldArray, change, WrappedFieldArrayProps } from 'redux-form';
import classNames from 'classnames';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { RootState } from 'AppTypes';

import FlereRedigeringsknapperListe from './flereRedigeringsknapperListe';
import EnRedigeringsknappListe from './enRedigeringsknappListe';

interface BaseProps {
  leggTilTekst: string,
  redigerbart: boolean,
  elementKomponentRedigerer: ElementType,
  elementKomponentRedigeringUtfort: ElementType,
  hentDefaultElement: () => any,
  className?: string,
  hentNavn?: (element: any) => string,
  tittelTekst: string,
  harData: (elementListe: any[], element: any) => boolean,
  tittelIkon: ElementType,
  tittelUnderstrek?: boolean,
  elementUnderstrek?: boolean,
  flereRedigeringsknapper?: boolean,
}

type InnerEditableElementListeProps = WrappedFieldArrayProps & BaseProps;

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>, ownProps: InnerEditableElementListeProps) => ({
  settFeltVerdi: (field: string, value: any) => dispatch(change(ownProps.meta.form, field, value)),
});

const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const InnerEditableElementListe = ({
  leggTilTekst,
  redigerbart,
  fields,
  elementKomponentRedigerer,
  elementKomponentRedigeringUtfort,
  hentDefaultElement,
  className,
  hentNavn,
  tittelTekst,
  harData,
  tittelIkon,
  tittelUnderstrek = false,
  elementUnderstrek,
  flereRedigeringsknapper = true,
  settFeltVerdi,
}: InnerEditableElementListeProps & PropsFromRedux) => {
  const editableElementListeCls = classNames(className);

  const leggTil = () => fields.push(hentDefaultElement());

  return (
    <div className={editableElementListeCls}>
      {
        flereRedigeringsknapper ?
          <FlereRedigeringsknapperListe
            redigerbart={redigerbart}
            tittelIkon={tittelIkon}
            hentNavn={hentNavn}
            harData={(element: any) => harData(fields.getAll(), element)}
            fields={fields}
            settFeltVerdi={settFeltVerdi}
            elementUnderstrek={elementUnderstrek}
            elementKomponentRedigerer={elementKomponentRedigerer}
            elementKomponentRedigeringUtfort={elementKomponentRedigeringUtfort}
            tittelTekst={tittelTekst}
            leggTilTekst={leggTilTekst}
            leggTil={leggTil}
          />
          :
          <EnRedigeringsknappListe
            redigerbart={redigerbart}
            tittelIkon={tittelIkon}
            fields={fields}
            harData={() => harData(fields.getAll(), null)}
            settFeltVerdi={settFeltVerdi}
            tittelUnderstrek={tittelUnderstrek}
            elementUnderstrek={elementUnderstrek}
            elementKomponentRedigerer={elementKomponentRedigerer}
            elementKomponentRedigeringUtfort={elementKomponentRedigeringUtfort}
            tittelTekst={tittelTekst}
            leggTilTekst={leggTilTekst}
            leggTil={leggTil}
          />
      }
    </div>
  );
};

const ConnectedInnerElementListe = connector(InnerEditableElementListe);

type EditableElementListeProps = BaseProps & {
  feltNavn: string,
};

const EditableElementListe = ({
  feltNavn,
  ...rest
}: EditableElementListeProps) => (
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
