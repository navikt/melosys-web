import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import * as Nav from "../../../../navFrontend";
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

  it("viser infomelding i stedet for arbeidssteder når erUkjenteEllerAlleEosLand er true", () => {
    props.soknadsland = {
      erUkjenteEllerAlleEosLand: true,
    };
    const arbeidssteder = shallow(<Arbeidssteder {...props} />);

    const alertstripe = arbeidssteder.find(Nav.AlertStripe);

    expect(alertstripe).toHaveLength(1);
    expect(alertstripe.children().text()).toBe(
      "Ikke mulig å legge til arbeidssted(er) når det ikke er oppgitt land. Du kan endre dette under sidemenypunkt “Periode og land”."
    );
  });

  describe("Arbeidssteder på land", () => {
    it("rendres vanligvis uten spørsmål fra altinn-søknad", () => {
      props.soknadsland = {
        erUkjenteEllerAlleEosLand: false,
      };
      const arbeidssteder = shallow(<Arbeidssteder {...props} />);
      const arbeidsstederPaaLand = arbeidssteder.findWhere(
        (n) => n.type() === EditerbartElementListe && n.props().feltNavn === "arbeidPaaLand.fysiskeArbeidssteder"
      );

      expect(arbeidsstederPaaLand.props().redigererPreElementerKomponent).toBeUndefined();
      expect(arbeidsstederPaaLand.props().redigeringUtfortPreElementerKomponent).toBeUndefined();
      expect(arbeidsstederPaaLand.props().ingenDataKomponent).toBeUndefined();
    });

    it("rendres med spørsmål fra altinn-søknad dersom mottatteOpplysningerType tilsvarer altinn-søknad", () => {
      props.soknadsland = {
        erUkjenteEllerAlleEosLand: false,
      };
      props.mottatteOpplysningerType = MKV.Koder.mottatteopplysningertyper.SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS;
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
