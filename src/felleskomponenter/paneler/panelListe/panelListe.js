import React from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';
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
}) => {
  const panelListeCl = classNames('panelListe', className);

  const elementer = fields.getAll();
  const leggTil = () => fields.push(defaultElement);
  const ElementKomponent = elementKomponent;

  return (
    <div className={panelListeCl}>
      {
        elementer.map((enkeltElement, index) => {
          const slett = () => fields.remove(index);
          const overordnetFeltNavn = `${fields.name}[${index}]`;

          return (
            /* eslint-disable-next-line react/no-array-index-key */
            <div className="elementContainer" key={index}>
              <ElementKomponent
                redigerbart={redigerbart}
                overordnetFeltNavn={overordnetFeltNavn}
                className={elementClassName}
              />
              {
                redigerbart &&
                <Nav.Lenker onClick={slett}>
                  <img src={Ikoner.Bin} alt="Slett" />
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
};

InnerPanelListe.defaultProps = {
  elementClassName: undefined,
  defaultElement: {},
  className: undefined,
};

const PanelListe = ({
  feltNavn,
  ...rest
}) => (
  <FieldArray
    component={InnerPanelListe}
    name={feltNavn}
    props={rest}
  />
);

PanelListe.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default PanelListe;
