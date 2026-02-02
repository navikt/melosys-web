import { DokumentOversikt } from "Domene";

import * as selectors from "./selectors";
import { hentDato } from "./selectors";
import * as Types from "./types";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services";
import MKV from "../../melosyskodeverk";

describe("DokumenterSelectors", () => {
  const lagDokumentOversiktState = ({ dokumentOversikt = [] }: Types.Data) =>
    DucksTestUtils.lagState({
      dokumenter: {
        status: STATUS.OK,
        data: {
          dokumentOversikt,
        },
      },
    });

  describe("DokumenterSelector", () => {
    it("henter ut data", () => {
      const state = lagDokumentOversiktState({});

      const resultat = selectors.DokumenterSelector(state);
      expect(resultat.data).toBeTruthy();
    });
  });

  describe("DokumentOversiktSelector", () => {
    it("henter dokumentOversikt", () => {
      const state = lagDokumentOversiktState({});

      const dokumentOversikt = selectors.DokumentOversiktSelector(state);
      expect(dokumentOversikt).toEqual([]);
    });
  });

  const dokumenter: DokumentOversikt[] = [
    {
      journalforingDato: "01-01-2020",
      mottattDato: "01-01-2020",
      journalpostID: "123",
      avsenderEllerMottaker: "Kong Harald V",
      mottaksretning: { kode: "INN", term: "Inngående" },
      hoveddokument: {
        tittel: "Søknad om A1",
        dokumentID: "456",
        logiskeVedlegg: ["Førerkort", "Pass"],
      },
      vedlegg: [
        {
          tittel: "Vedlegg 1",
          dokumentID: "789",
          logiskeVedlegg: [],
        },
        {
          tittel: "Vedlegg 2",
          dokumentID: "987",
          logiskeVedlegg: ["Logisk vedlegg"],
        },
      ],
    },
  ];

  describe("HovedDokumentSelector", () => {
    it("henter hoveddokument", () => {
      const state = lagDokumentOversiktState({ dokumentOversikt: dokumenter });

      const hovedDokument = selectors.HoveddokumentSelector(state);
      expect(hovedDokument).toContainEqual({
        journalpostID: "123",
        dokumentID: "456",
        tittel: "Søknad om A1",
        logiskeVedlegg: ["Førerkort", "Pass"],
        avsenderEllerMottaker: "Kong Harald V",
        id: "123-456",
        dato: "01-01-2020",
      });
    });
  });

  describe("VedleggSelector", () => {
    it("henter vedlegg", () => {
      const state = lagDokumentOversiktState({ dokumentOversikt: dokumenter });

      const vedlegg = selectors.VedleggSelector(state);
      expect(vedlegg.length).toBe(2);

      const titler = vedlegg.map((v) => v.tittel);
      expect(titler).toContainEqual("Vedlegg 1");
      expect(titler).toContainEqual("Vedlegg 2");
    });
  });

  describe("AlleFysiskeDokumentSelector", () => {
    it("henter alle fysiske dokumenter", () => {
      const state = lagDokumentOversiktState({ dokumentOversikt: dokumenter });

      const fysiskeDokumenter = selectors.AlleFysiskeDokumentSelector(state);
      expect(fysiskeDokumenter.length).toBe(3);

      const titler = fysiskeDokumenter.map((v) => v.tittel);
      expect(titler).toContainEqual("Søknad om A1");
      expect(titler).toContainEqual("Vedlegg 1");
      expect(titler).toContainEqual("Vedlegg 2");
    });
  });

  describe("hentDato", () => {
    it("returnerer mottattDato for inngående dokument", () => {
      const mottaksretning = { kode: MKV.Koder.mottaksretning.INN, term: "Inngående" };
      expect(hentDato(mottaksretning, "2024-01-15", "2024-01-20")).toBe("2024-01-15");
    });

    it("returnerer journalforingDato for utgående dokument", () => {
      const mottaksretning = { kode: MKV.Koder.mottaksretning.UT, term: "Utgående" };
      expect(hentDato(mottaksretning, "2024-01-15", "2024-01-20")).toBe("2024-01-20");
    });

    it("returnerer journalforingDato for inngående uten mottattDato", () => {
      const mottaksretning = { kode: MKV.Koder.mottaksretning.INN, term: "Inngående" };
      expect(hentDato(mottaksretning, null, "2024-01-20")).toBe("2024-01-20");
    });
  });
});
