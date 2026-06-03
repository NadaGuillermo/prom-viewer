import React from "react";

import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  isScoreSeries,
  getLabelFromOriginalValueAndDataSeriesName,
  type Visualization,
} from "@utils/visualization";
import * as _ from "lodash-es";

const QuestionnaireCard = ({ questionnaire, dimensions, lengthOfLongestQuestionnaireName }: Visualization.QuestionnaireCardProps) => {
    const questionnaireName = questionnaire.name.trim();
    const lineLength = 31;
    const questionnaireNameLength = questionnaireName.length;
    const lines = Math.ceil(lengthOfLongestQuestionnaireName / lineLength);
    const questionnaireLines = Math.ceil(questionnaireNameLength / lineLength);
    const linesToBeAdded = lines - questionnaireLines;
    const nameString = linesToBeAdded > 0 ? `${questionnaireName + "\n ".repeat(linesToBeAdded)}` : questionnaireName;

    /* return (
    <div className="tw:card tw:bg-base-100 tw:shadow-md tw:w-64">
      <div className="tw:card-body tw:p-4">
        <h4 className="tw:card-title tw:text-sm tw:whitespace-pre-wrap">{nameString}</h4>

        <div
          className="tw:grid"
          style={{
            gridTemplateColumns: "1fr auto",
            gridTemplateRows: `repeat(${dimensions.length}, minmax(20px, auto))`,
            rowGap: "4px"
          }} EORTC QLQ-C30 Quality of Life 
        >
          {dimensions.map((dim) => {
            const hasDim = questionnaire.dimensions.includes(dim);

            return (
              <React.Fragment key={dim}>
                
                <div className="tw:text-xs tw:truncate">{dim}</div>

                
                <div className="tw:flex tw:justify-center tw:items-center">
                  {hasDim && (
                    <div className="tw:w-3 tw:h-3 tw:rounded-full tw:bg-primary"></div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>  
      </div>
    </div>
  ); */
  return (
    <ul className="tw:list tw:pb-1 tw:bg-base-100 tw:rounded-box tw:shadow-md tw:w-64">
      <li className="tw:p-4 tw:pb-2 tw:font-bold tw:whitespace-pre-wrap">{nameString}</li>
      {dimensions.map((dim) => {
        const hasDim = questionnaire.dimensions.includes(dim);

            return (
              <li className="tw:list-row tw:py-2" key={dim}>
                <div className="tw:text-xs tw:truncate tw:list-col-grow">{dim}</div>
                <div>
                  {hasDim && (
                    <div className="tw:w-3 tw:h-3 tw:rounded-full tw:bg-primary"></div>
                  )}
                </div>
              </li>
            );
        })}
    </ul>
        
      
  );


}

export default QuestionnaireCard;