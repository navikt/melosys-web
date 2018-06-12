import Inngang from './inngang';

class StegVelger {
  constructor(faktaavklaring){
    this.faktaavklaring = faktaavklaring;
  }

  beregnAlleSteg = () => {
    const forsteSteg = new Inngang(this.faktaavklaring);
  }
}

export default StegVelger;
