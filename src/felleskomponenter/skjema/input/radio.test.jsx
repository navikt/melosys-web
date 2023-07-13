import Radio, { InnerInputComponent } from "./radio";

describe("Radio", () => {
  let props = null;

  beforeEach(() => {
    props = {
      feltNavn: "",
      className: "",
      id: "1",
    };
  });

  it("viser en redux form Field komponent", () => {
    const radio = shallow(<Radio {...props} />);

    expect(radio.find("Field")).toHaveLength(1);
  });

  it("sender className prop korrekt", () => {
    const radio = shallow(<Radio {...props} />);

    expect(radio.find("Field").props().className).toBe(props.className);
  });

  it("sender id prop korrekt", () => {
    const radio = shallow(<Radio {...props} />);

    expect(radio.find("Field").props().id).toBe(props.id);
  });

  it("sender feltnavn prop korrekt", () => {
    const radio = shallow(<Radio {...props} />);

    expect(radio.find("Field").props().name).toBe(props.feltNavn);
  });
});

describe("InnerInputComponent", () => {
  let props = null;

  beforeEach(() => {
    props = {
      input: {
        value: "",
        name: "",
      },
      meta: {
        error: "",
        touched: false,
        active: true,
        dispatch: vi.fn(),
      },
      forhandsvalgt: false,
      label: "",
    };
  });

  it("viser en Nav Radio komponent", () => {
    const innerInputComponent = shallow(<InnerInputComponent {...props} />);

    expect(innerInputComponent.find("Radio")).toHaveLength(1);
  });

  it("setter checked-prop korrekt", () => {
    const data = [
      [true, false, true, true],
      [false, false, false, true],
      [true, true, false, true],
      [false, true, false, false],
      [true, false, false, false],
    ];
    data.forEach((testdata) => {
      /* eslint-disable prefer-destructuring */
      props.input.value = testdata[0];
      props.value = testdata[1];
      props.forhandsvalgt = testdata[2];
      /* eslint-enable prefer-destructuring */
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.props().checked).toBe(testdata[3]);
    });
  });

  it("setter feil-prop korrekt", () => {
    const data = [
      ["error", false, true, undefined],
      ["error", true, true, undefined],
      ["", true, false, undefined],
    ];
    data.forEach((testdata) => {
      /* eslint-disable prefer-destructuring */
      props.meta.error = testdata[0];
      props.meta.touched = testdata[1];
      props.meta.active = testdata[2];
      /* eslint-enable prefer-destructuring */
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.props().feil).toBe(testdata[3]);
    });
  });

  it('gitt props meta.error = "error", meta.touched = true, meta.active = false, sett feil = "error"', () => {
    props.meta.error = "error";
    props.meta.touched = true;
    props.meta.active = false;
    const innerInputComponent = shallow(<InnerInputComponent {...props} />);

    expect(innerInputComponent.props().feil).toBe("error");
  });

  describe("Radio-komponent", () => {
    it("ved blur, kall meta sin dispatch", () => {
      props.meta.dispatch = vi.fn();
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      innerInputComponent.find("Radio").simulate("blur");

      expect(props.meta.dispatch).toHaveBeenCalled();
    });
  });
});
