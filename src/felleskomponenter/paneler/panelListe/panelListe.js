import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { FieldArray, change } from 'redux-form';
import classNames from 'classnames';

import * as Nav from '../../../utils/navFrontend';
import * as Ikoner from '../../../resources/images';

import './panelListe.css';

export const InnerPanelListe = ({
  leggTilTekst,
  slettTekst,
  redigerbart,
  fields,
  elementKomponent,
  elementClassName,
  defaultElement,
  className,
  settFeltVerdi,
}) => {
  const panelListeCl = classNames('panelListe', className);

  const elementer = fields.getAll();
  const leggTil = () => fields.push(defaultElement);
  const ElementKomponent = elementKomponent;

  return (
    <div className={panelListeCl}>
      {
        elementer.map((element, index) => {
          const slett = () => fields.remove(index);
          const overordnetFeltNavn = `${fields.name}[${index}]`;
          const settVerdi = (feltNavn, verdi) => settFeltVerdi(`${overordnetFeltNavn}.${feltNavn}`, verdi);

          return (
            /* eslint-disable-next-line react/no-array-index-key */
            <div className="elementContainer" key={index}>
              <ElementKomponent
                redigerbart={redigerbart}
                overordnetFeltNavn={overordnetFeltNavn}
                verdier={element}
                className={elementClassName}
                settVerdi={settVerdi}
              />
              {
                redigerbart &&
                <Nav.Lenker onClick={slett}>
                  <Ikoner.Bin />
                  <span>{slettTekst}</span>
                </Nav.Lenker>
              }
            </div>
          );
        })
      }
      <Nav.Knapp
        className="leggTilKnapp"
        disabled={!redigerbart}
        onClick={leggTil}
      >
        {leggTilTekst}
      </Nav.Knapp>
    </div>
  );
};

InnerPanelListe.propTypes = {
  leggTilTekst: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  fields: PT.object.isRequired,
  slettTekst: PT.string.isRequired,
  elementKomponent: PT.elementType.isRequired,
  elementClassName: PT.string,
  defaultElement: PT.any,
  className: PT.string,
  settFeltVerdi: PT.func.isRequired,
};

InnerPanelListe.defaultProps = {
  elementClassName: undefined,
  defaultElement: {},
  className: undefined,
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  settFeltVerdi: (field, value) => dispatch(change(ownProps.meta.form, field, value)),
});

const ConnectedInnerPanelListe = connect(null, mapDispatchToProps)(InnerPanelListe);

const PanelListe = ({
  feltNavn,
  ...rest
}) => (
  <FieldArray
    component={ConnectedInnerPanelListe}
    name={feltNavn}
    props={rest}
    rerenderOnEveryChange
  />
);

PanelListe.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default PanelListe;
