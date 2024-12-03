import * as Api from "../../services/api";
import { SedPdfData } from "Domene";

interface DokumentMetadataType {
  // Disse er begge optional og vil overskrive ellers standard visning av navn
  dokumentNavn?: string;
  mottakerNavn?: string;
}

export interface BrevDokumentMetadataType extends DokumentMetadataType {
  dokumentData: Api.DokumenterV2.OpprettBrevReqDto;
}

export interface SedDokumentMetadataType extends DokumentMetadataType {
  sedType: string;
  sedData?: SedPdfData;
}

export interface DokumentlisteType {
  behandlingID: number;
  dokumenter: (BrevDokumentMetadataType | SedDokumentMetadataType)[];
  validateOnClick?: () => Promise<unknown> | {};
}

export const isSed = (
  dokument: BrevDokumentMetadataType | SedDokumentMetadataType,
): dokument is SedDokumentMetadataType => "sedType" in dokument;

export const isBrev = (
  dokument: BrevDokumentMetadataType | SedDokumentMetadataType,
): dokument is BrevDokumentMetadataType => "dokumentData" in dokument;
