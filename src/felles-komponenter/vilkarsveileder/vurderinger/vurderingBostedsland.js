import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

import LandVelger from '../../skjema/landvelger/';

import './vurderingBostedsland.css';
import * as MPT from '../../../proptypes';

const uuid = require('uuid/v4');

export const VurderingBostedslandTyper = {
  NORGE: 'NORGE',
  ANNET: 'ANNET',
};

const Avklaringer = ({ avklaringer }) => (
  <div>
    <Nav.Element>Vurder bosted manuelt:</Nav.Element>
    <ul className="betingelser__liste">
      {
        avklaringer.map(({ term, status }) => {
          let iconClassName;
          if (status === true) {
            iconClassName = 'liste__element--oppfylt';
          } else if (status === false) {
            iconClassName = 'liste__element--ikkeoppfylt';
          } else {
            iconClassName = 'liste__element--varsel';
          }
          const cl = classnames({ liste__element: true, [iconClassName]: true });
          return (<li key={uuid()} className={cl}>{term}</li>);
        })
      }
    </ul>
  </div>
);

Avklaringer.propTypes = {
  avklaringer: PT.array,
};

Avklaringer.defaultProps = {
  avklaringer: [],
};


/** Vises dersom API returnerte en liste over avklaringer, dvs at ingen
 * informasjon mangler.
 */
const AvklaringsListe = ({
  tilstand: { avklaringer },
}) => (
  <div>
    <Avklaringer avklaringer={avklaringer} />
  </div>
);

AvklaringsListe.propTypes = {
  tilstand: PT.object.isRequired,
};

/** Hovedklasse som eksponeres ut.
 * ------------------------------
 */
const VurderingBostedsland = props => {
  const {
    bekreftOgFortsett, tilstand, begrunnelser,
  } = props;
  const { visLandListe } = tilstand;

  return (
    <div className="vurderingBostedsland">
      <Nav.Undertittel>Vurdering av bosted</Nav.Undertittel>
      <div>
        <div className="vurderingBostedsland__skjemafelt">
          <Nav.Row>
            <Nav.Column xs="12">
              <AvklaringsListe tilstand={tilstand} />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Bostedsland er:">
                <Skjema.Radio feltNavn="faktaavklaringBostedTerritorie" value={VurderingBostedslandTyper.NORGE} label="Norge" />
                <Skjema.Radio feltNavn="faktaavklaringBostedTerritorie" value={VurderingBostedslandTyper.ANNET} label="Annet" />
                {visLandListe && <LandVelger label="Velg land:" feltNavn="faktaavklaringBostedLand" multiland={false} />}
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Begrunnelse:">
                <Skjema.ListeVelger
                  feltNavn="faktaavklaringBostedBegrunnelser"
                  muligeValg={begrunnelser}
                  label="Legg til begrunnelse:"
                  gruppe
                  tillatFritekst={false}
                />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
        </div>
      </div>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingBostedsland.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  vurdering: PT.object,
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
};

VurderingBostedsland.defaultProps = {
  tilstand: {},
  vurdering: {},
  begrunnelser: [],
};

export default VurderingBostedsland;
