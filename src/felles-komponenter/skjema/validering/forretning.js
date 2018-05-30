import { formOperations } from '../../../ducks/form';

const felterHarFeil = data => {
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

export const sjekkOmFelterSkalValideres = (dispatch, data) => {
  if (felterHarFeil(data)) {
    const valideringsObjekt = byggValideringsObjekt(data);
    formOperations.oppdaterAlleSkjemaValideringer(dispatch)(valideringsObjekt);
  }
};
