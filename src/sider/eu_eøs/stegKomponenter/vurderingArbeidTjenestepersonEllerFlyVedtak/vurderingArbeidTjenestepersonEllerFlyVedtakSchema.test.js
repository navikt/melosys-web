import { describe, expect, it } from "vitest";
import arbeid_tjenesteperson_eller_fly_vedtak from "./vurderingArbeidTjenestepersonEllerFlyVedtakSchema";
import MKV from "../../../../melosyskodeverk";

const validate = async (values, context) => {
  try {
    await arbeid_tjenesteperson_eller_fly_vedtak.validate(values, {
      abortEarly: false,
      context,
    });
    return null;
  } catch (e) {
    return e;
  }
};

const hasError = (e, path) => {
  if (!e) return false;
  const paths = Array.isArray(e.inner) ? e.inner.map((x) => x.path) : e.path ? [e.path] : [];
  return paths.includes(path);
};

describe("vurderingArbeidTjenestepersonEllerFlyVedtakSchema", () => {
  const baseValidData = {
    kreverMottakerinstitusjon: false,
    informerUtenlandskTrygdemyndighet: false,
    mottakerinstitusjoner: [],
  };

  describe("vedtakstype validering", () => {
    it("skal kreve vedtakstype når behandlingstype er NY_VURDERING", async () => {
      const data = {
        ...baseValidData,
        vedtakstype: null,
      };

      const context = {
        behandlingstype: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      };

      const err = await validate(data, context);
      expect(hasError(err, "vedtakstype")).toBe(true);
    });

    it("skal godta vedtakstype når den er oppgitt ved NY_VURDERING", async () => {
      const data = {
        ...baseValidData,
        vedtakstype: "FØRSTEGANGSVEDTAK",
        vedtakstypebegrunnelse: "En begrunnelse",
      };

      const context = {
        behandlingstype: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      };

      const err = await validate(data, context);
      expect(err).toBeNull();
    });

    it("skal ikke kreve vedtakstype når behandlingstype ikke er NY_VURDERING", async () => {
      const data = {
        ...baseValidData,
        vedtakstype: null,
      };

      const context = {
        behandlingstype: "ANNEN_BEHANDLINGSTYPE",
      };

      const err = await validate(data, context);
      expect(err).toBeNull();
    });
  });

  describe("vedtakstypebegrunnelse validering", () => {
    it("skal kreve vedtakstypebegrunnelse når behandlingstype er NY_VURDERING", async () => {
      const data = {
        ...baseValidData,
        vedtakstype: "FØRSTEGANGSVEDTAK",
        vedtakstypebegrunnelse: null,
      };

      const context = {
        behandlingstype: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      };

      const err = await validate(data, context);
      expect(hasError(err, "vedtakstypebegrunnelse")).toBe(true);
    });

    it("skal godta vedtakstypebegrunnelse når den er oppgitt ved NY_VURDERING", async () => {
      const data = {
        ...baseValidData,
        vedtakstype: "FØRSTEGANGSVEDTAK",
        vedtakstypebegrunnelse: "En gyldig begrunnelse",
      };

      const context = {
        behandlingstype: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      };

      const err = await validate(data, context);
      expect(err).toBeNull();
    });
  });

  describe("mottakerinstitusjon validering", () => {
    it("skal kreve mottakerinstitusjon når kreverMottakerinstitusjon er true", async () => {
      const data = {
        ...baseValidData,
        kreverMottakerinstitusjon: true,
        mottakerinstitusjon: null,
      };

      const err = await validate(data);
      expect(hasError(err, "mottakerinstitusjon")).toBe(true);
    });

    it("skal godta mottakerinstitusjon når den er oppgitt og kreverMottakerinstitusjon er true", async () => {
      const data = {
        ...baseValidData,
        kreverMottakerinstitusjon: true,
        mottakerinstitusjon: "INSTITUSJON_ID",
        informerUtenlandskTrygdemyndighet: true,
        mottakerLand: "SE",
      };

      const err = await validate(data);
      expect(err).toBeNull();
    });

    it("skal ikke kreve mottakerinstitusjon når kreverMottakerinstitusjon er false", async () => {
      const data = {
        ...baseValidData,
        kreverMottakerinstitusjon: false,
        // mottakerinstitusjon utelatt når ikke påkrevd
      };

      const err = await validate(data);
      expect(err).toBeNull();
    });
  });

  describe("mottakerinstitusjoner array validering", () => {
    it("skal kreve id for mottakerinstitusjon når kreverMottakerinstitusjon er true i array", async () => {
      const data = {
        ...baseValidData,
        mottakerinstitusjoner: [
          {
            kreverMottakerinstitusjon: true,
            id: null,
          },
        ],
      };

      const err = await validate(data);
      expect(hasError(err, "mottakerinstitusjoner[0].id")).toBe(true);
    });

    it("skal godta mottakerinstitusjoner når id er oppgitt og kreverMottakerinstitusjon er true", async () => {
      const data = {
        ...baseValidData,
        mottakerinstitusjoner: [
          {
            kreverMottakerinstitusjon: true,
            id: "INSTITUSJON_ID",
          },
        ],
      };

      const err = await validate(data);
      expect(err).toBeNull();
    });

    it("skal ikke kreve id når kreverMottakerinstitusjon er false i array", async () => {
      const data = {
        ...baseValidData,
        mottakerinstitusjoner: [
          {
            kreverMottakerinstitusjon: false,
            // id utelatt når ikke påkrevd
          },
        ],
      };

      const err = await validate(data);
      expect(err).toBeNull();
    });
  });

  describe("informerUtenlandskTrygdemyndighet validering", () => {
    it("skal kreve informerUtenlandskTrygdemyndighet", async () => {
      const data = {
        ...baseValidData,
        informerUtenlandskTrygdemyndighet: null,
      };

      const err = await validate(data);
      expect(hasError(err, "informerUtenlandskTrygdemyndighet")).toBe(true);
    });

    it("skal godta true som verdi for informerUtenlandskTrygdemyndighet", async () => {
      const data = {
        ...baseValidData,
        informerUtenlandskTrygdemyndighet: true,
        mottakerLand: "SE",
        kreverMottakerinstitusjon: true,
        mottakerinstitusjon: "INSTITUSJON_ID",
      };

      const err = await validate(data);
      expect(err).toBeNull();
    });

    it("skal godta false som verdi for informerUtenlandskTrygdemyndighet", async () => {
      const data = {
        ...baseValidData,
        informerUtenlandskTrygdemyndighet: false,
      };

      const err = await validate(data);
      expect(err).toBeNull();
    });
  });

  describe("mottakerLand validering", () => {
    it("skal kreve mottakerLand når informerUtenlandskTrygdemyndighet er true", async () => {
      const data = {
        ...baseValidData,
        informerUtenlandskTrygdemyndighet: true,
        mottakerLand: null,
        kreverMottakerinstitusjon: false,
      };

      const err = await validate(data);
      expect(hasError(err, "mottakerLand")).toBe(true);
    });

    it("skal godta mottakerLand når den er oppgitt og informerUtenlandskTrygdemyndighet er true", async () => {
      const data = {
        ...baseValidData,
        informerUtenlandskTrygdemyndighet: true,
        mottakerLand: "SE",
        kreverMottakerinstitusjon: false,
      };

      const err = await validate(data);
      expect(err).toBeNull();
    });

    it("skal ikke kreve mottakerLand når informerUtenlandskTrygdemyndighet er false", async () => {
      const data = {
        ...baseValidData,
        informerUtenlandskTrygdemyndighet: false,
        // mottakerLand utelatt når ikke påkrevd
      };

      const err = await validate(data);
      expect(err).toBeNull();
    });
  });

  describe("komplette scenario", () => {
    it("skal validere komplett gyldig data for NY_VURDERING med informering av utenlandsk trygdemyndighet", async () => {
      const data = {
        vedtakstype: "FØRSTEGANGSVEDTAK",
        vedtakstypebegrunnelse: "En gyldig begrunnelse",
        kreverMottakerinstitusjon: true,
        mottakerinstitusjon: "INSTITUSJON_ID",
        informerUtenlandskTrygdemyndighet: true,
        mottakerLand: "SE",
        mottakerinstitusjoner: [
          {
            kreverMottakerinstitusjon: true,
            id: "INSTITUSJON_ID",
          },
        ],
      };

      const context = {
        behandlingstype: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      };

      const err = await validate(data, context);
      expect(err).toBeNull();
    });

    it("skal validere komplett gyldig data for vanlig behandling uten informering", async () => {
      const data = {
        kreverMottakerinstitusjon: false,
        informerUtenlandskTrygdemyndighet: false,
        mottakerinstitusjoner: [],
      };

      const context = {
        behandlingstype: "ANNEN_BEHANDLINGSTYPE",
      };

      const err = await validate(data, context);
      expect(err).toBeNull();
    });
  });
});
