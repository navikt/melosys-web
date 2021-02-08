import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import * as Land from "./land";

import MKV from "../../../../melosyskodeverk";

import { Arbeidssteder } from "./arbeidssteder";
import EditerbartElementListe from "../editerbartElementListe";

describe("Arbeidssteder", () => {
  const mockedProps = mock<ComponentProps<typeof Arbeidssteder>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  describe("Arbeidssteder på land", () => {
    it("rendres vanligvis uten spørsmål fra altinn-søknad", () => {
      const arbeidssteder = shallow(<Arbeidssteder {...props} />);
      const arbeidsstederPaaLand = arbeidssteder.findWhere(
        (n) => n.type() === EditerbartElementListe && n.props().feltNavn === "arbeidPaaLand.fysiskeArbeidssteder"
      );

      expect(arbeidsstederPaaLand.props().redigererPreElementerKomponent).toBeUndefined();
      expect(arbeidsstederPaaLand.props().redigeringUtfortPreElementerKomponent).toBeUndefined();
      expect(arbeidsstederPaaLand.props().ingenDataKomponent).toBeUndefined();
    });

    it("rendres med spørsmål fra altinn-søknad dersom behanldingsgrunnlagtype tilsvarer altinn-søknad", () => {
      props.behandlingsgrunnlagtype = MKV.Koder.behandlingsgrunnlagtyper.SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS;
      const arbeidssteder = shallow(<Arbeidssteder {...props} />);
      const arbeidsstederPaaLand = arbeidssteder.findWhere(
        (n) => n.type() === EditerbartElementListe && n.props().feltNavn === "arbeidPaaLand.fysiskeArbeidssteder"
      );

      expect(arbeidsstederPaaLand.props().redigererPreElementerKomponent).toBe(Land.RedigererPreElementer);
      expect(arbeidsstederPaaLand.props().redigeringUtfortPreElementerKomponent).toBe(
        Land.RedigeringUtfortPreElementer
      );
      expect(arbeidsstederPaaLand.props().ingenDataKomponent).toBe(Land.IngenData);
    });
  });
});
