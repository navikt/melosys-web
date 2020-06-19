import React, { useState, Fragment } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';
import * as Organisasjon from '../../../skjema/validering/generisk/organisasjon';

const LeggTilEkstraArbeidsforholdNorge = ({
  leggTil,
  leggTilTekst,
  redigerbart,
  hentOrganisasjon,
}) => {
  const [visInput, setVisInput] = useState(false);
  const [orgnr, setOrgnr] = useState('');
  const [feil, setFeil] = useState(undefined);

  const onChange = e => {
    setFeil(undefined);
    setOrgnr(e.target.value);
  };

  const onBlur = async () => {
    if (!Organisasjon.erOrgnrGyldig(orgnr)) {
      setFeil('Ugyldig org. nr');
      return;
    }

    /**
     * TODO: Backend svarer foreløpig med 200 selv om org ikke finnes. Må derfor sjekke responsen for å se om org faktisk eksisterer.
     */
    try {
      const action = await hentOrganisasjon(orgnr);
      const { data: organisasjon } = action;
      const orgFunnet = !Utils._isEmpty(organisasjon);

      if (orgFunnet) {
        setFeil(undefined);
        setVisInput(false);
        leggTil(organisasjon);
        setOrgnr('');
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

  const feilmelding = feil ? { feilmelding: feil } : undefined;

  return (
    <Fragment>
      {
        !visInput &&
        <Nav.Knapp
          onClick={() => setVisInput(true)}
          disabled={!redigerbart}
        >
          {leggTilTekst}
        </Nav.Knapp>
      }
      {
        visInput &&
        <Nav.Input
          label="Org. nr"
          onChange={onChange}
          value={orgnr}
          onBlur={onBlur}
          disabled={!redigerbart}
          bredde="M"
          placeholder="Skriv inn..."
          feil={feilmelding}
        />
      }
    </Fragment>
  );
};

LeggTilEkstraArbeidsforholdNorge.propTypes = {
  leggTil: PT.func.isRequired,
  leggTilTekst: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  hentOrganisasjon: PT.func.isRequired,
};

export default LeggTilEkstraArbeidsforholdNorge;
