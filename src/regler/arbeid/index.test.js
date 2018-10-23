import Regel from '../index';

describe('Tester at regler for arbeid', () => {
  describe('erArbeidsforholdetRelevantForSoknadsperioden', () => {
    test('returnerer true dersom hele søknadsperioden ligger innenfor perioden for arbeidsforholdet', () => {
      const mockSkjema = {
        oppholdUtlandFom: '01.05.2018',
        oppholdUtlandTom: '30.09.2018',
      };

      const mockArbeidsforholdPeriode = {
        fom: '2018-01-30',
        tom: '2019-01-01',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.arbeid().erArbeidsforholdetRelevantForSoknadsperioden(mockArbeidsforholdPeriode).status).toBe(true);
    });

    test('returnerer false dersom starten av søknadsperioden er før starten for arbeidsforholdet', () => {
      const mockSkjema = {
        oppholdUtlandFom: '30.04.2018',
        oppholdUtlandTom: '31.12.2018',
      };

      const mockArbeidsforholdPeriode = {
        fom: '2018-05-01',
        tom: '2019-01-01',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.arbeid().erArbeidsforholdetRelevantForSoknadsperioden(mockArbeidsforholdPeriode).status).toBe(false);
    });

    test('returnerer false dersom slutten av søknadsperioden er etter slutten for arbeidsforholdet', () => {
      const mockSkjema = {
        oppholdUtlandFom: '30.04.2018',
        oppholdUtlandTom: '31.12.2018',
      };

      const mockArbeidsforholdPeriode = {
        fom: '2018-05-01',
        tom: '2018-12-30',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.arbeid().erArbeidsforholdetRelevantForSoknadsperioden(mockArbeidsforholdPeriode).status).toBe(false);
    });

    test('returnerer false dersom hele søknadsperioden er utenfor hele perioden for arbeidsforholdet', () => {
      const mockSkjema = {
        oppholdUtlandFom: '01.04.2016',
        oppholdUtlandTom: '01.03.2017',
      };

      const mockArbeidsforholdPeriode = {
        fom: '2017-03-02',
        tom: '2018-30-12',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.arbeid().erArbeidsforholdetRelevantForSoknadsperioden(mockArbeidsforholdPeriode).status).toBe(false);
    });
  });
});
