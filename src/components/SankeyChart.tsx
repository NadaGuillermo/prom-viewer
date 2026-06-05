import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
// import type { Visualization } from "@utils/visualization";
import type { Charts } from "@utils/charts";
import * as echarts from "echarts/core";
import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  type Visualization,
} from "@utils/visualization";

import "@styles/echartStyles.css";
import * as _ from "lodash-es";

const SankeyChart = ({
  data}: Visualization.SankeyProps) => {

    console.log("Sankey Data: ", data)
  
  // filter empty dimensions and questionnaires
  const filteredData: Record<string, Record<string, string[]>> = {};
  Object.entries(data).forEach(([domain, dimensionsByQuestionnaire]) => {
    const filteredDimensionsByQuestionnaire: Record<string, string[]> = {};
    Object.entries(dimensionsByQuestionnaire).forEach(([questionnaire, dimensions]) => {
      const filteredDimensions = dimensions.filter((dim) => dim.trim() !== "");
      if (filteredDimensions.length > 0) {
        filteredDimensionsByQuestionnaire[questionnaire] = filteredDimensions;
      }
    });
    if (Object.keys(filteredDimensionsByQuestionnaire).length > 0) {
      filteredData[domain] = filteredDimensionsByQuestionnaire;
    }
  });

  const itemNames: string[] = [];
  const itemLinks: {source: string, target: string, value: number}[] = [];

  const allDimensions = Object.values(filteredData).flatMap((dimensionsByQuestionnaire) => Object.values(dimensionsByQuestionnaire).flatMap((dimension) => dimension));
  const allUniqueDimensions = _.uniq(allDimensions);
  const numberOfDimensions = allUniqueDimensions.length;

  const makeUniqueName = (name: string, type: "dom" | "qst" | "dim" | "") => {
    if (type === "dom") {
      return name + " dom";
    } else if (type === "qst") {
      return name + " qst";
    } else if (type === "dim") {
      return name + " dim";
    } else {
      return name;
    }
  }
  
  Object.entries(filteredData).forEach(([domain, dimensionsByQuestionnaire]) => {
    // use unique names, i.e. the sets of domain names, questionnaire names and dimension names are pairwise dijoint
    const uniqueDomainName = makeUniqueName(domain, "dom");;
    if (!itemNames.includes(uniqueDomainName)) {
      itemNames.push(uniqueDomainName);
    }

    Object.entries(dimensionsByQuestionnaire).forEach(([questionnaire, dimensions]) => {
      const uniqueQuestionnaireName = makeUniqueName(questionnaire, "qst");
      if (!itemNames.includes(uniqueQuestionnaireName)) {
        itemNames.push(uniqueQuestionnaireName);
      }
      dimensions.forEach((dim) => {
        const uniqueDimensionName = makeUniqueName(dim, "dim");
        if (!itemNames.includes(uniqueDimensionName)) {
          itemNames.push(uniqueDimensionName);
        }
        itemLinks.push({
          source: uniqueDomainName,
          target: uniqueDimensionName,
          value: 1 / numberOfDimensions,
        });
        itemLinks.push({
          source: uniqueDimensionName,
          target: uniqueQuestionnaireName,
          value: 1 / numberOfDimensions,
        });
      });
    });
  });

  /*
  Object.entries(data).forEach(([domain, dimensionsByQuestionnaire]) => {
    // use unique names, i.e. the sets of domain names, questionnaire names and dimension names are pairwise dijoint
    const uniqueDomainName = makeUniqueName(domain, "dom");;
    if (!itemNames.includes(uniqueDomainName)) {
      itemNames.push(uniqueDomainName);
    }
    Object.keys(dimensionsByQuestionnaire).forEach((questionnaire) => {
      const uniqueQuestionnaireName = makeUniqueName(questionnaire, "qst");
      if (!itemNames.includes(uniqueQuestionnaireName)) {
        itemNames.push(uniqueQuestionnaireName);
      }
      itemLinks.push({
        source: uniqueDomainName,
        target: uniqueQuestionnaireName,
        value: 1 / numberOfDomains,
      });
    });
    Object.entries(dimensionsByQuestionnaire).forEach(([questionnaire, dimensions]) => {
      // const numberOfDimensions = dimensions.length;
      const uniqueQuestionnaireName = makeUniqueName(questionnaire, "qst");
      dimensions.forEach((dim) => {
        const uniqueDimensionName = makeUniqueName(dim, "dim");
        if (!itemNames.includes(uniqueDimensionName)) {
          itemNames.push(uniqueDimensionName);
        }
        itemLinks.push({
          source: uniqueQuestionnaireName,
          target: uniqueDimensionName,
          value: 1 / numberOfDimensions,
        });
      });
    }); 
  });
  */

  // colors: one per domain (left flow) and one per questionnaire (right flow)

  const options: Charts.EChartsOption = {
    series: [
      {
        type: 'sankey',
        data: itemNames.map((name) => ({
          name: name,
          itemStyle: {
            // color: '#f18bbf',
            // borderColor: '#f18bbf'
          }
        })),
        links: itemLinks.map((link) => ({
          source: link.source,
          target: link.target,
          value: link.value
        })),
        lineStyle: {
          color: 'source',
          curveness: 0.5
        },
        itemStyle: {
          // color: '#1f77b4',
          // borderColor: '#1f77b4'
        },
        label: {
          formatter: (params: any) => {
            const name = params.name;
            return name.slice(0,-4); // remove the unique suffix (e.g., " dom", " qst", " dim")
          }
          // color: 'rgba(0,0,0,0.7)',
        }
      }
    ],
    tooltip: {
      show: false,
      trigger: 'item'
    },
  };
   
  return (
    <>
      <ReactEChartsWrapper option={options} chartHeight={500}/>
    </>
  );
}

export default SankeyChart;