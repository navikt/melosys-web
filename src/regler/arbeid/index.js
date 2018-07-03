import DomeneRegel from '../domeneRegel';

import { datoDiff } from '../../utils/dato';

class Arbeid extends DomeneRegel {
  erArbeidsforholdetRelevantForSoknadsperioden = ansettelsesPeriode => {
    const { skjema } = this;
    const { faktavklaringPeriodeFraOgMed: oppholdStartDato, faktaavklaringPeriodeTilOgMed: oppholdSluttDato } = skjema;
    const { fom: ansattStartDato, tom: ansattSluttDato } = ansettelsesPeriode;

    if (!ansattStartDato) { return false; } // Dersom vi ikke vet startdatoen for arbeidsforholdet er det noe muffins.

    const erAnsattVedPeriodeStart = datoDiff(ansattStartDato, oppholdStartDato, 'days') >= 0;
    const erAnsattVedPeriodeSlutt = datoDiff(ansattSluttDato, oppholdSluttDato, 'days') <= 0;

    console.log(erAnsattVedPeriodeStart, erAnsattVedPeriodeSlutt);

    return erAnsattVedPeriodeStart && erAnsattVedPeriodeSlutt;
  }
}

export default Arbeid;
