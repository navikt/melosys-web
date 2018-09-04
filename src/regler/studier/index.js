import DomeneRegel from '../domeneRegel';

class Studier extends DomeneRegel {
  studererIUtlandet = () => {
    const { skjema } = this;
    const { oppholdsland } = skjema;

    const manglerInfoTekst = 'Sjekk om søker studerer i utlandet!';
    const positivTekst = 'Studerer i utlandet.';
    const negativTekst = 'Studerer IKKE i utlandet.';

    if (!oppholdsland || oppholdsland.length === 0) return ({ tekst: manglerInfoTekst, status: undefined });

    return (
      {
        tekst: !oppholdsland.includes('NO') ? positivTekst : negativTekst,
        status: !oppholdsland.includes('NO'),
      }
    );
  }

  studierFinansieresFraNorge = () => {
    const { skjema } = this;
    const { studentFinansiering } = skjema;

    const erStudierFinansiertFraNorge = (studentFinansiering === 'LAANEKASSEN');

    const manglerInfoTekst = 'Sjekk om studiet er finansiert fra Norge!';
    const positivTekst = 'Studiet er finansiert fra Norge.';
    const negativTekst = 'Studiet er IKKE finansiert fra Norge.';

    if (studentFinansiering === null || studentFinansiering === undefined) return ({ tekst: manglerInfoTekst, status: undefined });

    return (
      {
        tekst: erStudierFinansiertFraNorge ? positivTekst : negativTekst,
        status: erStudierFinansiertFraNorge,
      }
    );
  }
}

export default Studier;
