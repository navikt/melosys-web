import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import OrganisasjonsAdresse from '../../adresser/organisasjonsAdresse';

import { erOrgnrGyldig } from '../../skjema/validering/generisk/organisasjon';

/** Komponent for å vise organisasjonen som ble funnet ved søk.
 *
 * @param leggTil
 * @param organisasjon
 * @returns {*}
 * @constructor
 */
const FunnetOrganisasjon = ({ leggTil, organisasjon }) => (
  <Nav.Panel border>
    <Nav.typo.Undertittel>Fant følgende organisasjon:</Nav.typo.Undertittel>
    <OrganisasjonsAdresse className="adresse" organisasjon={organisasjon} />
    <Nav.Knapp onClick={() => leggTil(organisasjon.orgnr)} className="knapp">Legg til</Nav.Knapp>
  </Nav.Panel>
);

FunnetOrganisasjon.propTypes = {
  leggTil: PT.func.isRequired,
  organisasjon: PT.object.isRequired,
};

/** Skjemavisning for å søke opp og legge til en arbeidsgiver.
 *
 * @param orgnrVerdi
 * @param organisasjon
 * @param leggTil
 * @param feilmelding
 * @param forsokHentOrganisasjon
 * @param oppdaterOrgnrVerdi
 * @param avbryt
 * @returns {*}
 * @constructor
 */
const SkjemaSokOgLeggTil = ({
  orgnrVerdi,
  organisasjon,
  leggTil,
  feilmelding,
  forsokHentOrganisasjon,
  oppdaterOrgnrVerdi,
  avbryt,
}) => {
  const feilObjekt = feilmelding ? { feilmelding } : null;
  return (
    <Nav.Panel>
      <div className="sokArbeidsgiver">
        <Nav.Input
          value={orgnrVerdi}
          onChange={oppdaterOrgnrVerdi}
          label="Søk etter orgnr:"
          feil={feilObjekt}
        />
        <Nav.Hovedknapp onClick={forsokHentOrganisasjon}>Søk</Nav.Hovedknapp>
        <Nav.Knapp onClick={avbryt}>Avbryt</Nav.Knapp>
      </div>
      <div className="leggTilArbeidsgiver">
        {Object.keys(organisasjon).length > 0 && <FunnetOrganisasjon organisasjon={organisasjon} leggTil={leggTil} />}
      </div>
    </Nav.Panel>
  );
};

SkjemaSokOgLeggTil.propTypes = {
  avbryt: PT.func.isRequired,
  feilmelding: PT.string.isRequired,
  forsokHentOrganisasjon: PT.func.isRequired,
  leggTil: PT.func.isRequired,
  oppdaterOrgnrVerdi: PT.func.isRequired,
  orgnrVerdi: PT.string.isRequired,
  organisasjon: PT.object.isRequired,
};

/**
 * Hovedkomponenten for å legge til arbeidsgiver som ikke ligger i Aa-reg.
 * Dette gjelder spesielt for søknader frem i tid hvor arbeidsforhold kanskje
 * ikke er registrert ennå
 *
 * @returns {*}
 * @constructor
 */
class EkstraArbeidsgivereLeggTil extends Component {
  state = {
    erLeggTilSynlig: false, orgnrVerdi: '', organisasjon: {}, feilmelding: '',
  };

  settFeilmelding = feilmelding => this.setState({ feilmelding });
  settOrganisasjon = organisasjon => this.setState({ organisasjon });

  forsokHentOrganisasjon = () => {
    const { orgnrVerdi } = this.state;

    if (orgnrVerdi && erOrgnrGyldig(orgnrVerdi)) {
      this.props.hentOrganisasjon(orgnrVerdi).then(response => {
        const { data: organisasjon } = response;
        const feilmelding = Object.keys(organisasjon).length === 0 ? 'Fant ikke organisasjonen' : '';
        this.settOrganisasjon(organisasjon);
        this.settFeilmelding(feilmelding);
      });
    } else {
      this.settFeilmelding('Orgnr er ikke gyldig.');
    }
  };

  leggTil = orgnr => {
    this.props.leggTil(orgnr);
    this.oppdaterOrgnrVerdi('');
    this.settOrganisasjon({});
    this.settFeilmelding('');
    this.skjulLeggTil();
  };

  oppdaterOrgnrVerdi = verdi => {
    this.setState({ orgnrVerdi: verdi });
    this.settFeilmelding('');
    this.settOrganisasjon({});
  };

  visLeggTil = () => this.setState({ erLeggTilSynlig: true });
  skjulLeggTil = () => this.setState({ erLeggTilSynlig: false });

  render() {
    const { redigerbart } = this.props;
    const {
      oppdaterOrgnrVerdi, visLeggTil, skjulLeggTil, forsokHentOrganisasjon, leggTil,
    } = this;

    const {
      erLeggTilSynlig, orgnrVerdi, organisasjon, feilmelding,
    } = this.state;

    return (
      <div>
        {!erLeggTilSynlig && <Nav.Knapp disabled={!redigerbart} onClick={visLeggTil}>+ Legg til arbeidsgiver</Nav.Knapp> }
        {erLeggTilSynlig && <SkjemaSokOgLeggTil
          avbryt={skjulLeggTil}
          feilmelding={feilmelding}
          forsokHentOrganisasjon={forsokHentOrganisasjon}
          leggTil={leggTil}
          oppdaterOrgnrVerdi={event => oppdaterOrgnrVerdi(event.target.value)}
          orgnrVerdi={orgnrVerdi}
          organisasjon={organisasjon}
        />}
      </div>
    );
  }
}

EkstraArbeidsgivereLeggTil.propTypes = {
  redigerbart: PT.bool.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  leggTil: PT.func.isRequired,
};

export default EkstraArbeidsgivereLeggTil;
