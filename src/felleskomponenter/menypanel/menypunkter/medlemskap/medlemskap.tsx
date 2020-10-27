import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MedlemskapsPeriode } from 'Domene';
import { RootState } from 'AppTypes';

import * as KV from '../../../../kodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';

import { behandlingerSelectors } from '../../../../ducks/behandlinger';

import ExpandableList from '../../../expandablelist';

import './medlemskap.css';

interface MedlemskapEnkeltPeriodeProps {
  enkeltPeriode: MedlemskapsPeriode,
}

/** MedlemskapEnkeltPeriode inneholdet ett enkelt medlemskap. Hver søker kan ha
 * flere medlemskap. Se Confluence for definisjon av "medlemskap".
 *
 */
export function MedlemskapEnkeltPeriode({ enkeltPeriode }: MedlemskapEnkeltPeriodeProps) {
  const {
    periode,
    status,
    grunnlagstype,
    land,
  } = enkeltPeriode;

  const fom = Utils.dato.formatterDatoTilNorsk(periode.fom);
  const tom = Utils.dato.formatterDatoTilNorsk(periode.tom);

  return (
    <div className="medlemskap__enkelt" aria-label="Enkelt medlemskap">
      <Nav.Row>
        <Nav.Column xs="3">{fom}</Nav.Column>
        <Nav.Column xs="3">{tom}</Nav.Column>
        <Nav.Column xs="6">
          <dl>
            <div>
              <dt>Lovvalgsland:</dt>
              <dd>{KV.objektTilTerm(land)}</dd>
            </div>
            <div>
              <dt>Status:</dt>
              <dd>{KV.objektTilTerm(status)}</dd>
            </div>
            <div>
              <dt>Grunnlagshjemmel:</dt>
              <dd>{KV.objektTilTerm(grunnlagstype)}</dd>
            </div>
          </dl>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
}

interface MedlemskapGruppeProps {
  perioder: MedlemskapsPeriode[],
  overskrift: string,
}

/** En MedlemskapGruppe er en gruppering eller samling av flere medlemskap
 * som har samme status eller type, feks "AVVIST", "PERIODE MED MEDLEMSKAP" eller liknende. Grupperingen
 * gjøres i MedlemskapSelector.
 *
 * Målet med grupperingen er at saksbehandler raskere skal kunne finne frem til relevante perioder
 * hvor søkeren har eller ikke har medlemskap. Dette kan være avgjørende for vurdering av søknaden.
 *
 */
export function MedlemskapGruppe(props: MedlemskapGruppeProps) {
  const { perioder, overskrift = '' } = props;

  return (
    <div>
      <Nav.typo.Undertittel className="medlemskap__gruppeoverskrift">{overskrift}</Nav.typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="3">Fra og med</Nav.Column>
        <Nav.Column xs="3">Til og med</Nav.Column>
      </Nav.Row>
      <section className="medlemskapgruppe__liste">
        {
          perioder.length > 0 &&
          <ExpandableList
            elements={perioder}
            renderElement={periode => <MedlemskapEnkeltPeriode enkeltPeriode={periode} />}
            idFromElement={periode => periode.periodeID}
            amountOfItemsCollapsed={2}
            expandable={perioder.length > 2}
            btnTextCollapsed="Vis flere"
            btnTextExpanded="Vis færre"
            chevron
          />
        }
        { perioder.length === 0 && '(ingen data funnet)'}
      </section>
    </div>
  );
}

const mapStateToProps = (state: RootState) => ({
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

/** Dette er hoved-komponenten for Medlemskap.
 *
 */
export const Medlemskap = (props: PropsFromRedux) => {
  const { medlemskap } = props;

  return (
    <div className="medlemskap panelSeksjon">
      <MedlemskapGruppe perioder={medlemskap.perioderMed} overskrift="Perioder med medlemskap" />
      <MedlemskapGruppe perioder={medlemskap.perioderUten} overskrift="Perioder uten medlemskap" />
    </div>
  );
};

export default connector(Medlemskap);
