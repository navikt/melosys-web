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
  leggTilTekst: string | ((elementer: any[]) => string),
  redigerbart: boolean,
  redigererKomponent: ElementType,
  redigeringUtfortKomponent: ElementType,
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

type InnerEditerbartElementListeProps = WrappedFieldArrayProps & BaseProps;

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>, ownProps: InnerEditerbartElementListeProps) => ({
  settFeltVerdi: (field: string, value: any) => dispatch(change(ownProps.meta.form, field, value)),
});

const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const InnerEditerbartElementListe = ({
  leggTilTekst,
  redigerbart,
  fields,
  redigererKomponent,
  redigeringUtfortKomponent,
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
}: InnerEditerbartElementListeProps & PropsFromRedux) => {
  const editerbartElementListeCls = classNames(className);

  const leggTil = () => fields.push(hentDefaultElement());

  const innerLeggTilTekst = typeof leggTilTekst === 'function' ? leggTilTekst(fields.getAll()) : leggTilTekst;

  return (
    <div className={editerbartElementListeCls}>
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
            redigererKomponent={redigererKomponent}
            redigeringUtfortKomponent={redigeringUtfortKomponent}
            tittelTekst={tittelTekst}
            leggTilTekst={innerLeggTilTekst}
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
            redigererKomponent={redigererKomponent}
            redigeringUtfortKomponent={redigeringUtfortKomponent}
            tittelTekst={tittelTekst}
            leggTilTekst={innerLeggTilTekst}
            leggTil={leggTil}
          />
      }
    </div>
  );
};

const ConnectedInnerElementListe = connector(InnerEditerbartElementListe);

type EditerbartElementListeProps = BaseProps & {
  feltNavn: string,
};

const EditerbartElementListe = ({
  feltNavn,
  ...rest
}: EditerbartElementListeProps) => (
  <FieldArray
    component={ConnectedInnerElementListe}
    name={feltNavn}
    props={rest}
    rerenderOnEveryChange
  />
);

EditerbartElementListe.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default EditerbartElementListe;
