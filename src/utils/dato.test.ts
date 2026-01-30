import { describe, it, test, expect, afterEach, vi } from "vitest";
import {
  vaskInputDato,
  vaskOgFormatterTilISO,
  normaliserInputDato,
  formatterDatoTilNorsk,
  formatterDatoTilISO,
  formatterKortDatoTilNorsk,
  datoDiff,
  datoDiffNorskFormat,
  datoDiffPure,
  datoDiffMenneskelig,
  beregnAlder,
  erGyldigPeriode,
  erIPeriode,
  erLike,
  erLikeDatoer,
  plussEnDag,
  norskStringTilDate,
  isoStringTilDate,
  dateTilNorskString,
  dateTilIsoString,
  perioderOverlapper,
  erFør,
  erEtter,
  sorterEtterNorskFomDato,
  sorterEtterISOFomDato,
  justerDatoHvisTidligereÅr,
} from "./dato";

import moment from "moment/moment";

moment.updateLocale("nb", {
  monthsShort: ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"],
});

describe("dato.js:", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("vaskInputDato", () => {
    test("godtar alle tillatte kortdatoformater", () => {
      const tillatteDatoer = [
        { test: "010113", forvent: "01.01.2013" },
        { test: "300113", forvent: "30.01.2013" },
        { test: "010479", forvent: "01.04.1979" },
        { test: "260479", forvent: "26.04.1979" },
        { test: "26041979", forvent: "26.04.1979" },
        { test: "22.07.09", forvent: "22.07.2009" },
        { test: "26-04-79", forvent: "26.04.1979" },
        { test: "26/04/79", forvent: "26.04.1979" },
        { test: "01-01-79", forvent: "01.01.1979" },
        { test: "26-04-1979", forvent: "26.04.1979" },
        { test: "26.04.1979", forvent: "26.04.1979" },
        { test: "26/04/1979", forvent: "26.04.1979" },
      ];

      tillatteDatoer.forEach((datoTest) => {
        const vasketDato = vaskInputDato(datoTest.test);
        expect(vasketDato).toEqual(datoTest.forvent);
      });
    });

    test("feiler på alle ugyldige datoformater", () => {
      const galeDatoer = [
        { test: "1979-07-02", forvent: false },
        { test: "29-02-17", forvent: false },
        { test: 123456789, forvent: false },
        { test: "abcdef", forvent: false },
        { test: undefined, forvent: false },
        { test: null, forvent: false },
      ];

      galeDatoer.forEach((datoTest) => {
        const vasketDato = vaskInputDato(datoTest.test as any);
        expect(vasketDato).toEqual(datoTest.forvent);
      });
    });

    test("feiler hvis dato er mindre enn 6 tegn", () => {
      const galDato = "26479";
      const vasketDato = vaskInputDato(galDato);
      expect(vasketDato).toEqual(false);
    });

    test("tolker årstall med 2 siffer til riktig århundre", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2010-01-01"));

      const testDatoer = [
        { test: "26-04-20", forvent: "26.04.2020" },
        { test: "26-04-30", forvent: "26.04.1930" },
      ];

      testDatoer.forEach((datoTest) => {
        const vasketDato = vaskInputDato(datoTest.test);
        expect(vasketDato).toEqual(datoTest.forvent);
      });
    });

    test("feiler på kort input med 4 tegn som '0101'", () => {
      const vasketDato = vaskInputDato("0101");
      expect(vasketDato).toEqual(false);
    });

    test("feiler på kort input med 2 tegn som '01'", () => {
      const vasketDato = vaskInputDato("01");
      expect(vasketDato).toEqual(false);
    });

    test("tolker '010120' som 01.01.2020 når dagens år er 2025", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-10-24"));

      const vasketDato = vaskInputDato("010120");
      expect(vasketDato).toEqual("01.01.2020");
    });

    test("tolker '011025' som 01.10.2025 når dagens år er 2025", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-10-24"));

      const vasketDato = vaskInputDato("011025");
      expect(vasketDato).toEqual("01.10.2025");
    });
  });

  describe("nodmaliserInputDato", () => {
    test("ikke forsøker å vaske datoen så lenge verdiene er forskjellige", () => {
      const verdi = "123456";
      const forrigeVerdi = "12345";

      expect(normaliserInputDato(verdi, forrigeVerdi)).toEqual(verdi);
    });

    test("vasker datoen når verdiene er like", () => {
      const verdi = "011217";
      const forrigeVerdi = "011217";

      expect(normaliserInputDato(verdi, forrigeVerdi)).not.toEqual(false);
    });
  });

  describe("formatterDatoTilNorsk", () => {
    test("formatterer datoen riktig til norsk format DD.MM.YYYY uten klokkeslett", () => {
      const tillatteDatoer = [
        { test: "2016-01-12", forvent: "12.01.2016" },
        { test: "2017-12-01T20:58:01Z", forvent: "01.12.2017" },
        { test: "01.02.1979", forvent: "01.02.1979" },
        { test: "01.02.1979", forvent: "01.02.1979" },
      ];

      tillatteDatoer.forEach((datoTest) => {
        const formattertDato = formatterDatoTilNorsk(datoTest.test);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    });

    test("returnerer tom streng dersom datoen er ugyldig.", () => {
      const feilDato = "2018-april-31";
      const formattertDato = formatterDatoTilNorsk(feilDato);
      expect(formattertDato).toEqual("");
    });

    test("formatterer datoen riktig til norsk format DD.MM.YYYY HH:mm:ss med klokkeslett", () => {
      const tillatteDatoer = [
        { test: "2017-12-01T20:58:01Z", forvent: "01.12.2017 21:58" },
        { test: "2017-12-01T01:08:01Z", forvent: "01.12.2017 02:08" },
        { test: "12.02.2000 20:00:1Z", forvent: "12.02.2000 21:00" },
      ];

      tillatteDatoer.forEach((datoTest) => {
        const formattertDato = formatterDatoTilNorsk(datoTest.test, true);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    });
  });

  describe("formatterDatoTilISO", () => {
    test("formatterer dato uten klokkeslett til ISO-format.", () => {
      const tillatteDatoer = [
        { test: "01.01.2018", forvent: "2018-01-01" },
        { test: "10.12.2018", forvent: "2018-12-10" },
      ];

      tillatteDatoer.forEach((datoTest) => {
        const formattertDato = formatterDatoTilISO(datoTest.test);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    });
  });

  describe("formatterKortDatoTilNorsk", () => {
    test("formatterer år-dato til korrekt til lesbarhet", () => {
      const tillatteDatoer = [
        { test: "2007-01", forvent: "jan - 2007" },
        { test: "2014-05", forvent: "mai - 2014" },
        { test: "2016-10-31", forvent: "okt - 2016" },
      ];

      tillatteDatoer.forEach((datoTest) => {
        const formattertDato = formatterKortDatoTilNorsk(datoTest.test);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    });
  });

  describe("erFør", () => {
    test("dato1 er den samme som dato2 gir false", () => {
      const dato1 = "2018-01-01";
      const dato2 = "2018-01-01";
      expect(erFør(dato1, dato2)).toBeFalsy();
    });

    test("dato1 er før dato2 gir true", () => {
      const dato1 = "2018-01-01";
      const dato2 = "2020-01-01";
      expect(erFør(dato1, dato2)).toBeTruthy();
    });

    test("dato1 er etter dato2 gir false", () => {
      const dato1 = "2020-01-01";
      const dato2 = "2018-01-01";
      expect(erFør(dato1, dato2)).toBeFalsy();
    });
  });

  describe("erEtter", () => {
    test("dato1 er den samme som dato2 gir false", () => {
      const dato1 = "2018-01-01";
      const dato2 = "2018-01-01";
      expect(erEtter(dato1, dato2)).toBeFalsy();
    });

    test("dato1 er før dato2 gir false", () => {
      const dato1 = "2018-01-01";
      const dato2 = "2020-01-01";
      expect(erEtter(dato1, dato2)).toBeFalsy();
    });

    test("dato1 er etter dato2 gir true", () => {
      const dato1 = "2020-01-01";
      const dato2 = "2018-01-01";
      expect(erEtter(dato1, dato2)).toBeTruthy();
    });
  });

  describe("sorterEtterNorskFomDato", () => {
    test("dato1 er den samme som dato2 gir 0", () => {
      const dato1 = "01.01.2018";
      const dato2 = "01.01.2018";
      expect(sorterEtterNorskFomDato({ fomDato: dato1 }, { fomDato: dato2 })).toBe(0);
    });

    test("dato1 er før dato2 gir positivt tall", () => {
      const dato1 = "01.01.2018";
      const dato2 = "01.01.2020";
      expect(sorterEtterNorskFomDato({ fomDato: dato1 }, { fomDato: dato2 })).toBeLessThan(0);
    });

    test("dato1 er etter dato2 gir omvendt rekkefølge ut", () => {
      const dato1 = "01.01.2020";
      const dato2 = "01.01.2018";
      expect(sorterEtterNorskFomDato({ fomDato: dato1 }, { fomDato: dato2 })).toBeGreaterThan(0);
    });
  });

  describe("sorterEtterISOFomDato", () => {
    test("dato1 er den samme som dato2 gir 0", () => {
      const dato1 = "2018-01-01";
      const dato2 = "2018-01-01";
      expect(sorterEtterISOFomDato({ fomDato: dato1 }, { fomDato: dato2 })).toBe(0);
    });

    test("dato1 er før dato2 gir positivt tall", () => {
      const dato1 = "2018-01-01";
      const dato2 = "2020-01-01";
      expect(sorterEtterISOFomDato({ fomDato: dato1 }, { fomDato: dato2 })).toBeLessThan(0);
    });

    test("dato1 er etter dato2 gir omvendt rekkefølge ut", () => {
      const dato1 = "2020-01-01";
      const dato2 = "2018-01-01";
      expect(sorterEtterISOFomDato({ fomDato: dato1 }, { fomDato: dato2 })).toBeGreaterThan(0);
    });

    test("når fomDato er lik, sorteres på tomDato", () => {
      const fom = "2018-01-01";
      expect(
        sorterEtterISOFomDato({ fomDato: fom, tomDato: "2018-06-01" }, { fomDato: fom, tomDato: "2018-12-01" }),
      ).toBeLessThan(0);
    });

    test("når fomDato er lik og tomDato er lik, gir 0", () => {
      expect(
        sorterEtterISOFomDato(
          { fomDato: "2018-01-01", tomDato: "2018-06-01" },
          { fomDato: "2018-01-01", tomDato: "2018-06-01" },
        ),
      ).toBe(0);
    });

    describe("med fom/tom feltnavn", () => {
      test("dato1 er den samme som dato2 gir 0", () => {
        expect(sorterEtterISOFomDato({ fom: "2018-01-01" }, { fom: "2018-01-01" })).toBe(0);
      });

      test("dato1 er før dato2 gir negativt tall", () => {
        expect(sorterEtterISOFomDato({ fom: "2018-01-01" }, { fom: "2020-01-01" })).toBeLessThan(0);
      });

      test("dato1 er etter dato2 gir positivt tall", () => {
        expect(sorterEtterISOFomDato({ fom: "2020-01-01" }, { fom: "2018-01-01" })).toBeGreaterThan(0);
      });

      test("når fom er lik, sorteres på tom", () => {
        expect(
          sorterEtterISOFomDato({ fom: "2018-01-01", tom: "2018-06-01" }, { fom: "2018-01-01", tom: "2018-12-01" }),
        ).toBeLessThan(0);
      });

      test("når fom er lik og tom er lik, gir 0", () => {
        expect(
          sorterEtterISOFomDato({ fom: "2018-01-01", tom: "2018-06-01" }, { fom: "2018-01-01", tom: "2018-06-01" }),
        ).toBe(0);
      });

      test("når fom er lik og begge mangler tom, gir 0", () => {
        expect(sorterEtterISOFomDato({ fom: "2018-01-01" }, { fom: "2018-01-01" })).toBe(0);
      });

      test("når fom er lik og periode1 mangler tom, sorteres periode1 etter periode2", () => {
        expect(sorterEtterISOFomDato({ fom: "2018-01-01" }, { fom: "2018-01-01", tom: "2018-06-01" })).toBeGreaterThan(
          0,
        );
      });

      test("når fom er lik og periode2 mangler tom, sorteres periode2 etter periode1", () => {
        expect(sorterEtterISOFomDato({ fom: "2018-01-01", tom: "2018-06-01" }, { fom: "2018-01-01" })).toBeLessThan(0);
      });
    });

    describe("gir samme resultat for fomDato/tomDato og fom/tom", () => {
      test("sortering før", () => {
        const resultatFomDato = sorterEtterISOFomDato({ fomDato: "2018-01-01" }, { fomDato: "2020-01-01" });
        const resultatFom = sorterEtterISOFomDato({ fom: "2018-01-01" }, { fom: "2020-01-01" });
        expect(Math.sign(resultatFomDato)).toBe(Math.sign(resultatFom));
      });

      test("sortering etter", () => {
        const resultatFomDato = sorterEtterISOFomDato({ fomDato: "2020-01-01" }, { fomDato: "2018-01-01" });
        const resultatFom = sorterEtterISOFomDato({ fom: "2020-01-01" }, { fom: "2018-01-01" });
        expect(Math.sign(resultatFomDato)).toBe(Math.sign(resultatFom));
      });

      test("sortering på tom når fom er lik", () => {
        const resultatFomDato = sorterEtterISOFomDato(
          { fomDato: "2018-01-01", tomDato: "2018-06-01" },
          { fomDato: "2018-01-01", tomDato: "2018-12-01" },
        );
        const resultatFom = sorterEtterISOFomDato(
          { fom: "2018-01-01", tom: "2018-06-01" },
          { fom: "2018-01-01", tom: "2018-12-01" },
        );
        expect(Math.sign(resultatFomDato)).toBe(Math.sign(resultatFom));
      });
    });
  });

  describe("datodiff", () => {
    test("tidligere dato diffet på kommende dato gir positivt tall", () => {
      const dato1 = "2018-01-01";
      const dato2 = "2018-05-05";
      expect(datoDiff(dato1, dato2, "days")).toBeGreaterThan(0);
    });

    test("kommende dato diffet på eldre dato gir negativt tall", () => {
      const dato1 = "2018-01-01";
      const dato2 = "2010-05-05";
      expect(datoDiff(dato1, dato2, "days")).toBeLessThan(0);
    });

    test("en dato diffet på datoen for neste dag gir 1", () => {
      const dato1 = "2018-01-01";
      const dato2 = "2018-01-02";
      expect(datoDiff(dato1, dato2, "days")).toBe(2);
    });

    test("dato i moment-format fungerer", () => {
      const dato1 = "2018-08-01";
      const dato2 = moment("2018-08-04", "YYYY-MM-DD");
      expect(datoDiff(dato1, dato2, "days")).toBe(4);
    });

    test("mindre enn én måned gir desimaltall", () => {
      const dato1 = "2018-01-01";
      const dato2 = "2018-01-31";
      expect(datoDiff(dato1, dato2, "months")).toBe(1);
    });

    test("Nøyaktig 6 måneder", () => {
      const dato1 = "2016-02-26";
      const dato2 = "2016-08-25";
      expect(datoDiff(dato1, dato2, "months")).toBe(6);
    });
  });

  describe("datoDiffNorskFormat", () => {
    test("Feil format gir false", () => {
      const dato1 = "01.0.2021";
      const dato2 = "31.12.2021";
      expect(datoDiffNorskFormat(dato1, dato2)).toBe(false);
    });

    test("Nøyaktig 1 år", () => {
      const dato1 = "01.01.2021";
      const dato2 = "31.12.2021";
      expect(datoDiffNorskFormat(dato1, dato2, "years")).toBe(1);
    });
  });

  describe("beregn forskjell i måneder og dager", () => {
    test("forskjell er 12 måned og 1 dag", () => {
      const dato1 = "2018-01-01";
      const dato2 = "2019-01-01";

      expect(datoDiffMenneskelig(dato1, dato2)).toBe("12 måneder og 1 dag");
    });

    test("forskjell er 12 måned", () => {
      const dato1 = "2018-01-01";
      const dato2 = "2018-12-31";

      expect(datoDiffMenneskelig(dato1, dato2)).toBe("12 måneder");
    });

    test("forskjell er 6 måneder", () => {
      const dato1 = "2018-04-20";
      const dato2 = "2018-10-19";

      expect(datoDiffMenneskelig(dato1, dato2)).toBe("6 måneder");
    });

    test("forskjell er 1 måned og 5 dager", () => {
      const dato1 = "2016-02-16";
      const dato2 = "2016-03-20";

      expect(datoDiffMenneskelig(dato1, dato2)).toBe("1 måned og 5 dager");
    });

    test("forskjell er 12 måneder", () => {
      const dato1 = "2016-01-01";
      const dato2 = "2016-12-31";

      expect(datoDiffMenneskelig(dato1, dato2)).toBe("12 måneder");
    });
  });

  describe("beregnAlder", () => {
    test("alder er 39 31. desember", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2017-12-31"));

      const foedselsdato = "1978-01-01";
      const forventetAlder = 39;
      expect(beregnAlder(foedselsdato)).toBe(forventetAlder);
    });

    test("alder er 40 1. januar", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2018-01-01"));

      const foedselsdato = "1978-01-01";
      const forventetAlder = 40;
      expect(beregnAlder(foedselsdato)).toBe(forventetAlder);
    });
  });

  describe("erGyldigPeriode", () => {
    it("returnerer forventet resultat for ulike perioder", () => {
      [
        { fom: "", tom: "", forventetResultat: false },
        { fom: "20.10.2010", tom: "20.10.2020", forventetResultat: true },
        { fom: "20.10.2020", tom: "20.10.2010", forventetResultat: false },
        { fom: "20.10.2010", tom: "20.10.2010", forventetResultat: true },
        { fom: "20.10.2010", tom: "19.10.2010", forventetResultat: false },
      ].forEach((periode) => expect(erGyldigPeriode(periode.fom, periode.tom)).toBe(periode.forventetResultat));
    });
  });

  describe("erLike", () => {
    it("returnerer forventet resultat", () => {
      [
        { fom: "2019-04-23T10:02:52.031Z", tom: "2019-04-23T10:02:52.031Z", forventetResultat: true },
        { fom: "2019-04-23T10:02:52.031Z", tom: "2019-04-23T10:02:59.031Z", forventetResultat: false },
      ].forEach((periode) => expect(erLike(periode.fom, periode.tom)).toBe(periode.forventetResultat));
    });
  });

  describe("erLikeDatoer", () => {
    it("returnerer forventet resultat", () => {
      [
        { fom: "2022-01-23", tom: "23.01.2022", forventetResultat: true },
        { fom: "2022-01-23", tom: "2022-02-23", forventetResultat: false },
        { fom: "2022-01-23", tom: "23012022", forventetResultat: true },
        { fom: "23.01.2022", tom: "23012022", forventetResultat: true },
        { fom: "2022-01-23", tom: "23.01.2022", forventetResultat: true },
        { fom: "2022-01-23", tom: undefined, forventetResultat: false },
        { fom: undefined, tom: "23.01.2022", forventetResultat: false },
        { fom: undefined, tom: undefined, forventetResultat: true },
      ].forEach((periode) => expect(erLikeDatoer(periode.fom, periode.tom)).toBe(periode.forventetResultat));
    });
  });

  describe("plussEnDag", () => {
    test("31. oktober blir 1. november", () => {
      const dato = "31.10.2020";
      const forventetDato = "01.11.2020";
      expect(plussEnDag(dato)).toBe(forventetDato);
    });

    test("28. februar blir 29. februar på skuddår", () => {
      const dato = "28.02.2020";
      const forventetDato = "29.02.2020";
      expect(plussEnDag(dato)).toBe(forventetDato);
    });

    test("28. februar blir 1. mars", () => {
      const dato = "28.02.2019";
      const forventetDato = "01.03.2019";
      expect(plussEnDag(dato)).toBe(forventetDato);
    });
  });

  describe("vaskOgFormatterTilISO", () => {
    test("formatterer 6-tegn kortdato til ISO", () => {
      expect(vaskOgFormatterTilISO("010124")).toBe("2024-01-01");
    });

    test("formatterer 8-tegn dato til ISO", () => {
      expect(vaskOgFormatterTilISO("01012024")).toBe("2024-01-01");
    });

    test("formatterer norsk dato til ISO", () => {
      expect(vaskOgFormatterTilISO("01.01.2024")).toBe("2024-01-01");
    });

    test("returnerer defaultValue for ugyldig kortdato", () => {
      expect(vaskOgFormatterTilISO("abcdef")).toBeNull();
    });

    test("returnerer custom defaultValue for ugyldig dato", () => {
      expect(vaskOgFormatterTilISO("abcdef", "fallback")).toBe("fallback");
    });
  });

  describe("erIPeriode", () => {
    test("dato innenfor periode gir true", () => {
      expect(erIPeriode("2024-01-01", "2024-12-31", "2024-06-15", "[]")).toBe(true);
    });

    test("dato utenfor periode gir false", () => {
      expect(erIPeriode("2024-01-01", "2024-12-31", "2025-06-15", "[]")).toBe(false);
    });
  });

  describe("datoDiffPure", () => {
    test("returnerer positiv diff når fom er etter tom", () => {
      expect(datoDiffPure("2024-06-01", "2024-01-01", "months")).toBeGreaterThan(0);
    });

    test("returnerer false for ugyldig dato", () => {
      expect(datoDiffPure("ugyldig", "2024-01-01")).toBe(false);
    });
  });

  describe("norskStringTilDate", () => {
    test("konverterer norsk dato til Date-objekt", () => {
      const result = norskStringTilDate("15.06.2024");
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(5); // 0-indexed
      expect(result?.getDate()).toBe(15);
    });

    test("returnerer undefined for ugyldig dato", () => {
      expect(norskStringTilDate("ugyldig")).toBeUndefined();
    });
  });

  describe("isoStringTilDate", () => {
    test("konverterer ISO dato til Date-objekt", () => {
      const result = isoStringTilDate("2024-06-15");
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getDate()).toBe(15);
    });
  });

  describe("dateTilNorskString", () => {
    test("konverterer Date til norsk string", () => {
      expect(dateTilNorskString(new Date(2024, 5, 15))).toBe("15.06.2024");
    });

    test("returnerer undefined for null", () => {
      expect(dateTilNorskString(null)).toBeUndefined();
    });

    test("returnerer undefined for ikke-Date", () => {
      expect(dateTilNorskString("not a date")).toBeUndefined();
    });
  });

  describe("dateTilIsoString", () => {
    test("konverterer Date til ISO string", () => {
      expect(dateTilIsoString(new Date(2024, 5, 15))).toBe("2024-06-15");
    });

    test("returnerer undefined for null", () => {
      expect(dateTilIsoString(null)).toBeUndefined();
    });

    test("returnerer undefined for ikke-Date", () => {
      expect(dateTilIsoString("not a date")).toBeUndefined();
    });
  });

  describe("perioderOverlapper", () => {
    test("overlappende perioder gir true", () => {
      expect(perioderOverlapper("01.01.2024", "30.06.2024", "01.03.2024", "31.12.2024")).toBe(true);
    });

    test("ikke-overlappende perioder gir false", () => {
      expect(perioderOverlapper("01.01.2024", "28.02.2024", "01.06.2024", "31.12.2024")).toBe(false);
    });

    test("ugyldig periode gir false", () => {
      expect(perioderOverlapper("30.06.2024", "01.01.2024", "01.03.2024", "31.12.2024")).toBe(false);
    });
  });

  describe("justerDatoHvisTidligereÅr", () => {
    test("returnerer dato uendret hvis samme år eller fremtidig", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-06-15"));
      expect(justerDatoHvisTidligereÅr("2024-06-01")).toBe("2024-06-01");
    });

    test("justerer dato til 01.01 i nåværende år hvis tidligere år", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-06-15"));
      expect(justerDatoHvisTidligereÅr("2023-06-01")).toBe("2024-01-01");
    });

    test("returnerer falsy verdi uendret", () => {
      expect(justerDatoHvisTidligereÅr(null)).toBeNull();
      expect(justerDatoHvisTidligereÅr(undefined)).toBeUndefined();
    });
  });
});
