import React from "react";

import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  isScoreSeries,
  getLabelFromOriginalValueAndDataSeriesName,
  getDataSeriesNameFromShortName, type Visualization,
} from "@utils/visualization";
import * as _ from "lodash-es";

const DomainCard = ({ 
    domain, 
    dimensionsByQuestionnaireName, 
    colors=[""] }: Visualization.DomainCardProps) => {
    
    
   
  return (
    <ul className="tw:list tw:pb-1 tw:bg-base-100 tw:rounded-box tw:shadow-md tw:w-64">
      <li className="tw:p-4 tw:pb-2 tw:font-bold tw:whitespace-pre-wrap">{domain}</li>
        {Object.entries(dimensionsByQuestionnaireName).map(([questionnaire, dimensions]) => {
            return (
              <li className="tw:list-row tw:py-2" key={questionnaire}>
                <ul className="tw:list">
                    {dimensions.map((dim) => (
                        <li className="tw:list-row tw:border-b-0">
                            <div className="tw:text-xs tw:truncate tw:list-col-grow">{dim}</div>
                            {/* <div className="tw:w-3 tw:h-3 tw:rounded-full tw:bg-primary"></div> */}
                        </li>
                ))}
                </ul>
                
              </li>
            );
        })}
    </ul>
        
      
  );


}

export default DomainCard;