import { test, expect } from "@playwright/test";

import { OpprettForstegangsbehandling } from "./opprettForstegangsbehandling";
import { aapneBehandling, forkastAarsavregning, opprettAarsavregning } from "../testutils/utils";

const SKATTEPLIKTIG = "SKATTEPLIKTIG";
const IKKE_SKATTEPLIKTIG = "IKKE_SKATTEPLIKTIG";

test.only("MELOSYS-6528 aarsavregning viser tidligere grunnlag ved valg av år", async ({ page }) => {
  const options = {
    fromDate: "11.01.2024",
    toDate: "12.01.2024",
    trygdeavgiftOptions: {
      skatteplikttype: IKKE_SKATTEPLIKTIG,
    },
  };

  await OpprettForstegangsbehandling(page, options);
  await opprettAarsavregning(page, "");
  await aapneBehandling(page, 0);

  await page.selectOption("#aarVelger", "2024");
  await page.pause();
  await forkastAarsavregning(page);
});
