import { formOperations } from "../../../ducks/form";

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

  static byggValideringsObjekt = (data) => {
    const { form: { feilmeldinger } = {} } = data;
    return feilmeldinger.reduce(
      (samling, feilmelding) => ({ ...samling, [feilmelding.skjemaFeltID]: feilmelding.melding }),
      {}
    );
  };

  static forsokValidering = (dispatch, data) => {
    if (Felles.inneholderFeilmeldinger(data)) {
      const valideringsObjekt = Felles.byggValideringsObjekt(data);
      formOperations.oppdaterAlleSkjemaValideringer(dispatch)(valideringsObjekt);
    }
  };
}

export default Felles;
