import renderer from "react-test-renderer";
import FritekstvedleggSkjema from "./fritekstvedleggSkjema";
import { FeltType } from "../../../services/modules/dokumenter-v2";

const felt = {
  kode: "",
  beskrivelse: "",
  feltType: FeltType.FRITEKST,
  hjelpetekst: null,
  paakrevd: false,
  tegnBegrensning: 160,
  valg: null,
};

it("fritekstvedleggSkjema renders correctly ", () => {
  const tree = renderer
    .create(
      <FritekstvedleggSkjema resetFritekstvedlegg={jest.fn()} leggTilFritekstvedlegg={jest.fn()} felt={felt} width="" />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
