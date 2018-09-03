import { formOperations } from '../../../ducks/form';
import { feltGrupper } from '../../../utils/panelFelter';

/** -------------------------------------------------------------
 * 3 neste funksjoner brukes av utils for å sjekke om motatte data inneholder
 * valideringer som vi må forholde oss til.
 * --------------------------------------------------------------
 */

class Felles {
  static inneholderFeilmeldinger = (data = {}) => {
    const { form = {} } = data;
    const { feilmeldinger = [] } = form;
    return feilmeldinger.length > 0;
  };

  static byggValideringsObjekt = data => {
    const { form: { feilmeldinger } = {} } = data;
    return feilmeldinger.reduce((samling, feilmelding) => (
      { ...samling, [feilmelding.skjemaFeltID]: feilmelding.melding }
    ), {});
  };

  static forsokValidering = (dispatch, data) => {
    if (Felles.inneholderFeilmeldinger(data)) {
      const valideringsObjekt = Felles.byggValideringsObjekt(data);
      formOperations.oppdaterAlleSkjemaValideringer(dispatch)(valideringsObjekt);
    }
  };

  /** -------------------------------------------------------------
   * 3 neste funksjoner brukes av utils for å sjekke om motatte data inneholder
   * valideringer som vi må forholde oss til.
   * --------------------------------------------------------------
   */

  /** Slår feltGrupper (nøstede) sammen til ett-nivås-objekt.
   */
  static flatUtFeltGrupper = grupper => (Object.keys(grupper).reduce(
    (samling, gruppe) =>
      ({ ...samling, ...grupper[gruppe] })
    , {}
  ));

  /** Valideringer ligger som arrays av funksjoner i panelGrupper. Disse må kjøres individuelt
   * og parses inn til string for å være gyldige Redux Form-valideringer.
   */
  static kjorAlleValideringerSomHarFunksjoner = (valideringer, values, props) => (
    Object.keys(valideringer).reduce((samling, feltNavn) => {
      const faktiskVerdi = values[feltNavn];

      // Hvis Array (av funksjoner)
      if (Array.isArray(valideringer[feltNavn])) {
        const ferdigValideringString = valideringer[feltNavn]
          .map(f => f(faktiskVerdi, props))
          .join(' ');
        return { ...samling, [feltNavn]: ferdigValideringString };
      }

      // Hvis kun én funksjon (dvs ikke i form av en array)
      if (typeof valideringer[feltNavn] === 'function') {
        return { ...samling, [feltNavn]: valideringer[feltNavn](faktiskVerdi) };
      }

      // Hvis faktisk string (som er feil, siden den alltid vil validere negativt)
      if (typeof valideringer[feltNavn] === 'string') {
        return { ...samling, [feltNavn]: valideringer[feltNavn] };
      }

      return { ...samling };
    }, {})
  );

  /** Fletter to objekter og kombinerer verdiene i tilfeller hvor begge
   * objekter har samme nøkkel. I tillegg fjern nøkler som viser seg å ikke utløse noen
   * spesiell validering.
   */
  static flettOgFilterValidering = (generiskValidering, forretningsValidering = {}) => {
    const dummyFletting = { ...generiskValidering, ...forretningsValidering };
    return Object.keys(dummyFletting).reduce((samling, feltNavn) => {
      const generiskTekst = generiskValidering[feltNavn] || '';
      const forretningsTekst = forretningsValidering[feltNavn] || '';
      const samletValideringstekst = `${generiskTekst} ${forretningsTekst}`.trim();

      return samletValideringstekst !== '' ? { ...samling, [feltNavn]: samletValideringstekst } : { ...samling };
    }, {});
  };

  /**
   * Kombinerer generisk og forretningsvalidering til én som kan brukes av redux form.
   * Merk at kun generisk validering kan ha funksjoner. Forretningsvalidering som kommer
   * fra server er kun string eller array.
   */
  static byggValidering = (values, props) => {
    const { forretningsValidering } = props;
    const generiskValideringFunksjoner = Felles.flatUtFeltGrupper(feltGrupper);
    const generiskValidering = Felles.kjorAlleValideringerSomHarFunksjoner(generiskValideringFunksjoner, values, props);
    return Felles.flettOgFilterValidering(generiskValidering, forretningsValidering);
  };

  /** Traverser alle feil som finnes i skjemaet (på grunnlag av validering) og mål opp mot kjente
   * felter i grupper (paneler) slik at det er mulig å avgjøre om et panel i sin helhet validerer korrekt.
   * @param felterMedFeil Object med alle felter som ikke validerer
   */
  static gyldigePaneler = felterMedFeil => {
    const felterMedFeilArray = felterMedFeil ? Object.keys(felterMedFeil) : [];

    return Object.keys(feltGrupper).reduce((collection, gruppeNavn) => {
      const felterIGruppen = feltGrupper[gruppeNavn];
      // Match felter i den aktuelle gruppen med listen over felter som faktisk inneholder feil. Dersom ingen treff,
      // returneres true, som må reverseres siden Saksbehandling forventer state gyldigPanel: true | false.
      const paneletInneholderIkkeFeil = !Object.keys(felterIGruppen).some(felt => felterMedFeilArray.includes(felt));
      return { ...collection, [gruppeNavn]: paneletInneholderIkkeFeil };
    }, {});
  };
}


export default Felles;
