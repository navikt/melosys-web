import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MedlPeriode } from 'Domene';
import { RootState } from 'AppTypes';

import * as KV from '../../../../kodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';

import { behandlingerSelectors } from '../../../../ducks/behandlinger';

import ExpandableList from '../../../expandablelist';

import './medlemskap.css';

interface MedlemskapEnkeltPeriodeProps {
  enkeltPeriode: MedlPeriode,
}

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
          <Nav.Row>
            <Nav.Column xs="6">
              <Nav.typo.Normaltekst>Lovvalgsland:</Nav.typo.Normaltekst>
              <Nav.typo.Normaltekst>Status:</Nav.typo.Normaltekst>
              <Nav.typo.Normaltekst>Grunnlagshjemmel:</Nav.typo.Normaltekst>
            </Nav.Column>
            <Nav.Column xs="6">
              <Nav.typo.Element>{KV.objektTilTerm(land)}</Nav.typo.Element>
              <Nav.typo.Element>{KV.objektTilTerm(status)}</Nav.typo.Element>
              <Nav.typo.Element>{KV.objektTilTerm(grunnlagstype)}</Nav.typo.Element>
            </Nav.Column>
          </Nav.Row>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
}

interface MedlemskapGruppeProps {
  perioder: MedlPeriode[],
  overskrift: string,
}

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
            btnTextCollapsed="Vis flere"
            btnTextExpanded="Vis færre"
            chevron
            dividers
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
