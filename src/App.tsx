import "@styles/style.css";
import React, { useState, useEffect } from "react";
import LineChart from "@components/LineChart";
import RadarChart from "@components/RadarChart";
import _ from "lodash";

// import Header from "src/layouts/Header";
// import Footer from "src/layouts/Footer";
// import { BarChart } from "@components/BarChart";
//
import Matrix from "@components/Matrix";
import Table from "@components/Table";

import Collapse from "@components/Collapse";
import ErrorModal from "@components/ErrorModal";
import { createChartData, createRadarData } from "@utils/dataTransformation";

import type { Visualization } from "@customTypes/visualization";
import { ITEM_TYPES, unspecifiedDimension } from "@data/mapping";
import type { PromData } from "@data/mapping";

import {
  // getUniqueQuestionnaires,
  calculatePeriodOfObservations,
  sortDimensions,
  createDateQuestionnairesRecord,
  createQuestionnaireChartDataRecord,
  createDimensionChartDataRecord,
} from "@utils/helpers";

import {
  loadFhirQuestionnaires,
  loadFhirQuestionnaireResponses,
  loadFhirBundles,
  loadFhirObservationDefinitions,
  loadFhirObservations,
} from "@services/loadFhirData";

import { loadConfig } from "@services/loadConfig";

import {
  normalizeQuestionnaireResponse,
  normalizeQuestionnaire,
  normalizeObservation,
  normalizeObservationDefinition,
  // normalizeBundle,
} from "@data/fhir";
import type { NormalizedFHIR } from "@data/fhir";
import {
  mapNormalizedObservationToPromDataObservation,
  mapNormalizedQuestionnaireResponseToPromDataQuestionnaireResponse,
  mapNormalizedQuestionnaireToPromDataQuestionnaire,
  mapNormalizedObservationDefinitionToPromDataObservationDefinition,
} from "@data/mapping";
import type { Mapping } from "@data/globalTypes";
import {
  addConfigurationsToQuestionnaire,
  addConfigurationsToQuestionnaireResponse,
  extractQuestionnairesFromConfig,
  extractGlobalHealthDimensionsFromConfig,
} from "@data/config";

function App() {
  const [fhirQuestionnaires, setFhirQuestionnaires] = useState<any[]>([]);
  const [fhirQuestionnaireResponses, setFhirQuestionnaireResponses] = useState<
    any[]
  >([]);
  const [fhirObservationDefinitions, setFhirObservationDefinitions] = useState<
    any[]
  >([]);
  const [fhirObservations, setFhirObservations] = useState<any[]>([]);
  // const [fhirBundles, setFhirBundles] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataIssues, setDataIssues] = useState<Mapping.DataIssue[]>([]);
  const [questionnaires, setQuestionnaires] = useState<
    PromData.Questionnaire[]
  >([]);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<
    Record<string, PromData.QuestionnaireResponse>
  >({});
  const [globalHealthDimensions, setGlobalHealthDimensions] = useState<
    string[]
  >([]);
  const [dataLoaded, setDataLoaded] = useState({
    config: false,
    fhirData: false,
  });
  const [fhirError, setFhirError] = useState<string | null>(null);

  const [config, setConfig] = useState<any>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const [questionnairesByDate, setQuestionnairesByDate] = useState<
    Record<string, string[]>
  >({});
  const [periodOfObservations, setPeriodOfObservations] = useState<string[]>(
    [],
  );
  // const [questionnaireResponsesForChart, setQuestionnaireResponsesForChart] =
  //   useState<Record<string, PromData.QuestionnaireResponse>>({});
  const [questionnairesForChart, setQuestionnairesForChart] = useState<
    PromData.Questionnaire[]
  >([]);
  const [scoreChartSubTitle, setScoreChartSubTitle] = useState<string[]>([]);
  const [radarChartData, setRadarChartData] =
    useState<Visualization.ChartData>();
  const [globalScoreChartData, setGlobalScoreChartData] = useState<
    Visualization.DataSeries[] | undefined
  >();
  const [chartDataByQuestionnaire, setChartDataByQuestionnaire] = useState<
    Record<string, Visualization.ChartData>
  >({});
  const [chartDataByDimension, setChartDataByDimension] = useState<
    Record<string, Visualization.ChartData>
  >({});
  const [chartData, setChartData] = useState<Visualization.ChartData>();
  const [dimensions, setDimensions] = useState<string[]>([]);
  const [idsOfResourcesWithIssues, setIdsOfResourcesWithIssues] = useState<
    string[]
  >([]);

  const [questionnairesReady, setQuestionnairesReady] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // useEffect(() => {

  useEffect(() => {
    // if (hasMounted.current) return;
    // hasMounted.current = true;

    const fetchConfig = async () => {
      try {
        const result = await loadConfig();
        // console.log("RAW RESULT:", result, typeof result); // ok
        setConfig(result);
        setDataLoaded((prev) => ({ ...prev, config: true }));
      } catch (error) {
        console.error("Error fetching config file:", error);
        setConfigError("Error fetching config file: " + error);
      }
    };

    const loadFhirData = async () => {
      // Fetch FHIR data
      try {
        const questionnaires = await loadFhirQuestionnaires();
        const responses = await loadFhirQuestionnaireResponses();
        const bundles = await loadFhirBundles();
        const observationDefinitions = await loadFhirObservationDefinitions();
        const observations = await loadFhirObservations();

        // alle ok
        // console.log("Fetched FHIR Questionnaires: ", questionnaires);
        // console.log("Fetched FHIR Questionnaire Responses: ", responses);
        // console.log("Fetched FHIR Bundles: ", bundles);
        // console.log(
        //   "Fetched FHIR Observation Definitions: ",
        //   observationDefinitions,
        // );

        // extract bundles and add to questionnaires and responses
        let bundleQuestionnaires: any[] = [];
        let bundleResponses: any[] = [];
        let bundleObservations: any[] = [];
        bundles.forEach((bundle) => {
          const questionnaireEntries = bundle.entry.filter(
            (entry: any) => entry.resource.resourceType === "Questionnaire",
          );
          const responseEntries = bundle.entry.filter(
            (entry: any) =>
              entry.resource.resourceType === "QuestionnaireResponse",
          );
          const observationEntries = bundle.entry.filter(
            (entry: any) => entry.resource.resourceType === "Observation",
          );
          // console.log("Extracted Questionnaires from Bundle: ", questionnaireEntries.map((entry: any) => entry.resource));
          // console.log("Extracted Questionnaire Responses from Bundle: ", responseEntries.map((entry: any) => entry.resource));
          bundleQuestionnaires.push(
            ...questionnaireEntries.map((entry: any) => entry.resource),
          );
          bundleResponses.push(
            ...responseEntries.map((entry: any) => entry.resource),
          );
          bundleObservations.push(
            ...observationEntries.map((entry: any) => entry.resource),
          );
        });

        setFhirQuestionnaires([...questionnaires, ...bundleQuestionnaires]);
        setFhirQuestionnaireResponses([...responses, ...bundleResponses]);
        setFhirObservations([...observations, ...bundleObservations]);
        setFhirObservationDefinitions([...observationDefinitions]);
        // setFhirBundles([...bundles]);
        setDataLoaded((prev) => ({ ...prev, fhirData: true }));
      } catch (error) {
        console.error("Error loading FHIR data: ", error);
        setFhirError("Error loading FHIR data: " + error);
      }
    };

    fetchConfig();
    loadFhirData();
  }, []);

  // useEffect(() => {
  //   console.log("STATE CONFIG:", config);
  // }, [config]);

  // useEffect(() => {
  //   console.log("MOUNT");
  //   return () => console.log("UNMOUNT");
  // }, []);

  useEffect(() => {
    console.log("FHIR Questionnaires in state: ", fhirQuestionnaires);
    console.log(
      "FHIR Questionnaire Responses in state: ",
      fhirQuestionnaireResponses,
    );
  }, [fhirQuestionnaires, fhirQuestionnaireResponses]);

  // Alles in useEffect
  // outside only final questionnaires and questionnaireResponses needed
  useEffect(() => {
    // Don't process until all data is loaded
    if (!dataLoaded.config || !dataLoaded.fhirData) {
      return;
    }

    const questionnaireErrors: Mapping.DataIssue[] = [];
    const responseErrors: Mapping.DataIssue[] = [];
    const observationErrors: Mapping.DataIssue[] = [];
    const observationDefinitionErrors: Mapping.DataIssue[] = [];
    // const bundleErrors: Mapping.DataIssue[] = [];

    // nur questionnaires und responses, die in config definiert sind (sonst alle)
    const configQuestionnaires = extractQuestionnairesFromConfig(config);
    // console.log("Questionnaires defined in config file: ", configQuestionnaires); // ok

    // Behandlung, wenn leere Arrays von FHIR Daten -> Fehlermeldung, dass keine Daten

    // if (hasMounted.current) return;
    // hasMounted.current = true;
    //if (hasMounted.current) {
    /* ----------------------- Normalize FHIR data ------------------------*/
    /* Questionnaires */
    const normalizedFhirQuestionnairesWithErrorMessages = fhirQuestionnaires
      .map((questionnaire) => normalizeQuestionnaire(questionnaire))
      .filter((result) => configQuestionnaires.includes(result.data.url));

    const normalizedFhirQuestionnaires =
      normalizedFhirQuestionnairesWithErrorMessages.map(
        (questionnaire) => questionnaire.data,
      );
    const normalizedFhirQuestionnaireErrors =
      normalizedFhirQuestionnairesWithErrorMessages.flatMap(
        (questionnaire) => questionnaire.issues,
      );
    questionnaireErrors.push(...normalizedFhirQuestionnaireErrors);
    console.log(
      "Normalized FHIR Questionnaires: ",
      normalizedFhirQuestionnaires,
    );
    /* Questionnaire Responses */
    const normalizedFhirQuestionnaireResponsesWithErrorMessages =
      fhirQuestionnaireResponses
        .map((response) =>
          normalizeQuestionnaireResponse(
            response,
            normalizedFhirQuestionnaires,
          ),
        )
        .filter(
          (result) =>
            result.data.questionnaire !== undefined &&
            configQuestionnaires.includes(result.data.questionnaire),
        );

    const normalizedFhirQuestionnaireResponses =
      normalizedFhirQuestionnaireResponsesWithErrorMessages.map(
        (response) => response.data,
      );
    const normalizedFhirQuestionnaireResponseErrors =
      normalizedFhirQuestionnaireResponsesWithErrorMessages.flatMap(
        (response) => response.issues,
      );
    responseErrors.push(...normalizedFhirQuestionnaireResponseErrors);
    console.log(
      "Normalized FHIR Questionnaire Responses: ",
      normalizedFhirQuestionnaireResponses,
    );
    /* Bundles */
    // const normalizedFhirBundlesWithErrorMessages = fhirBundles.map((bundle) =>
    //   normalizeBundle(bundle),
    // );
    // const normalizedFhirBundles = normalizedFhirBundlesWithErrorMessages.map(
    //   (bundle) => bundle.data,
    // );
    // const normalizedFhirBundleErrors =
    //   normalizedFhirBundlesWithErrorMessages.flatMap((bundle) => bundle.issues);
    // bundleErrors.push(...normalizedFhirBundleErrors);
    // console.log("Normalized FHIR Bundles: ", normalizedFhirBundles);

    // const bundleQuestionnaires = normalizedFhirBundles
    //   .map((bundle) => bundle.questionnaire)
    //   .filter((questionnaire) => questionnaire !== undefined);
    // const bundleResponses = normalizedFhirBundles
    //   .map((bundle) => bundle.questionnaireResponse)
    //   .filter((response) => response !== undefined);
    // const bundleObservations = normalizedFhirBundles
    //   .map((bundle) => bundle.observations)
    //   .filter((observations) => observations !== undefined);

    /* Observations und Observation Definitions */
    const normalizedFhirObservationsWithErrorMessages = fhirObservations.map(
      (observation) => normalizeObservation(observation),
    );
    const normalizedFhirObservations =
      normalizedFhirObservationsWithErrorMessages.map(
        (observation) => observation.data,
      );
    const normalizedFhirObservationErrors =
      normalizedFhirObservationsWithErrorMessages.flatMap(
        (observation) => observation.issues,
      );
    observationErrors.push(...normalizedFhirObservationErrors);
    console.log("Normalized FHIR Observations: ", normalizedFhirObservations);

    const normalizedFhirObservationDefinitionsWithErrorMessages =
      fhirObservationDefinitions.map((observationDefinition) =>
        normalizeObservationDefinition(observationDefinition),
      );
    const normalizedFhirObservationDefinitions =
      normalizedFhirObservationDefinitionsWithErrorMessages.map(
        (observationDefinition) => observationDefinition.data,
      );
    const normalizedFhirObservationDefinitionErrors =
      normalizedFhirObservationDefinitionsWithErrorMessages.flatMap(
        (observationDefinition) => observationDefinition.issues,
      );
    observationDefinitionErrors.push(
      ...normalizedFhirObservationDefinitionErrors,
    );
    console.log(
      "Normalized FHIR Observation Definitions: ",
      normalizedFhirObservationDefinitions,
    );

    /* ----------------------- Mapping ------------------------ */

    // keep bundles separately
    // const allNormalizedFhirQuestionnaires = [
    //   ...normalizedFhirQuestionnaires,
    //   ...bundleQuestionnaires,
    // ];
    // const allNormalizedFhirQuestionnaireResponses = [
    //   ...normalizedFhirQuestionnaireResponses,
    //   ...bundleResponses,
    // ];
    // const allNormalizedFhirObservations = [...normalizedFhirObservations];
    // console.log("All Questionnaires: ", allNormalizedFhirQuestionnaires);
    // console.log(
    //   "All Questionnaire Responses: ",
    //   allNormalizedFhirQuestionnaireResponses,
    // );

    // PromData Questionnaires
    const promDataQuestionnairesWithErrorMessages =
      normalizedFhirQuestionnaires.map((questionnaire) =>
        mapNormalizedQuestionnaireToPromDataQuestionnaire(questionnaire),
      );
    const promDataQuestionnaires = promDataQuestionnairesWithErrorMessages.map(
      (questionnaire) => questionnaire.data,
    );
    const promDataQuestionnaireErrors =
      promDataQuestionnairesWithErrorMessages.flatMap(
        (questionnaire) => questionnaire.issues,
      );
    questionnaireErrors.push(...promDataQuestionnaireErrors);
    console.log("PromData Questionnaires: ", promDataQuestionnaires); // ok
    // QuestionnaireResponses
    const questionnaireResponsesWithErrorMessages =
      normalizedFhirQuestionnaireResponses.map((response) =>
        mapNormalizedQuestionnaireResponseToPromDataQuestionnaireResponse(
          response,
          promDataQuestionnaires,
        ),
      );
    const promDataQuestionnaireResponses =
      questionnaireResponsesWithErrorMessages.map(
        (questionnaireResponse) => questionnaireResponse.data,
      );
    console.log(
      "PromData Questionnaire Responses: ",
      promDataQuestionnaireResponses,
    );
    const promDataQuestionnaireResponseErrors =
      questionnaireResponsesWithErrorMessages.flatMap(
        (questionnaireResponse) => questionnaireResponse.issues,
      );
    responseErrors.push(...promDataQuestionnaireResponseErrors);

    // Observations
    const promDataObservationsWithErrorMessages =
      normalizedFhirObservations.map((observation) =>
        mapNormalizedObservationToPromDataObservation(observation),
      );
    const promDataObservations = promDataObservationsWithErrorMessages.map(
      (observation) => observation.data,
    );
    const promDataObservationErrors =
      promDataObservationsWithErrorMessages.flatMap(
        (observation) => observation.issues,
      );
    observationErrors.push(...promDataObservationErrors);
    console.log("PromData Observations: ", promDataObservations); // ok

    // ObservationDefinitions
    const promDataObservationDefinitionsWithErrorMessages =
      normalizedFhirObservationDefinitions.map((observationDefinition) =>
        mapNormalizedObservationDefinitionToPromDataObservationDefinition(
          observationDefinition,
        ),
      );
    const promDataObservationDefinitions =
      promDataObservationDefinitionsWithErrorMessages.map(
        (observationDefinition) => observationDefinition.data,
      );
    const promDataObservationDefinitionErrors =
      promDataObservationDefinitionsWithErrorMessages.flatMap(
        (observationDefinition) => observationDefinition.issues,
      );
    observationDefinitionErrors.push(...promDataObservationDefinitionErrors);
    console.log(
      "PromData Observation Definitions: ",
      promDataObservationDefinitions,
    );

    /* ----------------------- Add config data ------------------------ */

    // Add config file configuration to questionnaires
    const promDataQuestionnairesWithConfigurationsAndErrorMessages =
      promDataQuestionnaires.map((questionnaire) => {
        return addConfigurationsToQuestionnaire(
          questionnaire,
          promDataObservationDefinitions,
          config,
        );
      });
    const promDataQuestionnairesWithConfigurations =
      promDataQuestionnairesWithConfigurationsAndErrorMessages.map(
        (questionnaire) => questionnaire.data,
      );
    const promDataQuestionnaireConfigurationErrors =
      promDataQuestionnairesWithConfigurationsAndErrorMessages.flatMap(
        (questionnaire) => questionnaire.issues,
      );
    observationDefinitionErrors.push(
      ...promDataQuestionnaireConfigurationErrors,
    );
    console.log(
      "PromData Questionnaires with Configurations: ",
      promDataQuestionnairesWithConfigurations,
    );

    const promDataQuestionnaireResponsesWithConfigurations =
      promDataQuestionnaireResponses.map((questionnaireResponse) =>
        addConfigurationsToQuestionnaireResponse(
          questionnaireResponse,
          promDataObservations,
          config,
        ),
      );

    console.log(
      "PromData Questionnaire Responses with Configurations: ",
      promDataQuestionnaireResponsesWithConfigurations,
    );

    // global Dimension
    const globalHealthDimensionsFromConfig =
      extractGlobalHealthDimensionsFromConfig(config);

    /* ----------------------- Clean data ------------------------ */
    // Fehlermeldungen in Modal anzeigen und fehlerhafte Daten löschen
    // Clean responses
    // filter
    // const filteredPromDataQuestionnaireResponses =
    //   promDataQuestionnaireResponses.filter(
    //     (questionnaireResponse) =>
    //       // questionnaireResponse.questionnaire !== undefined &&
    //       questionnaireResponse.items !== undefined &&
    //       Object.keys(questionnaireResponse.items).length > 0, // &&
    //     // configQuestionnaires.includes(questionnaireResponse.questionnaire.url),
    //   );

    // // for (let response of _.difference(
    // //   promDataQuestionnaireResponses,
    // //   filteredPromDataQuestionnaireResponses,
    // // )) {
    // //   questionnaireResponseErrors.push({
    // //     id: `${response.id}-ReferenceError-${Math.random().toString(36).substring(2, 9)}`,
    // //     level: "error",
    // //     message: `QuestionnaireResponse with id ${response.id} has no items and is therefore omitted.`,
    // //   });
    // // }
    // console.log("Filtered Responses: ", filteredPromDataQuestionnaireResponses);

    // // Clean questionnaires
    // // Delete items which do not have any answerOptions, range and scoreHealthCorrelation
    // // Delete items which do not have a dimension assigned (after adding dimensions from config)
    // promDataQuestionnaires.forEach((questionnaire) => {
    //   const items = questionnaire.items;
    //   Object.entries(items).forEach(([linkId, item]) => {
    //     const scoreItem = item as PromData.QuestionnaireScoreItem;
    //     const isScoreItem =
    //       Object.hasOwn(item, "range") &&
    //       Object.hasOwn(item, "scoreHealthCorrelation") &&
    //       scoreItem.range !== undefined &&
    //       scoreItem.scoreHealthCorrelation !== undefined;
    //     const questionItem = item as PromData.QuestionnaireItem;
    //     const isQuestionItem = questionItem.answerOptions.length > 0;
    //     if ((!isScoreItem && !isQuestionItem) || item.dimension === "") {
    //       delete items[linkId];
    //       // Add error message
    //       questionnaireErrors.push({
    //         id: `${questionnaire.id}-ItemError-${Math.random().toString(36).substring(2, 9)}`,
    //         level: "warning",
    //         message: `Questionnaire with id ${questionnaire.id} contains item with linkId ${linkId} which does not have answer options, a range or a score-health correlation and/or does not have a dimension assigned and is therefore omitted.`,
    //       });
    //     }
    //   });
    // });

    // // LinkId in response item verweist nicht auf LinkId in Questionnaire -> delete item from response
    // const filteredPromDataQuestionnaireResponsesWithValidLinkIds =
    //   filteredPromDataQuestionnaireResponses.map((response) => {
    //     const questionnaire = response.questionnaire;
    //     const questionnaireLinkIds = Object.keys(questionnaire.items);
    //     const responseLinkIds = Object.keys(response.items);
    //     const validLinkIds = responseLinkIds.filter((linkId) =>
    //       questionnaireLinkIds.includes(linkId),
    //     );
    //     const filteredItems: Record<string, PromData.ResponseItem> = {};
    //     validLinkIds.forEach((linkId) => {
    //       filteredItems[linkId] = response.items[linkId];
    //     });
    //     // Add errors for invalid linkIds
    //     const invalidLinkIds = _.difference(responseLinkIds, validLinkIds);
    //     invalidLinkIds.forEach((linkId) => {
    //       responseErrors.push({
    //         id: `${response.id}-LinkIdError-${Math.random().toString(36).substring(2, 9)}`,
    //         level: "error",
    //         message: `QuestionnaireResponse with id ${response.id} contains item with linkId ${linkId} which does not exist in the corresponding questionnaire and is therefore omitted.`,
    //       });
    //     });
    //     return {
    //       ...response,
    //       items: filteredItems,
    //     };
    //   });

    // responses in Record umwandeln
    const questionnaireResponsesRecord: Record<
      string,
      PromData.QuestionnaireResponse
    > = {};
    promDataQuestionnaireResponsesWithConfigurations.forEach(
      // TO DO: change to filtered data
      (questionnaireResponse) => {
        questionnaireResponsesRecord[questionnaireResponse.id] =
          questionnaireResponse;
      },
    );
    console.log(
      "Questionnaire Responses in Record: ",
      questionnaireResponsesRecord,
    );

    // set variables
    setQuestionnaires(promDataQuestionnairesWithConfigurations);
    setQuestionnaireResponses(questionnaireResponsesRecord);
    setDataIssues([
      ...questionnaireErrors,
      ...responseErrors,
      ...observationDefinitionErrors,
      ...observationErrors,
      // ...bundleErrors,
    ]);
    setGlobalHealthDimensions(globalHealthDimensionsFromConfig);
    setQuestionnairesReady(true);
    //  } else {
    //    hasMounted.current = true;
    //  }
  }, [
    fhirQuestionnaires,
    fhirQuestionnaireResponses,
    fhirObservationDefinitions,
    fhirObservations,
    // fhirBundles,
    dataLoaded,
  ]);

  // useEffect(() => {
  //   if (dataIssues.length > 0) {
  //     setIsModalOpen(true);
  //   }
  // }, [dataIssues]);

  console.log("Data issues: ", dataIssues);

  const handleContinue = () => {
    setIsModalOpen(false);
  };

  const toggleErrorDetails = () => {
    setShowErrors((prev) => !prev);
    console.log("Toggled showErrors: ", showErrors);
  };

  /**--------------------------------------------- */
  // const patientData = useMemo(() => {
  //   return mockPatient;
  // }, [mockPatient]);

  useEffect(() => {
    if (!questionnairesReady) {
      return;
    }
    if (dataIssues.length > 0) {
      setIsModalOpen(true);
    }
    console.log("Questionnaires ready for chart: ", questionnaires); // ok
    console.log(
      "Questionnaire Responses ready for chart: ",
      questionnaireResponses,
    );
    // Create chart data
    const questionnaireResponsesForChart = questionnaireResponses; // questionnaireResponses; // patientData.proms
    console.log(
      "Questionnaire Responses for chart: ",
      questionnaireResponsesForChart,
    );
    // only questionnaires referenced by responses
    const questionnairesForChart = [...new Set(questionnaires)];
    // getUniqueQuestionnaires(questionnaireResponsesForChart);
    console.log("Unique Questionnaires: ", questionnairesForChart);

    const questionnairesByDate = createDateQuestionnairesRecord(
      questionnaireResponsesForChart,
    );

    const chartData = createChartData(questionnaireResponsesForChart);
    setChartData(chartData);
    console.log("Chart Data: ", chartData);

    console.log(
      "Global Health Dimensions from config: ",
      globalHealthDimensions,
    );

    const chartGlobalScoreData =
      globalHealthDimensions.length > 0
        ? chartData.yData.filter(
            (dataseries) =>
              dataseries.seriesType === ITEM_TYPES.score &&
              globalHealthDimensions.includes(dataseries.dimension),
          )
        : undefined;
    const chartDimensionScoreData = chartData.yData.filter(
      (dataseries) =>
        dataseries.seriesType === ITEM_TYPES.score &&
        (globalHealthDimensions.length === 0 ||
          !globalHealthDimensions.includes(dataseries.dimension)),
    );
    console.log("Scores: ", chartGlobalScoreData);
    console.log("Dimension Scores: ", chartDimensionScoreData);

    const itemDataSeries = chartData.yData.filter(
      (dataseries) => dataseries.seriesType === ITEM_TYPES.item,
    );
    console.log("Items: ", itemDataSeries);

    const scoreDataSeries =
      chartGlobalScoreData !== undefined
        ? [...chartGlobalScoreData, ...chartDimensionScoreData]
        : chartDimensionScoreData;
    console.log("All Scores: ", scoreDataSeries);

    const chartDimensions = [
      ...new Set([
        ...itemDataSeries.map((item) => item.dimension),
        ...scoreDataSeries.map((score) => score.dimension),
      ]),
    ];

    const dimensions = sortDimensions(chartDimensions, globalHealthDimensions);
    console.log("Sorted Dimensions: ", dimensions);

    // const unusedDimensions = _.difference(DIMENSIONS, chartDimensions);

    // group chartData by dimension for Matrix
    // TO add: sort scores and items within each dimension by their values (e.g. mean or min)
    // and do not show items which are part of score calculation.
    // FILTER ITEMS
    const chartDataByDimension: Record<string, Visualization.ChartData> =
      createDimensionChartDataRecord(
        dimensions,
        questionnairesForChart,
        scoreDataSeries,
        itemDataSeries,
        chartData.xData,
      );
    console.log("Chart Data by Dimension: ", chartDataByDimension);

    //const matrixData = createMatrixData(questionnaireResponses, chartData);
    //console.log("Matrix Data: ", matrixData);

    // const matrixDimensions = createMatrixDimensionsData(
    //   questionnaireResponses,
    //   chartItemsData,
    //   chartScoreData,
    // );
    //console.log(matrixDimensions);

    // group chartData by questionnaireId for table
    const chartDataByQuestionnaire: Record<string, Visualization.ChartData> =
      createQuestionnaireChartDataRecord(questionnairesForChart, chartData);
    console.log("Chart Data by Questionnaire: ", chartDataByQuestionnaire);

    const radarChartData = createRadarData(chartData);
    console.log("Radar Chart Data: ", radarChartData);

    const periodOfObservations = calculatePeriodOfObservations(
      questionnaireResponsesForChart,
    );

    const scoreChartSubTitle = Array.from(
      new Set(
        Object.values(questionnaireResponsesForChart).map(
          (questionnaireResponse) => {
            return questionnaireResponse.questionnaire.name;
          },
        ),
      ),
    );

    const resourceIdsWithIssues = dataIssues
      .map((issue) => issue.resourceId)
      .filter((id) => id !== undefined);
    console.log("IDs of resources with issues: ", resourceIdsWithIssues);

    // set variables

    // setQuestionnaireResponsesForChart(questionnaireResponsesForChart);
    setQuestionnairesForChart(questionnairesForChart);
    setQuestionnairesByDate(questionnairesByDate);
    setGlobalScoreChartData(chartGlobalScoreData);
    setDimensions(dimensions);
    setChartDataByDimension(chartDataByDimension);
    setChartDataByQuestionnaire(chartDataByQuestionnaire);
    setRadarChartData(radarChartData);
    setPeriodOfObservations(periodOfObservations);
    setScoreChartSubTitle(scoreChartSubTitle);
    setIdsOfResourcesWithIssues(resourceIdsWithIssues);

    // if (chartGlobalScoreData == undefined) {
    //   setShowScoreChart(false);
    // }
  }, [
    questionnaires,
    questionnaireResponses,
    dataIssues,
    globalHealthDimensions,
    questionnairesReady,
  ]);

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

  if (configError) return (
    <React.Fragment>
      <div>
        Failed to load config
      </div>
      <div>
        {configError}
      </div>
    </React.Fragment>
  );
  if (fhirError) return (
    <React.Fragment>
      <div>
        Failed to load FHIR data
      </div>
      <div>
        {fhirError}
      </div>
    </React.Fragment>
  );
  if (!dataLoaded.config || !dataLoaded.fhirData) return <div>Loading...</div>;
  if (!questionnairesReady) return <div>Processing data...</div>;

  return (
    <div className="tw:@container">
      <div className="tw:min-h-screen">
        <div
          className={`${isModalOpen ? "pointer-events-none select-none" : ""}`}
        >
          {/* <Header /> */}
          <main className="tw:max-w-screen tw:xl:max-w-9/10 tw:mx-auto tw:h-full tw:justify-center tw:px-4">
            <div className="tw:flex tw:flex-col tw:md:flex-row tw:gap-8 tw:py-16 tw:justify-center tw:items-start">
              <div className="tw:card tw:lg:basis-1/3 tw:xl:basis-md tw:bg-base-100 tw:shadow-md">
                <div className="tw:card-body">
                  <h2 className="tw:card-title">PROM Info</h2>
                  {questionnairesForChart.map((questionnaire) => (
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
                  {/* <p>Total number of questionnaires: {Object.keys(questionnaireResponses).length}</p>
                <p>Number of different questionnaires: {questionnaires.length}</p>
                <p>Period of observations: {calculatePeriodOfObservations(questionnaireResponses)}</p> */}
                  <p>Date | Completed Questionnaires</p>
                  {Object.entries(questionnairesByDate).map(
                    ([date, questionnaires]) => (
                      <div key={date}>
                        {date}:
                      <ul className="tw:list-disc tw:pl-5">
                      {questionnaires.map((questionnaire) => (
                        <li key={questionnaire}>{questionnaire}</li>
                      ))}
                      </ul>
                      </div>
                    ),
                  )}
                  {/* <p>
                    A total of{" "}
                    {Object.keys(questionnaireResponsesForChart).length}{" "}
                    questionnaires were completed
                    {periodOfObservations.length > 1 &&
                      ` between ${periodOfObservations[0]} and ${periodOfObservations[1]}`}
                    {periodOfObservations.length === 1 &&
                      ` in ${periodOfObservations[0]}`}
                    .
                  </p> */}
                </div>
              </div>
              <div className="tw:card tw:lg:basis-1/3 tw:xl:basis-md tw:bg-base-100 tw:shadow-md tw:overflow-y-auto tw:max-h-[60vh]">
                {/* tw:col-span-3 tw:sm:col-span-3 tw:lg:col-span-1*/}
                <div className="tw:card-body">
                  <h2 className="tw:card-title">Error Info</h2>
                  <p>
                    For FHIR resources with follwing ids there have been errors
                    detected:
                  </p>
                  {idsOfResourcesWithIssues.length > 0 ? (
                    <ul className="tw:list-disc tw:pl-5">
                      {idsOfResourcesWithIssues.map((id) => (
                        <li key={id}>{id}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No errors detected</p>
                  )}
                  {dataIssues.length > 0 && (
                    <div>
                    <button
                      className="tw:btn tw:btn-outline tw:btn-primary tw:btn-sm tw:mt-2"
                      onClick={toggleErrorDetails}
                    >
                      {showErrors ? "Hide error details" : "Show error details"}
                    </button>
                    </div>
                  )}
                  {showErrors && dataIssues.length > 0 && (
                    <div className="tw:overflow-y-auto tw:flex-1">
                      {dataIssues.some((issue) => issue.level === "error") && (
                        <p className="tw:mb-2 tw:mt-2">
                          <span className="tw:font-semibold">Errors</span>
                        </p>
                      )}
                      <ul className="tw:list-disc tw:pl-5">
                      {dataIssues.map(
                        (issue) =>
                          issue.level === "error" && ( 
                              <li key={issue.id}>{issue.message}</li>
                          ),
                      )}
                       </ul>
                      {dataIssues.some((issue) => issue.level === "warning") && (
                        <p className="tw:mt-2 tw:mb-2">
                          <span className="tw:font-semibold">Warnings</span>
                        </p>
                      )}
                      <ul className="tw:list-disc tw:pl-5">
                      {dataIssues.map(
                        (issue) =>
                          issue.level === "warning" && (                            
                              <li key={issue.id}>{issue.message}</li>  
                          ),
                      )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* <div className="tw:divider" /> */}

            <div className="tw:grid tw:grid-cols-15 tw:item-center tw:py-4">
              <div className="tw:col-span-15 tw:lg:col-span-6 tw:2xl:col-span-5">
                <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
                  Health Indication
                </p>
                {radarChartData && (
                  <RadarChart
                    data={radarChartData}
                    dimensions={dimensions.filter((dimension) => dimension !== unspecifiedDimension && dimension !== "")}
                    //subtitle={"Health indication per dimension where points closer to edges indicate better health status"}
                  />
                )}
              </div>

              {/* </div>
          
          <div className="tw:flex-1 tw:item-center tw:py-4"> */}
              <div className="tw:col-span-15 tw:lg:col-span-9 tw:2xl:col-span-10">
                {globalScoreChartData && (
                  <>
                    <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
                      Global Health Scores (Normalized)
                    </p>
                    {chartData && (
                      <LineChart
                        subtitle={
                          "Questionnaires: " + scoreChartSubTitle.join(", ")
                        }
                        data={{
                          xData: chartData.xData,
                          yData: globalScoreChartData,
                        }}
                      />
                    )}
                  </>
                )}
                {!globalScoreChartData && (
                  <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
                    No global health scores available
                  </p>
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
              Selected PROs by Dimensions
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
              Complete PROs by PROM/Questionnaire
            </p>

            <div className="tw:flex-1 tw:py-8">
              <div
                className="tw:join tw:join-vertical tw:bg-base-100"
                style={{ display: "flex", alignItems: "center" }}
              >
                {questionnairesForChart.map((questionnaire) => (
                  <React.Fragment key={questionnaire.id}>
                    <Collapse
                      title={questionnaire.name}
                      children={
                        <Table
                          data={chartDataByQuestionnaire[questionnaire.id]}
                          dimensions={dimensions}
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
      {dataIssues.length > 0 && (
        <ErrorModal
          data={dataIssues}
          open={isModalOpen}
          onClose={handleContinue}
        />
      )}
    </div>
  );
}

export default App;
