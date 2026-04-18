import "@styles/style.css";
import React, { useState, useMemo, useEffect, useRef } from "react";
import LineChart from "@components/LineChart";
import RadarChart from "@components/RadarChart";
import _ from "lodash";

// import Header from "src/layouts/Header";
// import Footer from "src/layouts/Footer";
// import { BarChart } from "@components/BarChart";
//
import Matrix from "@components/Matrix";
import Table from "@components/Table";
// import { ExpandableMatrixDemo } from "@components/ExpandableMatrix";
// import CollapsibleMatrix from "@components/CollapsibleMatrix";
import Collapse from "@components/Collapse";
import { createChartData, createRadarData } from "@utils/dataTransformation";

import { mockPatient } from "./mock/mockPatient";
import type { Visualization } from "@customTypes/visualization";
import { globalDimension, ITEM_TYPES } from "@data/mapping/constants";
// import type { PromData } from "@customTypes/promData";

import {
  getUniqueQuestionnaires,
  calculatePeriodOfObservations,
  sortDimensions,
  createDateQuestionnairesRecord,
  createQuestionnaireChartDataRecord,
  createDimensionChartDataRecord,
} from "@utils/helpers";

import { loadFhirQuestionnaire, loadFhirQuestionnaireResponse, loadFhirBundle, loadFhirObservationDefinition } from "@services/loadFhirData";

import { normalizeQuestionnaireResponse, normalizeQuestionnaire, normalizeObservation, normalizeObservationDefinition } from '@data/fhir';
import type { NormalizedFHIR } from "@data/fhir";
import { mapObservationToQuestionnaireItem, mapObservationDefinitionToQuestionnaireItem } from "@data/mapping";

function App() {
  const [fhirQuestionnaires, setFhirQuestionnaires] = useState<any[]>([]);
  const [fhirQuestionnaireResponses, setFhirQuestionnaireResponses] = useState<any[]>([]);
  const [fhirObservationDefinitions, setFhirObservationDefinitions] = useState<any[]>([]);
  const [fhirObservations, setFhirObservations] = useState<any[]>([]);
  const [showScoreChart, setShowScoreChart] = useState(true);
  const loadedRef = useRef(false);

  const BUNDLE_NAMES: string[] = [
    "mii-exa-pro-eortc-qlq-c30-bundle",
    "mii-exa-pro-phq-9-bundle",
    // "mii-exa-pro-promis-29-bundle", // Questionnaire fehlt
  ];

  const QUESTIONNAIRE_NAMES: string[] = [
    "mii-qst-pro-euroqol-eq5d5l-collectable",
    "mii-qst-pro-promis-29",
  ];
  
  const RESPONSE_NAMES: string[] = [
    "mii-exa-pro-euroqol-eq5d5l-response",
    "mii-exa-pro-promis-29-response",
  ];

  const OBSERVATION_DEFINITION_NAMES: string[] = [
    "fsh-generated-resources-ObservationDefinition-mii-obsdef-pro-score-phq-9",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-ap",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-cf",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-co",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-di",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-dy",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-ef",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-fa",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-fi",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-nv",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-pa",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-pf",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-ql",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-rf",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-sf",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-sl",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-score-eq5d5l-index",
    "generated-resources-ObservationDefinition-mii-obsdef-pro-score-eq5d5l-vas",
    "ObservationDefinition-mii-obsdef-pro-promis-29-pain-interference-tscore",
    "ObservationDefinition-mii-obsdef-pro-promis-29-physical-function-tscore",
    "ObservationDefinition-mii-obsdef-pro-promis-29-sleep-disturbance-tscore",
    "ObservationDefinition-mii-obsdef-pro-promis-29-social-function-tscore",
    "resources-ObservationDefinition-mii-obsdef-pro-promis-29-anxiety-tscore",
    "resources-ObservationDefinition-mii-obsdef-pro-promis-29-depression-tscore",
    "resources-ObservationDefinition-mii-obsdef-pro-promis-29-fatigue-tscore",
    "resources-ObservationDefinition-mii-obsdef-pro-promis-29-pain-intensity",
    "resources-ObservationDefinition-mii-obsdef-pro-score-eq5d5l-profile",
];

// Load FHIR data on component mount

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadAll = async () => {
      // Fetch FHIR data
      const questionnairePromises: Promise<any>[] = [];
      const responsePromises: Promise<any>[] = [];
      const bundlePromises: Promise<any>[] = [];
      const observationDefinitionPromises: Promise<any>[] = [];

      QUESTIONNAIRE_NAMES.forEach((name) => {
        questionnairePromises.push(loadFhirQuestionnaire(name));
      });

      RESPONSE_NAMES.forEach((name) => {
        responsePromises.push(loadFhirQuestionnaireResponse(name));
      });
      
      BUNDLE_NAMES.forEach((name) => {
        bundlePromises.push(loadFhirBundle(name));
      });

      OBSERVATION_DEFINITION_NAMES.forEach((name) => {
        observationDefinitionPromises.push(loadFhirObservationDefinition(name));
      });

      try {
        const questionnaires = await Promise.all(questionnairePromises);
        const responses = await Promise.all(responsePromises);
        const bundles = await Promise.all(bundlePromises);
        const observationDefinitions = await Promise.all(observationDefinitionPromises);

        console.log("Fetched FHIR Bundles: ", bundles); // ok

        // extract bundles and add to questionnaires and responses
        let bundleQuestionnaires: any[] = [];
        let bundleResponses: any[] = [];
        let bundleObservations: any[] = [];
        bundles.forEach((bundle) => {
          const questionnaireEntries = bundle.entry.filter((entry: any) => entry.resource.resourceType === "Questionnaire");
          const responseEntries = bundle.entry.filter((entry: any) => entry.resource.resourceType === "QuestionnaireResponse");
          const observationEntries = bundle.entry.filter((entry: any) => entry.resource.resourceType === "Observation");
          // console.log("Extracted Questionnaires from Bundle: ", questionnaireEntries.map((entry: any) => entry.resource));
          // console.log("Extracted Questionnaire Responses from Bundle: ", responseEntries.map((entry: any) => entry.resource));
          bundleQuestionnaires.push(...questionnaireEntries.map((entry: any) => entry.resource));
          bundleResponses.push(...responseEntries.map((entry: any) => entry.resource));
          bundleObservations.push(...observationEntries.map((entry: any) => entry.resource));
        });

        console.log("Bundle Questionnaires: ", bundleQuestionnaires);
        console.log("Bundle Questionnaire Responses: ", bundleResponses);
        console.log("Bundle Observations: ", bundleObservations);

        setFhirQuestionnaires([...questionnaires,...bundleQuestionnaires]);
        setFhirQuestionnaireResponses([...responses, ...bundleResponses]);
        setFhirObservations([...fhirObservations, ...bundleObservations]);
        setFhirObservationDefinitions([...observationDefinitions]);

      } catch (error) {
        console.error("Error loading FHIR data: ", error);
      }
    };

    loadAll();
  }, [QUESTIONNAIRE_NAMES, RESPONSE_NAMES, BUNDLE_NAMES, OBSERVATION_DEFINITION_NAMES]);

  console.log("FHIR Questionnaires in state: ", fhirQuestionnaires);
  console.log("FHIR Questionnaire Responses in state: ", fhirQuestionnaireResponses);

  // Normalize FHIR data

  const normalizedFhirQuestionnaires = useMemo(() => {
    return fhirQuestionnaires.map((questionnaire) =>
      normalizeQuestionnaire(questionnaire),
    );
  }, [fhirQuestionnaires]);
  console.log("Normalized FHIR Questionnaires: ", normalizedFhirQuestionnaires);

  const normalizedFhirQuestionnaireResponses = useMemo(() => {
    return fhirQuestionnaireResponses.map((response) =>
      normalizeQuestionnaireResponse(response),
    );
  }, [fhirQuestionnaireResponses]);
  console.log("Normalized FHIR Questionnaire Responses: ", normalizedFhirQuestionnaireResponses);

  const normalizedFhirObservations = useMemo(() => {
    return fhirObservations.map((observation) =>
      normalizeObservation(observation),
    );
  }, [fhirObservations]);
  console.log("Normalized FHIR Observations: ", normalizedFhirObservations);

  const normalizedFhirObservationDefinitions = useMemo(() => {
    return fhirObservationDefinitions.map((observationDefinition) =>
      normalizeObservationDefinition(observationDefinition),
    );
  }, [fhirObservationDefinitions]);
  console.log("Normalized FHIR Observation Definitions: ", normalizedFhirObservationDefinitions);

  // Clean responses

  normalizedFhirQuestionnaires.forEach((questionnaire) => {
    const correspondingResponses = normalizedFhirQuestionnaireResponses.filter((response) => response.questionnaire === questionnaire.url);
    console.log("corresponding response: ", correspondingResponses)
    correspondingResponses.forEach((response) => {
      const responseLinkIds = Object.keys(response.items);
      const questionnaireLinkIds = Object.keys(questionnaire.items);
      responseLinkIds.forEach((linkId) => {
        if (!questionnaireLinkIds.includes(linkId)) {
          // delete response item
          delete response.items[linkId];
        }
      });
    });
  });

  // Add Observation data to Questionnaire items WARTEN AUF ANTWORT VON DOMINIK

  const enrichedQuestionnaires = useMemo(() => {
    return normalizedFhirQuestionnaires.map((questionnaire) => {
      const enrichedItems: Record<string, NormalizedFHIR.QuestionnaireItem> = {};
      Object.entries(questionnaire.items).forEach(([linkId, item]) => {
        const itemWithObservation = mapObservationToQuestionnaireItem(item, normalizedFhirObservations);
        const itemWithObservationDefinition = mapObservationDefinitionToQuestionnaireItem(itemWithObservation, normalizedFhirObservationDefinitions);
        enrichedItems[linkId] = itemWithObservationDefinition;
      });
      return {
        ...questionnaire,
        items: enrichedItems,
      };
    });
  }, [normalizedFhirQuestionnaires, normalizedFhirObservations, normalizedFhirObservationDefinitions]);
  console.log("Enriched Questionnaires with Observation Data: ", enrichedQuestionnaires);

  // Annehmen alles soweit ok

  // Annehmen Clean questionnaires erfolgt
  
  // Mapping zu PROMData-Format
  // Ergebnis: Array von Questionnaires und QuestionnaireResponses

  // responses in Record umwandeln

  /**--------------------------------------------- */
  const patientData = useMemo(() => {
    return mockPatient;
  }, [mockPatient]);

  // Methoden ändern
  // only questionnaires referenced by responses
  const questionnaires = getUniqueQuestionnaires(patientData.proms);

  const questionnairesByDate: Record<string, string[]> =
    createDateQuestionnairesRecord(patientData.proms);

  const chartData = createChartData(patientData.proms);
  console.log("Chart Data: ", chartData);

  const chartGlobalScoreData = chartData.yData.filter(
    (dataseries) =>
      dataseries.seriesType === ITEM_TYPES.score &&
      dataseries.dimension === globalDimension,
  );
  const chartDimensionScoreData = chartData.yData.filter(
    (dataseries) =>
      dataseries.seriesType === ITEM_TYPES.score &&
      dataseries.dimension !== globalDimension,
  );
  console.log("Scores: ", chartGlobalScoreData);
  console.log("Dimension Scores: ", chartDimensionScoreData);

  const itemDataSeries = chartData.yData.filter(
    (dataseries) => dataseries.seriesType === ITEM_TYPES.item,
  );
  console.log("Items: ", itemDataSeries);

  const scoreDataSeries = [...chartGlobalScoreData, ...chartDimensionScoreData];
  console.log("All Scores: ", scoreDataSeries);

  const chartDimensions = [
    ...new Set([
      ...itemDataSeries.map((item) => item.dimension),
      ...scoreDataSeries.map((score) => score.dimension),
    ]),
  ];

  const dimensions = sortDimensions(chartDimensions);
  console.log("Sorted Dimensions: ", dimensions);

  // const unusedDimensions = _.difference(DIMENSIONS, chartDimensions);

  // group chartData by dimension for Matrix
  // TO add: sort scores and items within each dimension by their values (e.g. mean or min)
  // and do not show items which are part of score calculation.
  // FILTER ITEMS
  const chartDataByDimension: Record<string, Visualization.ChartData> =
    createDimensionChartDataRecord(
      dimensions,
      questionnaires,
      scoreDataSeries,
      itemDataSeries,
      chartData.xData,
    );
  console.log("Chart Data by Dimension: ", chartDataByDimension);

  //const matrixData = createMatrixData(patientData.proms, chartData);
  //console.log("Matrix Data: ", matrixData);

  // const matrixDimensions = createMatrixDimensionsData(
  //   patientData.proms,
  //   chartItemsData,
  //   chartScoreData,
  // );
  //console.log(matrixDimensions);

  // group chartData by questionnaireId for table
  const chartDataByQuestionnaire: Record<string, Visualization.ChartData> =
    createQuestionnaireChartDataRecord(questionnaires, chartData);
  console.log("Chart Data by Questionnaire: ", chartDataByQuestionnaire);

  const radarChartData = createRadarData(chartData);
  console.log("Radar Chart Data: ", radarChartData);

  const periodOfObservations = calculatePeriodOfObservations(patientData.proms);

  const scoreChartSubTitle = Array.from(
    new Set(
      Object.values(patientData.proms).map((questionnaireResponse) => {
        return questionnaireResponse.questionnaire.name;
      }),
    ),
  );

  if (chartGlobalScoreData == undefined) {
    setShowScoreChart(false);
  }

  /** TESTING FHIR NORMALIZATION
   * 
   */

  //   console.log("Original EQ-5D-5L Questionnaire: ", eq5d5lQuestionnaire);
  //   console.log("Original PHQ-9 Questionnaire: ", phq9Questionnaire);
  //   console.log("Original QLQ-C30 Questionnaire: ", qlqC30Questionnaire);
  //   console.log("Original PROMIS Questionnaire: ", promisQuestionnaire);
  //   console.log("Original EQ-5D-5L Response: ", eq5d5lResponse);
  //   console.log("Original PHQ-9 Response: ", phq9Response);
  //   console.log("Original QLQ-C30 Response: ", qlqC30Response);
  //   console.log("Original PROMIS Response: ", promisResponse);

  //  const normalizedEq5d5lQuestionnaire = normalizeQuestionnaire(eq5d5lQuestionnaire);
  //  console.log("Normalized EQ-5D-5L Questionnaire: ", normalizedEq5d5lQuestionnaire);

  //  const normalizedEq5d5lCollectableQuestionnaire = normalizeQuestionnaire(eq5d5lQuestionnaireCollectable);
  //  console.log("Normalized EQ-5D-5L Collectable Questionnaire: ", normalizedEq5d5lCollectableQuestionnaire);

  //  const normalizedPhq9Questionnaire = normalizeQuestionnaire(phq9Questionnaire);
  //  console.log("Normalized PHQ-9 Questionnaire: ", normalizedPhq9Questionnaire);

  //   const normalizedQlqC30Questionnaire = normalizeQuestionnaire(qlqC30Questionnaire);
  //   console.log("Normalized QLQ-C30 Questionnaire: ", normalizedQlqC30Questionnaire);

  //   const normalizedPromisQuestionnaire = normalizeQuestionnaire(promisQuestionnaire);
  //   console.log("Normalized PROMIS Questionnaire: ", normalizedPromisQuestionnaire);

  //   const normalizedEq5d5lResponse = normalizeQuestionnaireResponse(eq5d5lResponse);
  //   console.log("Normalized EQ-5D-5L Response: ", normalizedEq5d5lResponse);

  //   const normalizedPhq9Response = normalizeQuestionnaireResponse(phq9Response);
  //   console.log("Normalized PHQ-9 Response: ", normalizedPhq9Response);

  //   const normalizedQlqC30Response = normalizeQuestionnaireResponse(qlqC30Response);
  //   console.log("Normalized QLQ-C30 Response: ", normalizedQlqC30Response);

  //   const normalizedPromisResponse = normalizeQuestionnaireResponse(promisResponse);
  //   console.log("Normalized PROMIS Response: ", normalizedPromisResponse);


  return (
    <div className="tw:@container">
      <div className="tw:min-h-screen">
        {/* <Header /> */}
        <main className="tw:max-w-screen tw:xl:max-w-9/10 tw:mx-auto tw:h-full tw:justify-center tw:px-4">
          <div className="tw:flex tw:flex-col tw:md:flex-row tw:gap-8 tw:py-16 tw:justify-center tw:items-start">
            <div className="tw:card tw:lg:basis-1/3 tw:xl:basis-md tw:bg-base-100 tw:shadow-md">
              {" "}
              {/* tw:col-span-3 tw:sm:col-span-3 tw:lg:col-span-1*/}
              <div className="tw:card-body">
                <h2 className="tw:card-title">Patient Info</h2>
                <p>
                  Name: <b>{mockPatient.name}</b>
                </p>
              </div>
            </div>
            <div className="tw:card tw:lg:basis-1/3 tw:xl:basis-md tw:bg-base-100 tw:shadow-md">
              <div className="tw:card-body">
                <h2 className="tw:card-title">PROM Info</h2>
                {questionnaires.map((questionnaire) => (
                  <p key={questionnaire.id}>
                    {questionnaire.name}:{" "}
                    {questionnaire.url ? (
                      <a
                        className="tw:link tw:link-hover"
                        target="_blank"
                        href={questionnaire.url}
                        rel="noopener noreferrer"
                      >
                        {questionnaire.url}
                      </a>
                    ) : (
                      "No URL available"
                    )}
                  </p>
                ))}
              </div>
            </div>
            <div className="tw:card tw:lg:basis-1/3 tw:xl:basis-md tw:bg-base-100 tw:shadow-md">
              <div className="tw:card-body">
                <h2 className="tw:card-title">Data Info</h2>
                {/* <p>Total number of questionnaires: {Object.keys(patientData.proms).length}</p>
                <p>Number of different questionnaires: {questionnaires.length}</p>
                <p>Period of observations: {calculatePeriodOfObservations(patientData.proms)}</p> */}
                <p>Date | Completed Questionnaires</p>
                {Object.entries(questionnairesByDate).map(
                  ([date, questionnaires]) => (
                    <p key={date}>
                      {date}: {questionnaires.join(", ")}
                    </p>
                  ),
                )}
                <p>
                  A total of {Object.keys(patientData.proms).length}{" "}
                  questionnaires were completed
                  {periodOfObservations.length > 1 &&
                    ` between ${periodOfObservations[0]} and ${periodOfObservations[1]}`}
                  {periodOfObservations.length === 1 &&
                    ` in ${periodOfObservations[0]}`}
                  .
                </p>
              </div>
            </div>
          </div>
          {/* <div className="tw:divider" /> */}

          <div className="tw:grid tw:grid-cols-15 tw:item-center tw:py-4">
            <div className="tw:col-span-15 tw:lg:col-span-6 tw:2xl:col-span-5">
              <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
                Health Indication
              </p>
              <RadarChart
                data={radarChartData}
                //subtitle={"Health indication per dimension where points closer to edges indicate better health status"}
              />
            </div>

            {/* </div>
          
          <div className="tw:flex-1 tw:item-center tw:py-4"> */}
            <div className="tw:col-span-15 tw:lg:col-span-9 tw:2xl:col-span-10">
              {showScoreChart && chartGlobalScoreData && (
                <>
                  <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
                    Global Health Scores (Normalized)
                  </p>
                  <LineChart
                    subtitle={
                      "Questionnaires: " + scoreChartSubTitle.join(", ")
                    }
                    data={{
                      xData: chartData.xData,
                      yData: chartGlobalScoreData,
                    }}
                  />
                </>
              )}
            </div>
          </div>
          {/* <div className="tw:divider" /> */}
          {/* <div className="tw:flex-1 tw:item-center tw:py-4">
            <BarChart timeXAxis={true} />
          </div>
          <div className="tw:flex-1 tw:item-center tw:py-4">
            <BarChart timeXAxis={false} />
          </div> */}
          {/* <div className="tw:divider"/> */}
          {/* <div className="tw:flex-1 tw:item-center tw:py-4">
            
            <button onClick={toggleItemsDetails} className="tw:btn">
              {showItemDetails ? "Show Dimensions Only" : "Show Item Details"}
            </button>
           
            <Matrix showItemDetails={showItemDetails} />
          </div> */}

          {/* <div className="tw:flex-1 tw:py-8">
            <div className="tw:join tw:join-vertical tw:bg-base-100" style={{display: "flex", alignItems: "center"}}>   
            <Matrix data={chartData} />
            
          </div>
          </div> */}
          <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
            Selected PROM-Data by Dimensions
          </p>

          <div className="tw:grid tw:grid-cols-6 tw:py-8">
            {/* <div className="tw:join tw:join-vertical tw:bg-base-100" style={{display: "flex", alignItems: "center"}}>    */}
            {dimensions.map((dimension) => (
              <div
                className="tw:col-span-6 tw:md:col-span-3 tw:lg:col-span-2"
                key={dimension}
              >
                <p className="tw:text-lg tw:font-bold tw:text-[#333]">
                  {dimension}
                </p>
                <Matrix data={chartDataByDimension[dimension]} />
              </div>
            ))}
            {/* {unusedDimensions.map((dimension) => (
                <React.Fragment key={dimension}>
                  <p className="tw:text-lg tw:font-bold tw:text-[#333]">{dimension}</p>
                  <Collapse title={dimension} children={"No data available"}/>
                </React.Fragment>
              ))
              } */}
            {/* </div> */}
          </div>

          <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
            Complete PROM-Data by Questionnaire
          </p>

          <div className="tw:flex-1 tw:py-8">
            <div
              className="tw:join tw:join-vertical tw:bg-base-100"
              style={{ display: "flex", alignItems: "center" }}
            >
              {questionnaires.map((questionnaire) => (
                <React.Fragment key={questionnaire.id}>
                  <Collapse
                    title={questionnaire.name}
                    children={
                      <Table
                        data={chartDataByQuestionnaire[questionnaire.id]}
                      />
                    }
                  />
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* <div className="tw:flex-1 tw:item-center tw:py-4"> */}
          {/* <button onClick={toggleExpandAll} className="tw:btn">
              {expandAll ? "Collapse All" : "Expand All"}
            </button> */}
          {/* <CollapsibleMatrix
              columns={chartXData}
              dimensions={matrixDimensions}
              allRowsExpanded={expandAll}
            />
          </div> */}
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  );
}

export default App;
