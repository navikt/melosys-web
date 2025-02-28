import {
  aapneBehandling,
  bekreft,
  fyllBehandling,
  fyllTrygdeavgiftsperioder,
  opprettForstegangsbehandling,
} from "../testutils/utils";

export const OpprettForstegangsbehandling = async (page: any, behandlingOptions: any) => {
  await page.goto("http://localhost:3000/melosys");

  await opprettForstegangsbehandling(page);
  await aapneBehandling(page, 1);
  await fyllBehandling(page, behandlingOptions);

  //  await page.pause();

  await fyllTrygdeavgiftsperioder(page, behandlingOptions.trygdeavgiftOptions);

  await bekreft(page);

  await page.getByRole("button", { name: "Fatt vedtak" }).click();
};
