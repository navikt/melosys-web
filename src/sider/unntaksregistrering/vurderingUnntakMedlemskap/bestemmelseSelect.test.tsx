import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FieldValues, useForm } from "react-hook-form";
import MKV from "../../../melosyskodeverk";
import { BestemmelseSelect } from "./bestemmelseSelect";

const bestemmelser = [
  { kode: "KODE_1", term: "Bestemmelse 1" },
  { kode: "KODE_2", term: "Bestemmelse 2" },
] as any;

function TestBestemmelseSelect({
  bestemmelse = "",
  lagreBestemmelse = vi.fn(),
  redigerbart = true,
}: {
  bestemmelse?: string;
  lagreBestemmelse?: (bestemmelse: string) => void;
  redigerbart?: boolean;
}) {
  const { control } = useForm<FieldValues>({ defaultValues: { bestemmelse, trygdedekning: "" } });
  return (
    <BestemmelseSelect
      formValues={{ bestemmelse }}
      control={control}
      bestemmelser={bestemmelser}
      lagreBestemmelse={lagreBestemmelse}
      lagreTrygdedekning={vi.fn()}
      redigerbart={redigerbart}
    />
  );
}

const bestemmelseFelt = () => screen.getByRole("combobox", { name: "Bestemmelse" });

describe("BestemmelseSelect", () => {
  it("rendrer bestemmelse som combobox", () => {
    render(<TestBestemmelseSelect />);
    expect(bestemmelseFelt()).toBeDefined();
  });

  it("viser bestemmelser fra kodeverk når listen åpnes", async () => {
    render(<TestBestemmelseSelect />);
    await userEvent.click(bestemmelseFelt());
    expect(screen.getByRole("option", { name: "Bestemmelse 1" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Bestemmelse 2" })).toBeDefined();
  });

  it("filtrerer bestemmelser på det som skrives", async () => {
    render(<TestBestemmelseSelect />);
    await userEvent.type(bestemmelseFelt(), "Bestemmelse 2");
    expect(screen.queryByRole("option", { name: "Bestemmelse 1" })).toBeNull();
    expect(screen.getByRole("option", { name: "Bestemmelse 2" })).toBeDefined();
  });

  it("lagrer kode for valgt bestemmelse", async () => {
    const lagreBestemmelse = vi.fn();
    render(<TestBestemmelseSelect lagreBestemmelse={lagreBestemmelse} />);
    await userEvent.click(bestemmelseFelt());
    await userEvent.click(screen.getByRole("option", { name: "Bestemmelse 2" }));
    expect(lagreBestemmelse).toHaveBeenCalledWith("KODE_2");
  });

  it("markerer lagret bestemmelse som valgt", async () => {
    render(<TestBestemmelseSelect bestemmelse="KODE_1" />);
    await userEvent.click(bestemmelseFelt());
    expect(screen.getByRole("option", { name: "Bestemmelse 1" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("option", { name: "Bestemmelse 2" }).getAttribute("aria-selected")).toBe("false");
  });

  it("viser dekning-tekst når bestemmelse er valgt (ikke USA/CAN unntak)", () => {
    render(<TestBestemmelseSelect bestemmelse="KODE_1" />);
    expect(screen.getByText("Dekning")).toBeDefined();
  });

  it("viser dekning-select for USA Art 5.9", () => {
    const usaKode = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us.USA_ART5_9;
    render(<TestBestemmelseSelect bestemmelse={usaKode} />);
    expect(screen.getByRole("combobox", { name: "Dekning" })).toBeDefined();
  });

  it("viser dekning-select for Canada Art 11", () => {
    const canKode = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca.CAN_ART11;
    render(<TestBestemmelseSelect bestemmelse={canKode} />);
    expect(screen.getByRole("combobox", { name: "Dekning" })).toBeDefined();
  });

  it("skjuler dekning når ingen bestemmelse er valgt", () => {
    render(<TestBestemmelseSelect />);
    expect(screen.queryByText("Dekning")).toBeNull();
  });
});
