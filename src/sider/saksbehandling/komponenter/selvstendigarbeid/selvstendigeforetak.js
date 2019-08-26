import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import EnkeltForetak from './enkeltforetak';

import './selvstendigArbeid.css';

class SelvstendigeForetak extends Component {
  componentDidUpdate(prevProps) {
    const { fields: oldFields } = prevProps;
    const { oppdaterSoknadState, skjema, fields } = this.props;

    // Sjekk om listen over selvstendig næringsdrivende
    // har oppdatert seg siden sist. I såfall, oppdaterSoknadState.
    if (fields.length !== oldFields.length) {
      oppdaterSoknadState(skjema);
    }
  }

  render() {
    const {
      redigerbart, fields, organisasjoner, hentOrganisasjon, oppdaterSoknadState, skjema,
    } = this.props;

    return (
      <div>
        {fields.map((foretaket, index) => (
          <EnkeltForetak
            key={foretaket}
            orgnr={fields.get(index).orgnr}
            organisasjon={organisasjoner.find(organisasjon => organisasjon.orgnr === fields.get(index).orgnr) || null}
            foretaket={foretaket}
            posisjon={index + 1}
            hentOrganisasjon={hentOrganisasjon}
            slettForetak={() => fields.remove(index)}
            oppdaterSoknadState={oppdaterSoknadState}
            skjema={skjema}
            redigerbart={redigerbart}
          />))
        }
        <div className="leggTilForetak">
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Knapp disabled={!redigerbart} mini onClick={() => fields.push({})}>Legg til nytt foretak</Nav.Knapp>
            </Nav.Column>
          </Nav.Row>
        </div>
      </div>
    );
  }
}

SelvstendigeForetak.propTypes = {
  redigerbart: PT.bool.isRequired,
  fields: PT.object.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  organisasjoner: PT.array.isRequired,
  oppdaterSoknadState: PT.func.isRequired,
  skjema: PT.object.isRequired,
};


export default SelvstendigeForetak;
