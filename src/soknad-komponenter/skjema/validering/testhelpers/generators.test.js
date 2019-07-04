import Generator from './generators';

/**
 * BAKGRUNN:
 * Denne testen eksisterer for å gjøre en best mulig test av fødselsnummergeneratoren.
 * Siden generatoren lager tilfeldige fødselsnummer er det umulig å lage en test med full
 * coverage. Generatoren eksisterer kun for å generere mattematisk korrekte fødselsnummere
 * slik at DISSE igjen kan benyttes i unit-tester av faktisk produksjonskode.
 */
describe('Testing the fodselsnummergenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new Generator();
  });

  test('creating an instance of the generator', () => {
    expect(typeof generator).toBe('object');
  });

  test('generate a random birthdate', () => {
    const randomBirthDate = generator.generateRandomBirthDate();
    expect(randomBirthDate instanceof Date).toBe(true);
  });

  test('generate random gender', () => {
    expect(typeof generator.generateRandomGender()).toBe('number');
  });

  test('generate individnumbers for female', () => {
    const birthDate = new Date(1976, 1, 1);
    const gender = 0; // Female has even numbers
    const generatedIndividNumber = generator.generateRandomIndividNumber(birthDate, gender);
    expect(generatedIndividNumber.length).toBe(3);
    expect(parseInt(generatedIndividNumber.charAt(2), 10) % 2).toBe(0);
  });

  test('generate individnumbers for male', () => {
    const birthDate = new Date(1976, 1, 1);
    const gender = 1; // Male has odd numbers
    const generatedIndividNumber = generator.generateRandomIndividNumber(birthDate, gender);
    expect(generatedIndividNumber.length).toBe(3);
    expect(parseInt(generatedIndividNumber.charAt(2), 10) % 2).not.toBe(0);
  });

  test('getMonthDayYear()', () => {
    const birthDate = new Date(1979, 4, 26);
    expect(generator.getMonthDayYear(birthDate)).toBe('260479');
  });

  test('generatePartialBirthNumber()', () => {
    expect(generator.generatePartialBirthNumber().length).toBe(9);
  });

  test('generateControlNumbers', () => {
    const partialBirthNumber = generator.generatePartialBirthNumber();
    const controlNumbers = generator.generateControlNumbers(partialBirthNumber);
    expect(typeof controlNumbers).toBe('object');
  });

  test('generateBirthNumber', () => {
    const birthNumber = generator.generateBirthNumber();
    expect(birthNumber.length).toBe(11);
  });
});
