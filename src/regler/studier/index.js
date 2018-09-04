import DomeneRegel from '../domeneRegel';

class Studier extends DomeneRegel {
  studererIUtlandet = () => {
    const { skjema } = this;
    const { oppholdsland } = skjema;

    const manglerInfoTekst = 'Sjekk om søker studerer i utlandet!';
    const positivTekst = 'Studerer i utlandet.';
    const negativTekst = 'Studerer IKKE i utlandet.';

    const harMangelfulleOpplysninger = (!oppholdsland || oppholdsland.length === 0);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    const harStudierIUtlandet = !oppholdsland.includes('NO');

    return this.byggRegelSvar(harStudierIUtlandet, positivTekst, negativTekst);
  }

  studierFinansieresFraNorge = () => {
    const { skjema } = this;
    const { studentFinansiering } = skjema;

    const manglerInfoTekst = 'Sjekk om studiet er finansiert fra Norge!';
    const positivTekst = 'Studiet er finansiert fra Norge.';
    const negativTekst = 'Studiet er IKKE finansiert fra Norge.';

    const harMangelfulleOpplysninger = (studentFinansiering === null || studentFinansiering === undefined);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    const erStudierFinansiertFraNorge = (studentFinansiering === 'LAANEKASSEN');

    return this.byggRegelSvar(erStudierFinansiertFraNorge, positivTekst, negativTekst);
  }
}

export default Studier;
