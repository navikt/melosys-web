import { expect } from "@playwright/test";

import {
  aapneBehandling,
  bekreft,
  fyllBehandling,
  fyllTrygdeavgiftsperioder,
  home,
  opprettForstegangsbehandling,
} from "../testutils/utils";

export const OpprettForstegangsbehandling = async (page: any, behandlingOptions: any) => {
  await home(page);

  await opprettForstegangsbehandling(page);
  await aapneBehandling(page, 1);
  await fyllBehandling(page, behandlingOptions);

  await fyllTrygdeavgiftsperioder(page, behandlingOptions.trygdeavgiftOptions);
  await bekreft(page);
  await expect(
    page.getByRole("heading", { name: "Pliktig medlemskap etter folketrygdloven", exact: true }),
  ).toBeVisible();
  //await page.pause();
  await page.getByRole("button", { name: "Fatt vedtak" }).click();
};
