import { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import { Utenlandsoppdraget } from "./utenlandsoppdraget";
import Soknadslandvelger from "./soknadslandvelger";

import MKV from "../../../../melosyskodeverk";

const { SØKNAD_FOLKETRYGDEN } = MKV.Koder.mottatteopplysningertyper;

describe("Utenlandsoppdraget", () => {
  let mockedProps = mock<ComponentProps<typeof Utenlandsoppdraget>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    mockedProps = mock<ComponentProps<typeof Utenlandsoppdraget>>();
    props = instance(mockedProps);
  });

  it("viser ikke soknadslandvelger dersom mottatteOpplysningerType er SØKNAD_FOLKETRYGDEN", () => {
    props.mottatteOpplysningerType = SØKNAD_FOLKETRYGDEN;

    const utenlandsoppdraget = shallow(<Utenlandsoppdraget {...props} />);

    const soknadslandvelger = utenlandsoppdraget.find(Soknadslandvelger);

    expect(soknadslandvelger).toHaveLength(0);
  });

  it("viser soknadslandvelger dersom mottatteOpplysningerType ikke er SØKNAD_FOLKETRYGDEN", () => {
    const utenlandsoppdraget = shallow(<Utenlandsoppdraget {...props} />);

    const soknadslandvelger = utenlandsoppdraget.find(Soknadslandvelger);

    expect(soknadslandvelger).toHaveLength(1);
  });
});
