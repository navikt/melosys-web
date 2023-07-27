import { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import { RedigeringUtfort } from "./redigeringUtfort";
import Beskrivelse from "../beskrivelse";
import Sporsmal from "../sporsmal";

describe("RedigeringUtført", () => {
  const mockedProps = mock<ComponentProps<typeof RedigeringUtfort>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.arbeidssituasjonOgOevrig = {};
  });

  it("beskrivelseArbeidSisteMnd vises hvis harLoennetArbeidMinstEnMndFoerUtsending er false", () => {
    props.arbeidssituasjonOgOevrig.harLoennetArbeidMinstEnMndFoerUtsending = false;

    const redigeringUtfort = shallow(<RedigeringUtfort {...props} />);

    expect(
      redigeringUtfort.find(Beskrivelse).findWhere((n) => n.props().label === Sporsmal.beskrivelseArbeidSisteMnd)
    ).toHaveLength(1);
  });

  it("beskrivelseArbeidSisteMnd vises ikke hvis harLoennetArbeidMinstEnMndFoerUtsending er true", () => {
    props.arbeidssituasjonOgOevrig.harLoennetArbeidMinstEnMndFoerUtsending = true;

    const redigeringUtfort = shallow(<RedigeringUtfort {...props} />);

    expect(
      redigeringUtfort.find(Beskrivelse).findWhere((n) => n.props().label === Sporsmal.beskrivelseArbeidSisteMnd)
    ).toHaveLength(0);
  });

  it("beskrivelseAnnetArbeid vises hvis harAndreArbeidsgivereIUtsendingsperioden er true", () => {
    props.arbeidssituasjonOgOevrig.harAndreArbeidsgivereIUtsendingsperioden = true;

    const redigeringUtfort = shallow(<RedigeringUtfort {...props} />);

    expect(
      redigeringUtfort.find(Beskrivelse).findWhere((n) => n.props().label === Sporsmal.beskrivelseAnnetArbeid)
    ).toHaveLength(1);
  });

  it("beskrivelseAnnetArbeid vises ikke hvis harAndreArbeidsgivereIUtsendingsperioden er false", () => {
    props.arbeidssituasjonOgOevrig.harAndreArbeidsgivereIUtsendingsperioden = false;

    const redigeringUtfort = shallow(<RedigeringUtfort {...props} />);

    expect(
      redigeringUtfort.find(Beskrivelse).findWhere((n) => n.props().label === Sporsmal.beskrivelseAnnetArbeid)
    ).toHaveLength(0);
  });
});
