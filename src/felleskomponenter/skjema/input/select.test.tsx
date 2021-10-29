import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";
import { WrappedFieldMetaProps } from "redux-form";

import * as Nav from "../../../navFrontend";

import Select, { SelectWrappedComponent } from "./select";

describe("Select", () => {
  const mockedProps = mock<ComponentProps<typeof Select>>();
  const props = instance(mockedProps);

  it("viser en redux form Field komponent med korrekte props", () => {
    props.feltNavn = "feltnavn";
    props.id = "1234";
    props.className = "class name";
    const select = shallow(<Select {...props} />);
    const field = select.find("Field");

    expect(field).toHaveLength(1);
    expect(field.props().name).toBe(props.feltNavn);
    expect(field.props().id).toBe(props.id);
    expect(field.props().className).toBe(props.className);
  });
});

describe("SelectWrappedComponent", () => {
  const mockedProps = mock<ComponentProps<typeof SelectWrappedComponent>>();
  const props = instance(mockedProps);
  props.label = "";
  const mockedMeta = mock<WrappedFieldMetaProps>();
  props.meta = instance(mockedMeta);

  it("viser en Nav Select", () => {
    const selectWrappedComponent = shallow(<SelectWrappedComponent {...props} />);
    expect(selectWrappedComponent.find("Select")).toHaveLength(1);
  });

  it("sender label prop til Nav Select", () => {
    props.label = "label tekst";
    const selectWrappedComponent = shallow(<SelectWrappedComponent {...props} />);

    expect(selectWrappedComponent.find(Nav.Select).props().label).toBe(props.label);
  });

  it("setter feil-prop dersom meta.error prop finnes", () => {
    props.meta.touched = true;
    props.meta.active = false;
    props.meta.error = "err";
    const selectWrappedComponent = shallow(<SelectWrappedComponent {...props} />);

    expect(selectWrappedComponent.find(Nav.Select).props().feil).toEqual({ feilmelding: props.meta.error });
  });

  it("setter ikke feil-prop dersom meta.error prop ikke finnes", () => {
    props.meta.error = null;
    const selectWrappedComponent = shallow(<SelectWrappedComponent {...props} />);

    expect(selectWrappedComponent.find(Nav.Select).props().feil).toBeUndefined();
  });

  it("sender children-prop til Nav Select sin children-prop", () => {
    props.children = "children";
    const selectWrappedComponent = shallow(<SelectWrappedComponent {...props} />);

    expect(selectWrappedComponent.find(Nav.Select).props().children).toContain(props.children);
  });
});
