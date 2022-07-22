import { lazy, object, string } from "yup";
import { BOOLSK_STRING } from "../../../../constants";
import * as Utils from "../../../../utils";

const INNVILGET_KREVES = { melding: "Du må velge om familiemedlem skal innvilges" };
const BEGRUNNELSE_KREVES = { melding: "Du må velge begrunnelse" };

const vurdering_familie = object().shape({
  barn: lazy((obj) =>
    obj && !Utils._isEmpty(obj)
      ? object()
          .shape({
            ...Object.keys(obj).reduce((acc, key) => {
              if (key === "fritekst") {
                acc[key] = string().nullable();
              } else {
                acc[key] = object()
                  .shape({
                    innvilget: string().required(INNVILGET_KREVES),
                    begrunnelse: string()
                      .when("innvilget", {
                        is: BOOLSK_STRING.USANN,
                        then: string().required(BEGRUNNELSE_KREVES),
                      })
                      .nullable(),
                  })
                  .nullable();
              }
              return acc;
            }, {}),
          })
          .nullable()
      : object().nullable()
  ),
  ektefelle: object()
    .shape({
      fritekst: string().nullable(),
      innvilget: lazy((innvilget) =>
        innvilget && innvilget !== "" ? string().required(INNVILGET_KREVES) : string().nullable()
      ),
      begrunnelse: string()
        .when("innvilget", {
          is: BOOLSK_STRING.USANN,
          then: string().required(BEGRUNNELSE_KREVES),
        })
        .nullable(),
    })
    .nullable(),
});

export default vurdering_familie;
