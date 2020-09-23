import React, { useState, Fragment, useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';

const Orgnrinput = ({
  onOrgnrFunnet,
  redigerbart,
  hentOrganisasjon,
  defaultOrgnr,
  valideringer,
  hentVedMount,
  ikkeFunnetFeilmelding,
  feilVedHentingFeilmelding,
}) => {
  const [orgnr, setOrgnr] = useState(defaultOrgnr);
  const [feil, setFeil] = useState(undefined);
  const [hasFocus, setHasFocus] = useState(false);

  const valider = organisasjonsnummer => {
    const utlostValidering = valideringer.find(({ validering }) => validering(organisasjonsnummer));
    if (utlostValidering) {
      setFeil(utlostValidering.feilmelding);
    }

    return !utlostValidering;
  };

  const leggTilOrg = async tillagtOrgnr => {
    if (!valider(tillagtOrgnr)) return;

    const action = await hentOrganisasjon(tillagtOrgnr);
    const { data } = action;
    const organisasjon = data;
    const orgFunnet = organisasjon.orgnr;
    const httpStatus = !orgFunnet && data.response.status;

    if (orgFunnet) {
      onOrgnrFunnet(organisasjon);
    } else if (httpStatus === 404) {
      setFeil(ikkeFunnetFeilmelding);
    } else {
      setFeil(feilVedHentingFeilmelding);
    }
  };

  useEffect(() => {
    if (hentVedMount) {
      leggTilOrg(orgnr);
    }
  }, [hentVedMount]);

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
              label="Org.nr."
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
  hentVedMount: PT.bool,
  valideringer: PT.arrayOf(PT.shape({
    validering: PT.func.isRequired,
    feilmelding: PT.string.isRequired,
  })).isRequired,
  ikkeFunnetFeilmelding: PT.string,
  feilVedHentingFeilmelding: PT.string,
};

Orgnrinput.defaultProps = {
  defaultOrgnr: '',
  hentVedMount: false,
  ikkeFunnetFeilmelding: 'Kunne ikke finne organisasjon',
  feilVedHentingFeilmelding: 'Feil ved henting av organisasjon',
};

export default Orgnrinput;
