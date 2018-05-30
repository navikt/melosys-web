import { formOperations } from '../../../ducks/form';
import { feltGrupper } from '../../../utils/panelFelter';

/** -------------------------------------------------------------
 * 3 neste funksjoner brukes av utils for å sjekke om motatte data inneholder
 * valideringer som vi må forholde oss til.
 * --------------------------------------------------------------
 */
const harFelterFeil = data => {
  const { form = {} } = data;
  return form.feilmeldinger !== undefined;
};

const byggValideringsObjekt = data => {
  const { form: { feilmeldinger } = {} } = data;
  const feltIDListe = feilmeldinger.reduce((samling, feilmelding) => (
    { ...samling, [feilmelding.skjemaFeltID]: feilmelding.melding }
  ), {});
  return feltIDListe;
};

export const sjekkOmValideringDeretterForsok = (dispatch, data) => {
  if (harFelterFeil(data)) {
    const valideringsObjekt = byggValideringsObjekt(data);
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
const flatUtFeltGrupper = grupper => (Object.keys(grupper).reduce(
  (samling, gruppe) =>
    ({ ...samling, ...grupper[gruppe] })
  , {}
));

/** Valideringer ligger som arrays av funksjoner i panelGrupper. Disse må kjøres individuelt
 * og parses inn til string for å være gyldige Redux Form-valideringer.
 */
const kjorAlleValideringerSomHarFunksjoner = (valideringer, values, props) => (
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
 * objekter har samme nøkkel.
 */
const flettValidering = (generiskValidering, forretningsValidering = {}) => {
  const samletValidering = { ...generiskValidering };
  Object.keys(forretningsValidering).forEach(feltNavn => {
    samletValidering[feltNavn] = samletValidering[feltNavn]
      ?
      `${samletValidering[feltNavn]} ${forretningsValidering[feltNavn]}`
      :
      forretningsValidering[feltNavn];
  });

  return samletValidering;
};

/**
 * Kombinerer generisk og forretningsvalidering til én som kan brukes av redux form.
 */
export const byggValidering = (values, props) => {
  const { forretningsValidering } = props;
  const generiskValideringFunksjoner = flatUtFeltGrupper(feltGrupper);
  const generiskValidering = kjorAlleValideringerSomHarFunksjoner(generiskValideringFunksjoner, values, props);

  return flettValidering(generiskValidering, forretningsValidering);
};

/** Traverser alle feil som finnes i skjemaet (på grunnlag av validering) og mål opp mot kjente
 * felter i grupper (paneler) slik at det er mulig å avgjøre om et panel i sin helhet validerer korrekt.
 * @param felterMedFeil Object med alle felter som ikke validerer
 */
export const gyldigePaneler = felterMedFeil => {
  // Konverter til array.
  const felterMedFeilArray = felterMedFeil ? Object.keys(felterMedFeil) : [];

  // Gjør en reduksjon på hovedgruppene i feltGrupper.
  return Object.keys(feltGrupper).reduce((collection, gruppe) => {
    // En gruppe kan være 'bekreftelser', 'inntekt', 'person' eller liknende.
    const felterIGruppen = feltGrupper[gruppe];
    // Match felter i den aktuelle gruppen med listen over felter som faktisk inneholder feil. Dersom ingen treff,
    // returneres true, som må reverseres siden Saksbehandling forventer state gyldigPanel: true | false.
    const paneletInneholderFeil = !(Object.keys(felterIGruppen).some(felt => felterMedFeilArray.includes(felt)));
    return { ...collection, [gruppe]: paneletInneholderFeil };
  }, {});
};
