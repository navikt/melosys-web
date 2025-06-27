import VedleggRow from "./vedleggRow";
import { render } from "@testing-library/react";

const dokument = {
  dokumentID: "1",
  tittel: "test",
  logiskeVedlegg: [],
  id: "1",
  journalpostID: "1",
  dato: null,
  avsenderEllerMottaker: "a",
};

describe("vedleggRow", () => {
  it("snapshot test", () => {
    const { container } = render(
      <table>
        <tbody>
          <VedleggRow slettVedlegg={vi.fn()} vedlegg={dokument} redigerbart />
        </tbody>
      </table>,
    );
    expect(container).toMatchSnapshot();
  });
});
