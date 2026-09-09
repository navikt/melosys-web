import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

// Schemaene i ducks/form bygges på modulnivå og bruker yup-metoder som setupYup
// registrerer. Importrekkefølgen i entrypointet avgjør derfor om appen i det hele tatt
// starter: kommer App først, evalueres schemaet før metodene finnes, og appen faller
// med «erIkkeBlank is not a function» før noe rekker å rendres.
//
// Feilen er lett å gjeninnføre, for den oppstår ikke av en endring i index.jsx, men av
// at hvilken som helst komponent i App-treet får en ny – gjerne indirekte – import av et
// schema. Testen leser derfor rekkefølgen direkte i entrypointet.
describe("index.jsx – importrekkefølge", () => {
  it("kjører setupYup før appkoden, så yup-metodene finnes når schemaene bygges", () => {
    const kilde = fs.readFileSync(path.resolve(__dirname, "index.jsx"), "utf8");

    const setupYup = kilde.indexOf('import "./setupYup"');
    const app = kilde.indexOf('from "./App"');

    expect(setupYup).toBeGreaterThan(-1);
    expect(app).toBeGreaterThan(-1);
    expect(setupYup).toBeLessThan(app);
  });
});
