import type { PromData } from "@data/mapping/types";
import { addObservationItemsToQuestionnaireResponse } from "./utils";

export const addConfigurationsToQuestionnaireResponse = (response: PromData.QuestionnaireResponse, observations: PromData.Observation[], config: any): PromData.QuestionnaireResponse => {

    /**
     * 1. Observation items
     */
    const responseWithConfigSettings = addObservationItemsToQuestionnaireResponse(response, observations, config);
    return responseWithConfigSettings;

}