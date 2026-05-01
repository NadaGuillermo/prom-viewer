import type { PromData } from "@data/mapping/types";

export namespace Patient {
  interface Patient {
    patientId: string;
    name: string;
    proms: Record<string, PromData.QuestionnaireResponse>;
  }
}
