import OppdaterRegisteropplysninger from "./oppdaterRegisteropplysninger";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";

const mocks = vi.hoisted(() => {
  return {
    _memoize: vi.fn(),
  };
});

vi.mock("../../utils", () => ({
  _uuid: () => "123",
  _memoize: mocks._memoize,
}));

describe("oppdaterRegisteropplysninger", () => {
  it("snapshot test", () => {
    const { container } = renderWithProviders(
      <OppdaterRegisteropplysninger oppdaterRegisteropplysninger={vi.fn()} sistOppdatert="2020-08-23" />,
      {}
    );
    expect(container).toMatchSnapshot();
  });
});
