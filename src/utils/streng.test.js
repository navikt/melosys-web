/* eslint-disable */
import { boolTilNorsk, norskTilBool, boolTilStreng, strengTilBool, strengTilInt,
  tekstEllerDash, storeForbokstaver, arrayTilKonjunksjon,
} from './streng';

describe('streng.js', () => {
  describe('boolTilNorsk', () => {
    test('Oversetter true til "JA"', () => {
      expect(boolTilNorsk(true)).toEqual('JA');
    });
    test('Oversetter false til "NEI"', () => {
      expect(boolTilNorsk(false)).toEqual('NEI');
    });
  });
  describe('norskTilBool', () => {
    test('Oversetter JA til true', () => {
      expect(norskTilBool('JA')).toEqual(true);
    });
    test('Oversetter NEI til false', () => {
      expect(norskTilBool('NEI')).toEqual(false);
    });
  });
  describe('boolTilStreng', () => {
    test('Oversetter true => "true"', () => {
      expect(boolTilStreng(true)).toEqual('true');
    });
    test('Oversetter false => "false"', () => {
      expect(boolTilStreng(false)).toEqual('false');
    });
    test('Oversetter ikke undefined', () => {
      expect(boolTilStreng(undefined)).toEqual(undefined);
    });
    test('Oversetter ikke null', () => {
      expect(boolTilStreng(null)).toEqual(undefined);
    });
  });
  describe('strengTilBool', () => {
    test('Transformerer "true" => true', () => {
      expect(strengTilBool('true')).toEqual(true);
    });
    test('Transformerer "false" => false', () => {
      expect(strengTilBool('false')).toEqual(false);
    });
    test('Transformerer "undefined" => false', () => {
      expect(strengTilBool('undefined')).toEqual(false);
    });
  });
  describe('strengTilInt', () => {
    test('Transformerer "1" => 1', () => {
      expect(strengTilInt('1')).toEqual(1);
    });
    test('Transformerer "-1" => -1', () => {
      expect(strengTilInt('-1')).toEqual(-1);
    });
  });
  describe('tekstEllerDash', () => {
    test('Oversetter tom verdi med "-"', () => {
      expect(tekstEllerDash(undefined)).toEqual('-');
    });
    test('Returnerer gyldig verdi uendret', () => {
      const data = {};
      expect(tekstEllerDash(data)).toEqual(data);
    });
  });

  describe('storeForbokstaver', () => {
    test('Oppdaterer forste bokstav i hvert ord i setningen med stor bokstav', () => {
      const testString = 'en to tre fire fem';
      expect(storeForbokstaver(testString)).toEqual('En To Tre Fire Fem');
    });
  });

  describe('arrayTilKonjunksjon', () => {
    test('konjunksjon gir kun ett ord ved ett element i liste', () => {
      const liste = ['Foo'];
      const forventetResultat = 'Foo';

      expect(arrayTilKonjunksjon(liste)).toEqual(forventetResultat);
    });

    test('konjunksjon gir komma ved liste på 2 elementer', () => {
      const liste = ['Foo', 'Bar'];
      const forventetResultat = 'Foo og Bar';

      expect(arrayTilKonjunksjon(liste)).toEqual(forventetResultat);
    });

    test('konjunksjon gir komma og "og" ved liste på 5 elementer', () => {
      const liste = ['Foo', 'Boo', 'Bar', 'Baz', 'Maz'];
      const forventetResultat = 'Foo, Boo, Bar, Baz og Maz';

      expect(arrayTilKonjunksjon(liste)).toEqual(forventetResultat);
    });

    test('håndterer argumenter som er falsy', () => {
      const liste = undefined;
      const forventetResultat = '';

      expect(arrayTilKonjunksjon(liste)).toEqual(forventetResultat);
    });

    test('håndterer argumenter som er string', () => {
      const liste = 'Foo, Bar';
      const forventetResultat = 'Foo, Bar';

      expect(arrayTilKonjunksjon(liste)).toEqual(forventetResultat);
    })
  })
});
