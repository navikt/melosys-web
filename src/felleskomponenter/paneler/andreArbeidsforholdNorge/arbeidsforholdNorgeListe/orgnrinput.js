import React, { useState, Fragment, useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';

const Orgnrinput = ({
  onOrgnrFunnet,
  redigerbart,
  hentOrganisasjon,
  defaultOrgnr,
  valideringer,
  validerVedMount,
}) => {
  const [orgnr, setOrgnr] = useState(defaultOrgnr);
  const [feil, setFeil] = useState(undefined);
  const [hasFocus, setHasFocus] = useState(false);

  const valider = organisasjonsnummer => {
    const utlostValidering = valideringer.find(({ validering }) => validering(organisasjonsnummer));
    if (utlostValidering) {
      setFeil(utlostValidering.feilmelding);
    }
  };

  useEffect(() => {
    if (validerVedMount) {
      valider(orgnr);
    }
  }, [validerVedMount]);

  const leggTilOrg = async tillagtOrgnr => {
    valider(tillagtOrgnr);

    const action = await hentOrganisasjon(tillagtOrgnr);
    const { data } = action;
    const organisasjon = data;
    const orgFunnet = organisasjon.orgnr;
    const httpStatus = !orgFunnet && data.response.status;

    if (orgFunnet) {
      onOrgnrFunnet(organisasjon);
    } else if (httpStatus === 404) {
      setFeil('Kunne ikke finne organisasjon');
    } else {
      setFeil('Feil ved henting av organisasjon');
    }
  };

  const onChange = e => {
    setFeil(undefined);
    setOrgnr(e.target.value);
    leggTilOrg(e.target.value);
  };

  const feilmelding = !hasFocus && feil ? { feilmelding: feil } : undefined;

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
              onFocus={() => setHasFocus(true)}
              onBlur={() => setHasFocus(false)}
            />
          </Nav.Column>
        </Nav.Row>
      </Fragment>
    </div>
  );
};

Orgnrinput.propTypes = {
  onOrgnrFunnet: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  defaultOrgnr: PT.string,
  validerVedMount: PT.bool,
  valideringer: PT.arrayOf(PT.shape({
    validering: PT.func.isRequired,
    feilmelding: PT.string.isRequired,
  })).isRequired,
};

Orgnrinput.defaultProps = {
  defaultOrgnr: '',
  validerVedMount: false,
};

export default Orgnrinput;
