import type { PromData } from "@customTypes/promData";

export namespace Patient {
    interface Patient {
        patientId: string;
        firstName?: string;
        lastName?: string;
        proms: Record<string, PromData.QuestionnaireResponse>;
    }
}