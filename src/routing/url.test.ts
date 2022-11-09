import { lagUrl, lagUrlFraSakstypeOgBehandlingstema } from "./url";
import MKV from "../melosyskodeverk";

const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;

describe("url", () => {
  describe("lagUrlFraSakstypeOgBehandlingstema", () => {
    it("sakstype finnes ikke kaster feil", () => {
      const hentUrl = () =>
        lagUrlFraSakstypeOgBehandlingstema("MEL-1", 1, "En sakstype vi ikke støtter", "tilfeldig behandlingstemaKode");

      expect(hentUrl).toThrowError("Støtter ikke sakstype:");
    });

    it("Sakstype EU_EOS med ustøttet behandlingstemaKode kaster feil", () => {
      const hentUrl = () => lagUrlFraSakstypeOgBehandlingstema("MEL-1", 1, EU_EOS, "tilfeldig behandlingstemaKode");

      expect(hentUrl).toThrowError("Finner ikke EuEøs-flyt for behandlingstema:");
    });

    it("Sakstype TRYGDEAVTALE med ustøttet behandlingstemaKode kaster feil", () => {
      const hentUrl = () =>
        lagUrlFraSakstypeOgBehandlingstema("MEL-1", 1, TRYGDEAVTALE, "tilfeldig behandlingstemaKode");

      expect(hentUrl).toThrowError("Finner ikke trygdeavtale-flyt for behandlingstema:");
    });

    it("Sakstype EU_EOS med støttet behandlingstemaKode returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER
      );

      expect(url).toContain("/EU_EOS/saksbehandling/");
    });

    it("Sakstype FTRL med støttet behandlingstemaKode returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        FTRL,
        MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV
      );

      expect(url).toContain("/FTRL/saksbehandling/");
    });

    it("Sakstype TRYGDEAVTALE med støttet behandlingstemaKode returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        TRYGDEAVTALE,
        MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV
      );

      expect(url).toContain("/TRYGDEAVTALE/saksbehandling/");
    });
  });

  describe("lagUrlForEuEøsFlyter", () => {
    it("Sakstype EU_EOS med sed-behandlingstema returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.behandlinger.behandlingstema.TRYGDETID
      );

      expect(url).toContain("/EU_EOS/sedbehandling/");
    });

    it("Sakstype EU_EOS med registrering/unntaksperioder-behandlingstema returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING
      );

      expect(url).toContain("/EU_EOS/registrering/");
      expect(url).toContain("unntaksperioder");
    });

    it("Sakstype EU_EOS med registrering/anmodningunntak-behandlingstema returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL
      );

      expect(url).toContain("/EU_EOS/registrering/");
      expect(url).toContain("anmodningunntak");
    });

    it("Sakstype EU_EOS med vurderutpeking-behandlingstema returnerer url", () => {
      const url = lagUrlFraSakstypeOgBehandlingstema(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE
      );

      expect(url).toContain("/EU_EOS/vurderutpeking/");
    });
  });

  describe("tom flyt", () => {
    it("IKKE_YRKESAKTIV får tom flyt", () => {
      const url = lagUrl(
        "MEL-1",
        1,
        EU_EOS,
        MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
        MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
        MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
        "enabled"
      );

      expect(url).toContain("/EU_EOS/behandling/");
    });

    it("YRKESAKTIV for FTRL får ikke tom flyt med toggle på", () => {
      const url = lagUrl(
        "MEL-1",
        1,
        FTRL,
        MKV.Koder.sakstemaer.FTRL_SAKSBEHANDLING,
        MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
        MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
        "enabled"
      );

      expect(url).toContain("/FTRL/saksbehandling/");
    });

    it("YRKESAKTIV for FTRL får tom flyt med toggle av", () => {
      const url = lagUrl(
        "MEL-1",
        1,
        FTRL,
        MKV.Koder.sakstemaer.FTRL_SAKSBEHANDLING,
        MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
        MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
        "disabled"
      );

      expect(url).toContain("/FTRL/behandling/");
    });
  });
});
export {};
