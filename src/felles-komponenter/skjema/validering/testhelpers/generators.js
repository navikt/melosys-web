class Generator {
  static MALE = 1;
  static FEMALE = 0;

  generateRandomGender = () => (Math.random() > 0.5 ? Generator.MALE : Generator.FEMALE);

  generateRandomBirthDate = () => {
    const todaysYear = new Date().getFullYear();
    const startRange = new Date(todaysYear - 100, 1, 1);
    const endRange = new Date(todaysYear, 1, 1);

    const startEpoch = startRange.getTime();
    const endEpoch = endRange.getTime();

    const randomEpochWithinRange = startEpoch + Math.round(Math.random() * (endEpoch - startEpoch));

    return new Date(randomEpochWithinRange);
  };

  getIndividNumberRange = birthYear => {
    if (birthYear >= 1900 && birthYear <= 1999) {
      return [0, 500];
    }
    if (birthYear >= 1854 && birthYear <= 1899) {
      return [500, 749];
    }
    if (birthYear >= 2000 && birthYear <= 2039) {
      return [500, 999];
    }
    return false;
  };

  generateRandomIndividNumber = (birthDate, gender) => {
    if (!birthDate) throw new Error('Missing birth date as argument');
    const birthYear = birthDate.getFullYear();
    const individNumberRange = this.getIndividNumberRange(birthYear);
    const randomIndividNumber = Math.round((Math.random() * (individNumberRange[1] - individNumberRange[0])) + individNumberRange[0]);
    const individNumberAdjustedForGender = this.genderOddEven(randomIndividNumber, gender);
    return String(individNumberAdjustedForGender).padStart(3, '0');
  };

  genderOddEven = (randomIndividNumber, gender) => ((Math.round(randomIndividNumber / 2) * 2) + gender);

  getMonthDayYear = date => (
    `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth()).padStart(2, '0')}${String(date.getFullYear()).substr(2, 2)}`
  );

  generatePartialBirthNumber = () => {
    const birthDate = this.generateRandomBirthDate();
    const gender = this.generateRandomGender();
    const individNumber = this.generateRandomIndividNumber(birthDate, gender);

    return `${this.getMonthDayYear(birthDate)}${individNumber}`;
  };

  generatePartialDNumber = () => {
    const birthDate = this.generateRandomBirthDate();
    const gender = this.generateRandomGender();
    const individNumber = this.generateRandomIndividNumber(birthDate, gender);

    const monthDayYear = this.getMonthDayYear(birthDate);
    const monthDayYearArray = monthDayYear.split('');
    monthDayYearArray[0] = `${parseInt(monthDayYearArray[0], 10) + 4}`;

    return `${monthDayYearArray.join('')}${individNumber}`;
  };

  generateControlNumbers = partialBirthNumber => {
    const d1 = partialBirthNumber.charAt(0);
    const d2 = partialBirthNumber.charAt(1);
    const m1 = partialBirthNumber.charAt(2);
    const m2 = partialBirthNumber.charAt(3);
    const y1 = partialBirthNumber.charAt(4);
    const y2 = partialBirthNumber.charAt(5);
    const i1 = partialBirthNumber.charAt(6);
    const i2 = partialBirthNumber.charAt(7);
    const i3 = partialBirthNumber.charAt(8);

    let control1 = 11 - (((3 * d1) + (7 * d2) + (6 * m1) + (1 * m2) + (8 * y1) + (9 * y2) + (4 * i1) + (5 * i2) + (2 * i3)) % 11);
    if (control1 === 11) {
      control1 = 0;
    }

    let control2 = 11 - (((5 * d1) + (4 * d2) + (3 * m1) + (2 * m2) + (7 * y1) + (6 * y2) + (5 * i1) + (4 * i2) + (3 * i3) + (2 * control1)) % 11);
    if (control2 === 11) {
      control2 = 0;
    }

    return [control1, control2];
  };

  generateBirthNumber = () => {
    const partialBirthNumber = this.generatePartialBirthNumber();
    const [k1, k2] = this.generateControlNumbers(partialBirthNumber);

    if (k1 === 10 || k2 === 10) {
      // Generated partial birthnumber was invalid (k1 === 10 || k2 === 10)
      // call generate again in hopes of getting a valid number.
      return this.generateBirthNumber();
    }

    return `${partialBirthNumber}${k1}${k2}`;
  };

  generateDNumber = () => {
    const partialDNumber = this.generatePartialDNumber();
    const [k1, k2] = this.generateControlNumbers(partialDNumber);

    if (k1 === 10 || k2 === 10) {
      // Generated partial birthnumber was invalid (k1 === 10 || k2 === 10)
      // call generate again in hopes of getting a valid number.
      return this.generateDNumber();
    }

    return `${partialDNumber}${k1}${k2}`;
  }
}

export default Generator;
