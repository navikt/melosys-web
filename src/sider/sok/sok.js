import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import FnrValidator from '@navikt/fnrvalidator';

import withErrorHandling from '../../felleskomponenter/withErrorHandling';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';
import Fagsak from '../../felleskomponenter/oppgaveliste/fagsak';
import SorterbarListe from '../../felleskomponenter/sorterbarListe/sorterbarListe';

import { sokSelectors, sokOperations } from '../../ducks/sok';

import './sok.css';

export const Sok = ({
  sokResultat,
  children,
  sok,
}) => {
  const sokefrase = sessionStorage.getItem('sokefrase');

  useEffect(() => {
    if (sokefrase) {
      sok(sokefrase);
    }

    return () => {
      sessionStorage.removeItem('sokefrase');
    };
  }, []);

  if (!sokResultat) return null;

  const sokeFraseErFnrDnr = FnrValidator.idnr(sokefrase).status === 'valid';
  const ingenTreff = <Nav.Panel>Fant ingen saker knyttet til {sokeFraseErFnrDnr ? 'f.nr./d-nr.' : 'saksnummer' } {sokefrase}.</Nav.Panel>;

  return (
    <div className="sok">
      { children }
      <Nav.Container>
        <Nav.Row className="">
          <section className="sokresultat">
            <h1>Saksoversikt</h1>
            <h2>
              Resultater for {sokeFraseErFnrDnr ? 'f.nr./d-nr.' : 'saksnummer' } {sokefrase}{sokResultat.length > 0 ? ` - ${sokResultat[0].sammensattNavn}` : undefined}
            </h2>
            { sokResultat.length > 0 &&
              <SorterbarListe
                elementer={sokResultat}
                component={Fagsak}
                defaultChecked="nyeste"
                sortingLegend="Sorter fagsaker etter opprettelsesdato:"
                sortingPath="opprettetDato"
                radioGroupName="fagsaksortering"
              />
            }
            { sokResultat.length === 0 && ingenTreff }
          </section>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

Sok.propTypes = {
  sokResultat: MPT.FagsakSokListe.isRequired,
  children: PT.node,
  sok: PT.func.isRequired,
};

Sok.defaultProps = {
  children: null,
};

const mapStateToProps = state => ({
  sokResultat: sokSelectors.FagsakSokSelector(state),
});

const mapDispatchToProps = dispatch => ({
  sok: sokefrase => dispatch(sokOperations.sok(sokefrase)),
});

const kontekster = [
  { navn: 'saksbehandler', melding: 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' },
  { navn: 'fagsaker', melding: 'Det har oppstått en feil: Kunne ikke hente fagsaker' },
  { navn: 'oppgaver', melding: 'Det har oppstått en feil: Kunne ikke søke etter oppgaver' },
];

export default withErrorHandling(kontekster, connect(mapStateToProps, mapDispatchToProps)(Sok));
