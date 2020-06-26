import React, { useState, Fragment } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';

const Orgnrinput = ({
  erstatt,
  redigerbart,
  hentOrganisasjon,
  defaultOrgnr,
  preErstattValideringer,
}) => {
  const [orgnr, setOrgnr] = useState(defaultOrgnr);
  const [feil, setFeil] = useState(undefined);

  const leggTilOrg = async tillagtOrgnr => {
    const utlostValidering = preErstattValideringer.find(({ validering }) => validering(tillagtOrgnr));
    if (utlostValidering) {
      setFeil(utlostValidering.feilmelding);
      return;
    }

    /**
     * TODO: Backend svarer foreløpig med 200 selv om org ikke finnes. Må derfor sjekke responsen for å se om org faktisk eksisterer.
     */
    try {
      const action = await hentOrganisasjon(tillagtOrgnr);
      const { data: organisasjon } = action;
      const orgFunnet = !Utils._isEmpty(organisasjon);

      if (orgFunnet) {
        erstatt(organisasjon);
      } else {
        setFeil('Kunne ikke finne organisasjon');
      }
    } catch (e) {
      if (e.body.status === 404) setFeil('Kunne ikke finne organisasjon');
      else {
        Utils.logger.error(e);
        setFeil('Feil ved henting av organisasjon');
      }
    }
  };

  const onChange = e => {
    setFeil(undefined);
    setOrgnr(e.target.value);
    leggTilOrg(e.target.value);
  };

  const feilmelding = feil ? { feilmelding: feil } : undefined;

  return (
    <div className="orgnrinput">
      <Fragment>
        <Nav.Row>
          <Nav.Column xs="3">
            <Nav.Input
              label="Org. nr."
              onChange={onChange}
              value={orgnr}
              disabled={!redigerbart}
              bredde="M"
              placeholder="Skriv inn..."
              feil={feilmelding}
            />
          </Nav.Column>
        </Nav.Row>
      </Fragment>
    </div>
  );
};

Orgnrinput.propTypes = {
  erstatt: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  defaultOrgnr: PT.string,
  preErstattValideringer: PT.arrayOf(PT.shape({
    validering: PT.func.isRequired,
    feilmelding: PT.string.isRequired,
  })).isRequired,
};

Orgnrinput.defaultProps = {
  defaultOrgnr: '',
};

export default Orgnrinput;
