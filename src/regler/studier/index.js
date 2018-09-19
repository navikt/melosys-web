import DomeneRegel from '../domeneRegel';

class Studier extends DomeneRegel {
  studererIUtlandet = () => {
    const { skjema } = this;
    const { oppholdsland } = skjema;

    if (!oppholdsland || oppholdsland.length === 0) { return undefined; }

    return !oppholdsland.includes('NO');
  }

  studierFinansieresFraNorge = () => {
    const { skjema } = this;
    const { studentFinansiering } = skjema;

    if (!studentFinansiering) return undefined;

    return studentFinansiering === 'LAANEKASSEN';
  }
}

export default Studier;
