import type { PromData } from "@customTypes/promData";

export namespace Patient {
    interface Patient {
        patientId: string;
        name: string;
        proms: Record<string, PromData.QuestionnaireResponse>;
    }
}