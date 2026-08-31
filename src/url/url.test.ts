import { lagUrl, lagUrlFraSakstypeOgBehandlingstema } from "./url";
import MKV from "../melosyskodeverk";

const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;

describe("url", () => {
  describe("lagUrlFraSakstypeOgBehandlingstema", () => {
    it("sakstype finnes ikke kaster feil", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        "En sakstype vi ikke støtter",
        "tilfeldig behandlingstemaKode",
      );

      expect(url).toContain("/flyt-finnes-ikke-for-behandling");
    });

    it("Sakstype EU_EOS med ustøttet behandlingstemaKode kaster feil", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema("MEL-1", 1, EU_EOS, "tilfeldig behandlingstemaKode");

      expect(url).toContain("/flyt-finnes-ikke-for-behandling");
    });

    it("Sakstype TRYGDEAVTALE med ustøttet behandlingstemaKode kaster feil", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema("MEL-1", 1, TRYGDEAVTALE, "tilfeldig behandlingstemaKode");

      expect(url).toContain("/flyt-finnes-ikke-for-behandling");
    });

    it("Sakstype FTRL med ustøttet behandlingstemaKode kaster feil", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema("MEL-1", 1, FTRL, "tilfeldig behandlingstemaKode");

      expect(url).toContain("/flyt-finnes-ikke-for-behandling");
    });

    it("Sakstype EU_EOS med støttet behandlingstemaKode returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
      );

      expect(url).toContain("/EU_EOS/saksbehandling/");
    });

    it("Sakstype FTRL med støttet behandlingstemaKode returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        FTRL,
        MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
      );

      expect(url).toContain("/FTRL/saksbehandling/");
    });

    it("FTRL behandlinger med behandlingstype årsavregning returnerer url", () => {
      const url = lagUrl(
        "MEL-1",
        1,
        FTRL,
        MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
        MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
        MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING,
      );

      expect(url).toContain("/FTRL/aarsavregning/");
    });

    it("MELOSYS-8163: EU_EOS/tjenesteperson-behandling med behandlingstype årsavregning returnerer aarsavregning-url uansett toggle", () => {
      const urlUtenToggle = lagUrl(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
        MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
        MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING,
      );
      expect(urlUtenToggle).toContain("/EU_EOS/aarsavregning/");

      const urlMedToggle = lagUrl(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
        MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
        MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING,
        false,
        true,
      );
      expect(urlMedToggle).toContain("/EU_EOS/aarsavregning/");
    });

    it("Sakstype TRYGDEAVTALE med støttet behandlingstemaKode returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        TRYGDEAVTALE,
        MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
      );

      expect(url).toContain("/TRYGDEAVTALE/saksbehandling/");
    });

    it("Sakstype TRYGDEAVTALE med IKKE_YRKESAKTIV returnerer url for ikkeYrkesaktiv", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        TRYGDEAVTALE,
        MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
      );

      expect(url).toContain("/TRYGDEAVTALE/ikkeYrkesaktiv/");
    });
  });

  describe("lagUrlForEuEøsFlyter", () => {
    it("Sakstype EU_EOS med registrering/unntaksperioder-behandlingstema returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
      );

      expect(url).toContain("/EU_EOS/registrering/");
      expect(url).toContain("unntaksperioder");
    });

    it("Sakstype EU_EOS med registrering/anmodningunntak-behandlingstema returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL,
      );

      expect(url).toContain("/EU_EOS/registrering/");
      expect(url).toContain("anmodningunntak");
    });

    it("Sakstype EU_EOS med vurderutpeking-behandlingstema returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
      );

      expect(url).toContain("/EU_EOS/vurderutpeking/");
    });
  });

  describe("tom flyt", () => {
    it("Sakstype FTRL med IKKE_YRKESAKTIV får ikke tom flyt", () => {
      const url = lagUrl(
        "MEL-1",
        1,
        FTRL,
        MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
        MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
        MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
      );

      expect(url).toContain("/FTRL/saksbehandling/");
    });

    it("Sakstype EU_EØS med IKKE_YRKESAKTIV får ikke tom flyt", () => {
      const url = lagUrl(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
        MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
        MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
      );

      expect(url).toContain("/EU_EOS/ikkeYrkesaktiv/");
    });

    it("TRYGDETID får tom flyt", () => {
      const url = lagUrl(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
        MKV.Koder.behandlinger.behandlingstema.TRYGDETID,
        MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
      );

      expect(url).toContain("/EU_EOS/behandling/");
    });

    it("YRKESAKTIV for FTRL får ikke tom flyt", () => {
      const url = lagUrl(
        "MEL-1",
        1,
        FTRL,
        MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
        MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
        MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
      );

      expect(url).toContain("/FTRL/saksbehandling/");
    });

    it("MANGLENDE_INNBETALING får ikke tom flyt", () => {
      const url = lagUrl(
        "MEL-1",
        1,
        FTRL,
        MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
        MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
        MKV.Koder.behandlinger.behandlingstyper.MANGLENDE_INNBETALING_TRYGDEAVGIFT,
      );

      expect(url).toContain("/FTRL/saksbehandling/");
    });

    it("Kombinasjoner som har unntaksregistrering-flyt får tom flyt med toggle på", () => {
      const url = lagUrl(
        "MEL-1",
        1,
        TRYGDEAVTALE,
        MKV.Koder.sakstemaer.UNNTAK,
        MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK,
        MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
      );

      expect(url).toContain("/TRYGDEAVTALE/unntaksregistrering/");
    });
  });
});

export {};
