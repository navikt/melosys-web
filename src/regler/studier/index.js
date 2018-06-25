import DomeneRegel from '../domeneRegel';

class Studier extends DomeneRegel {
  studererIUtlandet = () => {
    const { skjema } = this;
    const { studieLand = [] } = skjema;

    if (studieLand.length === 0) { return undefined; }

    return !studieLand.includes('NO');
  }

  studierFinansieresFraNorge = () => {
    const { skjema } = this;
    const { studentFinansiering } = skjema;
    return studentFinansiering === 'LAANEKASSEN';
  }
}

export default Studier;
