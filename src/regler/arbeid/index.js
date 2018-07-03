import DomeneRegel from '../domeneRegel';

import { datoDiff, formatterDatoTilISO } from '../../utils/dato';

class Arbeid extends DomeneRegel {
  erArbeidsforholdetRelevantForSoknadsperioden = ansettelsesPeriode => {
    const { skjema } = this;
    const { faktaavklaringPeriodeFraOgMed, faktaavklaringPeriodeTilOgMed } = skjema;
    const { fom: ansattStartDato, tom: ansattSluttDato } = ansettelsesPeriode;

    const oppholdStartDato = formatterDatoTilISO(faktaavklaringPeriodeFraOgMed);
    const oppholdSluttDato = formatterDatoTilISO(faktaavklaringPeriodeTilOgMed);

    const erAnsattVedPeriodeStart = datoDiff(ansattStartDato, oppholdStartDato, 'days') >= 0;
    const erAnsattVedPeriodeSlutt = datoDiff(ansattSluttDato, oppholdSluttDato, 'days') <= 0;

    return erAnsattVedPeriodeStart && erAnsattVedPeriodeSlutt;
  }
}

export default Arbeid;
