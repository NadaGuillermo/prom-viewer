// Styles
import "@styles/style.css";

// React packages
import React, { useState, useEffect } from "react";
import * as _ from "lodash-es";

// Components
import DateRangePicker from "@components/DateRangePicker";
import LineChart from "@components/LineChart";
import Heatmap from "@components/Heatmap";
import QuestionnaireCard from "@components/QuestionnaireCard";
import SimpleDataTable from "@components/SimpleDataTable";
import Collapse from "@components/Collapse";
import ErrorModal from "@components/ErrorModal";

// Types
import type { GlobalTypes } from "@customTypes/globalTypes";
import type { Visualization } from "@utils/visualization";
import { ITEM_TYPES, type Mapping } from "@utils/mapping";

// Services
import { loadConfig } from "@services/loadConfig";
import {
  loadFhirQuestionnaires,
  loadFhirQuestionnaireResponses,
  loadFhirBundles,
  loadFhirObservationDefinitions,
  loadFhirObservations,
} from "@services/loadFhirData";

// Helper functions

// FHIR
import {
  normalizeQuestionnaireResponse,
  normalizeQuestionnaire,
  normalizeObservation,
  normalizeObservationDefinition,
  // normalizeBundle,
} from "@utils/fhir";

// Mapping
import {
  mapNormalizedObservationToPromDataObservation,
  mapNormalizedQuestionnaireResponseToPromDataQuestionnaireResponse,
  mapNormalizedQuestionnaireToPromDataQuestionnaire,
  mapNormalizedObservationDefinitionToPromDataObservationDefinition,
} from "@utils/mapping";

// Visualization
import {
  createChartData,
  // calculatePeriodOfObservations,
  sortDomains,
  createDateQuestionnaireNamesRecord,
  createTableData,
  createHeatmapData,
  createQuestionnaireCardData,
} from "@utils/visualization";

// Config
import {
  addConfigurationsToQuestionnaire,
  addConfigurationsToQuestionnaireResponse,
  extractQuestionnairesFromConfig,
  extractGlobalHealthDimensionsFromConfig,
  extractDomainsFromConfig,
} from "@utils/config";

function App() {
  // React states
  // Data loading
  const [dataLoaded, setDataLoaded] = useState({
    config: false,
    fhirData: false,
  });
  const [fhirError, setFhirError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [questionnairesReady, setQuestionnairesReady] = useState(false);

  // Data pipeline
  const [fhirQuestionnaires, setFhirQuestionnaires] = useState<any[]>([]);
  const [fhirQuestionnaireResponses, setFhirQuestionnaireResponses] = useState<
    any[]
  >([]);
  const [fhirObservationDefinitions, setFhirObservationDefinitions] = useState<
    any[]
  >([]);
  const [fhirObservations, setFhirObservations] = useState<any[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Mapping.Questionnaire[]>(
    [],
  );
  const [questionnaireResponses, setQuestionnaireResponses] = useState<
    Record<string, Mapping.QuestionnaireResponse>
  >({}); 
  const [dataIssues, setDataIssues] = useState<GlobalTypes.DataIssue[]>([]);
  const [globalHealthDimensions, setGlobalHealthDimensions] = useState<
    string[]
  >([]);
  const [domains, setDomains] = useState<string[]>([]);
  
  // Data transformation
  const [questionnairesByDate, setQuestionnairesByDate] = useState<
    Record<string, string[]>
  >({});

  // const [periodOfObservations, setPeriodOfObservations] = useState<string[]>(
  //   [],
  // );
   
  // const [questionnaireResponsesForChart, setQuestionnaireResponsesForChart] =
  //   useState<Record<string, Mapping.QuestionnaireResponse>>({});
  // const [questionnairesForChart, setQuestionnairesForChart] = useState<
  //   Mapping.Questionnaire[]
  // >([]);
  const [scoreChartSubTitle, setScoreChartSubTitle] = useState<string[]>([]);
  // const [globalScoreChartData, setGlobalScoreChartData] = useState<
  //   Visualization.DataSeries[] | undefined
  // >();

  // Visualization
  const [tableDataByQuestionnaire, setTableDataByQuestionnaire] = useState<
    Record<string, Visualization.ChartData>
  >({});
  const [heatmapDataByDomain, setHeatmapDataByDomain] = useState<
    Record<string, Visualization.ChartData>
  >({});
  const [questionnaireCardData, setQuestionnaireCardData] = useState<
    Record<string, [string, string[]]>>({});
  const [lineChartData, setLineChartData] = useState<Visualization.ChartData>();
  const [lengthOfLongestQuestionnaireName, setLengthOfLongestQuestionnaireName] = useState<number>(0);
  const [itemWarningsByQuestionnaireId, setItemWarningsByQuestionnaireId] =
    useState<Record<string, GlobalTypes.DataIssue[]>>({});
  const [idsOfResourcesWithIssues, setIdsOfResourcesWithIssues] = useState<
    string[]
  >([]);
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<string[]>(
    [],
  );
  // const [displayedQuestionnaires, setDisplayedQuestionnaires] = useState<Mapping.Questionnaire[]>([]);
  // const [displayedQuestionnaireResponses, setDisplayedQuestionnaireResponses] = useState<Record<string, Mapping.QuestionnaireResponse>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Load data
  useEffect(() => {
    // Config
    const fetchConfig = async () => {
      try {
        const result = await loadConfig();
        setConfig(result);
        setDataLoaded((prev) => ({ ...prev, config: true }));
      } catch (error) {
        console.error("Error fetching config file:", error);
        setConfigError("Error fetching config file: " + error);
      }
    };

    // FHIR Data
    const loadFhirData = async () => {
      try {
        const questionnaires = await loadFhirQuestionnaires();
        const responses = await loadFhirQuestionnaireResponses();
        const bundles = await loadFhirBundles();
        const observationDefinitions = await loadFhirObservationDefinitions();
        const observations = await loadFhirObservations();

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

        // set variables
        setFhirQuestionnaires([...questionnaires, ...bundleQuestionnaires]);
        setFhirQuestionnaireResponses([...responses, ...bundleResponses]);
        setFhirObservations([...observations, ...bundleObservations]);
        setFhirObservationDefinitions([...observationDefinitions]);
        setDataLoaded((prev) => ({ ...prev, fhirData: true }));
      } catch (error) {
        console.error("Error loading FHIR data: ", error);
        setFhirError("Error loading FHIR data: " + error);
      }
    };

    fetchConfig();
    loadFhirData();
  }, []);

  // Process data through pipeline
  useEffect(() => {
    // Don't process until all data is loaded
    if (!dataLoaded.config || !dataLoaded.fhirData) {
      return;
    }
    const errors: GlobalTypes.DataIssue[] = [];
    
    // only questionnaires and responses that are defined in config file
    const questionnairesInConfig = extractQuestionnairesFromConfig(config);
    
    /* ----------------------- Normalize FHIR data ------------------------*/
    /* Questionnaires */
    const normalizedFhirQuestionnairesWithErrorMessages = fhirQuestionnaires
      .map((questionnaire) => normalizeQuestionnaire(questionnaire))
      .filter((result) => questionnairesInConfig.includes(result.data.url));
    const normalizedFhirQuestionnaires =
      normalizedFhirQuestionnairesWithErrorMessages.map(
        (questionnaire) => questionnaire.data,
      );
    const normalizedFhirQuestionnaireErrors =
      normalizedFhirQuestionnairesWithErrorMessages.flatMap(
        (questionnaire) => questionnaire.issues,
      );
    errors.push(...normalizedFhirQuestionnaireErrors);
    console.log(
      "Normalized FHIR Questionnaires: ",
      normalizedFhirQuestionnaires,
    );

    /* Questionnaire Responses */
    const allNormalizedFhirQuestionnaireResponsesWithErrorMessages = 
      fhirQuestionnaireResponses.map((response) =>
        normalizeQuestionnaireResponse(response, normalizedFhirQuestionnaires),
      );
    const allNormalizedFhirQuestionnaireResponses =
      allNormalizedFhirQuestionnaireResponsesWithErrorMessages
        .map((response) => response.data);
    const normalizedFhirQuestionnaireResponsesWithErrorMessages =
      allNormalizedFhirQuestionnaireResponsesWithErrorMessages.filter(
          (result) =>
            result.data !== undefined && result.data.questionnaire !== undefined &&
            questionnairesInConfig.includes(result.data.questionnaire),);
    const normalizedFhirQuestionnaireResponses =
      normalizedFhirQuestionnaireResponsesWithErrorMessages
        .map((response) => response.data); 
    
    const excludedQuestionnaireResponseIds = _.difference(allNormalizedFhirQuestionnaireResponses.map((response) => response.id), 
      normalizedFhirQuestionnaireResponses.map((response) => response.id));
    const excludedQuestionnaireResponses = allNormalizedFhirQuestionnaireResponses.filter((response) => excludedQuestionnaireResponseIds.includes(response.id));
    const excludedQuestionnaireResponsesGroupedByQuestionnaire =_.groupBy(excludedQuestionnaireResponses, (response) => response.questionnaire);

    if (excludedQuestionnaireResponseIds.length > 0) {
      Object.entries(excludedQuestionnaireResponsesGroupedByQuestionnaire).forEach(([url, responses]) => {
         errors.push({
        id: `issue-questionnaireResponse-${Math.random().toString(36).substring(2, 9)}`,
        level: "warning",
        message: `For the patient, there ${responses.length > 1 ? "exist QuestionnaireResponses with ids" : "exists a QuestionnaireResponse with id"} ${responses.map((response) => response.id)} for 
          Questionnaire with url ${url}. 
          Since the questionnaire is not defined in the config file, the ${responses.length > 1 ? "responses are" : "response is"} not displayed.`,
        resourceId: undefined,
        resourceType: "Questionnaire",
        linkId: undefined,
      });
      });
    }      
    const normalizedFhirQuestionnaireResponseErrors =
      normalizedFhirQuestionnaireResponsesWithErrorMessages.flatMap(
        (response) => response.issues,
      );
    errors.push(...normalizedFhirQuestionnaireResponseErrors);
    console.log(
      "Normalized FHIR Questionnaire Responses: ",
      normalizedFhirQuestionnaireResponses,
    );
  
    /* Observations */
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
    errors.push(...normalizedFhirObservationErrors);
    console.log("Normalized FHIR Observations: ", normalizedFhirObservations);

    /* Observation Definitions */
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
    errors.push(...normalizedFhirObservationDefinitionErrors);
    console.log(
      "Normalized FHIR Observation Definitions: ",
      normalizedFhirObservationDefinitions,
    );

    /* ----------------------- Mapping ------------------------ */
    /* Questionnaires */
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
    errors.push(...promDataQuestionnaireErrors);
    console.log("Mapping Questionnaires: ", promDataQuestionnaires); // ok

    /* QuestionnaireResponses */
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
      "Mapping Questionnaire Responses: ",
      promDataQuestionnaireResponses,
    );
    const promDataQuestionnaireResponseErrors =
      questionnaireResponsesWithErrorMessages.flatMap(
        (questionnaireResponse) => questionnaireResponse.issues,
      );
    errors.push(...promDataQuestionnaireResponseErrors);

    /* Observations */
    const promDataObservationsWithErrorMessages = normalizedFhirObservations
      .map((observation) =>
        mapNormalizedObservationToPromDataObservation(observation),
      )
      .filter((result) =>
        promDataQuestionnaireResponses
          .map((response) => response.id)
          .includes(result.data.questionnaireResponse),
      );
    console.log(
      "Mapping Observations with Error Messages: ",
      promDataObservationsWithErrorMessages,
    );
    const promDataObservations = promDataObservationsWithErrorMessages.map(
      (observation) => observation.data,
    );
    const promDataObservationErrors =
      promDataObservationsWithErrorMessages.flatMap(
        (observation) => observation.issues,
      );
    console.log("Mapping Observation Errors: ", promDataObservationErrors);
    errors.push(...promDataObservationErrors);
    console.log("Mapping Observations: ", promDataObservations); // ok

    /* ObservationDefinitions */
    const promDataObservationDefinitionsWithErrorMessages =
      normalizedFhirObservationDefinitions
        .map((observationDefinition) =>
          mapNormalizedObservationDefinitionToPromDataObservationDefinition(
            observationDefinition,
          ),
        )
        .filter((result) =>
          promDataObservations
            .map((observation) => observation.observationDefinition)
            .includes(result.data.url),
        );

    const promDataObservationDefinitions =
      promDataObservationDefinitionsWithErrorMessages.map(
        (observationDefinition) => observationDefinition.data,
      );
    const promDataObservationDefinitionErrors =
      promDataObservationDefinitionsWithErrorMessages.flatMap(
        (observationDefinition) => observationDefinition.issues,
      );
    errors.push(...promDataObservationDefinitionErrors);
    console.log(
      "Mapping Observation Definitions: ",
      promDataObservationDefinitions,
    );

    // Filter errors for Observations and Observation Definitions
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      if (error.resourceType === "Observation") {
        const observation = promDataObservations.find(
          (observation) => observation.id === error.resourceId,
        );
        if (observation === undefined) {
          errors.splice(i, 1);
          i = i - 1;
        }
      }
      if (error.resourceType === "ObservationDefinition") {
        const observationDefinition = promDataObservationDefinitions.find(
          (observationDefinition) =>
            observationDefinition.id === error.resourceId,
        );
        if (observationDefinition === undefined) {
          errors.slice(i, 1);
          i = i - 1;
        }
      }
    }

    /* ----------------------- Add config data ------------------------ */
    /* Questionnaire */
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
    errors.push(...promDataQuestionnaireConfigurationErrors);
    console.log(
      "Mapping Questionnaires with Configurations: ",
      promDataQuestionnairesWithConfigurations,
    );

    /* Questionnaire Response */
    const promDataQuestionnaireResponsesWithConfigurationsAndErrorMessages =
      promDataQuestionnaireResponses.map((questionnaireResponse) =>
        addConfigurationsToQuestionnaireResponse(
          questionnaireResponse,
          promDataObservations,
          config,
        ),
      );
    const promDataQuestionnaireResponsesWithConfigurations =
      promDataQuestionnaireResponsesWithConfigurationsAndErrorMessages.map(
        (questionnaire) => questionnaire.data,
      );
    const promDataQuestionnaireResponsesConfigurationErrors =
      promDataQuestionnairesWithConfigurationsAndErrorMessages.flatMap(
        (questionnaire) => questionnaire.issues,
      );
    errors.push(...promDataQuestionnaireResponsesConfigurationErrors);
    console.log(
      "Mapping Questionnaire Responses with Configurations: ",
      promDataQuestionnaireResponsesWithConfigurations,
    );

    // Domains
    const globalHealthDimensionsFromConfig =
      extractGlobalHealthDimensionsFromConfig(config);
    const domainsFromConfig = extractDomainsFromConfig(config);
    const domains = sortDomains(domainsFromConfig, globalHealthDimensionsFromConfig);

    /* ----------------------- Clean data ------------------------ */
    /* Questionnaire Response */
    const questionnaireResponseIdsWithErrors = errors
      .filter(
        (error) =>
          error.level === "error" &&
          error.resourceType === "QuestionnaireResponse" &&
          error.linkId === undefined,
      )
      .map((error) => error.resourceId);
    const linkIdsWithErrors = errors
      .filter((error) => error.level === "error" && error.linkId !== undefined)
      .map((error) => error.linkId);
    const promDataQuestionnaireResponsesWithoutErrors =
      promDataQuestionnaireResponses.filter(
        (questionnaireResponse) =>
          !questionnaireResponseIdsWithErrors.includes(
            questionnaireResponse.id,
          ),
      );
    const promDataQuestionnaireResponsesWithFilteredItems =
      promDataQuestionnaireResponsesWithoutErrors.map((response) => {
        const items: Record<string, Mapping.ResponseItem> = {};
        Object.keys(response.items).forEach((linkId) => {
          if (!linkIdsWithErrors.includes(linkId)) {
            items[linkId] = response.items[linkId];
          }
        });
        return {
          ...response,
          items: items,
        };
      });
    
    // Tranform Questionnaire Responses to Record
    // const questionnaireResponsesRecord: Record<
    //   string,
    //   Mapping.QuestionnaireResponse
    // > = {};
    // promDataQuestionnaireResponsesWithConfigurations.forEach(
    //   (questionnaireResponse) => {
    //     questionnaireResponsesRecord[questionnaireResponse.id] =
    //       questionnaireResponse;
    //   },
    // );
    // console.log(
    //   "Questionnaire Responses in Record: ",
    //   // questionnaireResponsesRecord,
    // );
    const questionnaireResponsesWithFilteredItems: Record<
      string,
      Mapping.QuestionnaireResponse
    > = {};
    promDataQuestionnaireResponsesWithFilteredItems.forEach(
      (questionnaireResponse) => {
        questionnaireResponsesWithFilteredItems[questionnaireResponse.id] =
          questionnaireResponse;
      },
    );
    console.log(
      "Filtered Questionnaire Responses in Record: ",
      questionnaireResponsesWithFilteredItems,
    );

    /* Errors and Warnings */
    const uniqueErrors: GlobalTypes.DataIssue[] = [];
    errors.forEach((error) => {
      if (!uniqueErrors.map((err) => err.message).includes(error.message)) {
        uniqueErrors.push(error);
      }
    });

    /* Questionnaires */
    const questionnaires = [... new Set(promDataQuestionnairesWithConfigurations)];
    console.log("Questionnaires: ", questionnaires);

    // Set variables
    setQuestionnaires(questionnaires);
    setQuestionnaireResponses(questionnaireResponsesWithFilteredItems);
    setDataIssues([
      ...new Set(uniqueErrors)
    ]);
    setGlobalHealthDimensions(globalHealthDimensionsFromConfig);
    setDomains(domains);
    setQuestionnairesReady(true);
    setSelectedQuestionnaires(questionnaires.map((questionnaire) => questionnaire.id));
    // setDisplayedQuestionnaires(questionnaires);
    // setDisplayedQuestionnaireResponses(questionnaireResponsesWithFilteredItems);
  }, [
    fhirQuestionnaires,
    fhirQuestionnaireResponses,
    fhirObservationDefinitions,
    fhirObservations,
    dataLoaded,
  ]);

 // Data visualization

  useEffect(() => {
    if (!questionnairesReady) {
      return;
    }
    if (dataIssues.length > 0) {
      setIsModalOpen(true);
    }
   
    const questionnairesForChart = questionnaires; //.filter((questionnaire) => selectedQuestionnaires.includes(questionnaire.id));
    const questionnaireResponsesForChart: Record<string, Mapping.QuestionnaireResponse> = questionnaireResponses;
    // Object.entries(questionnaireResponses).forEach(([key, response]) => {
    //   if (selectedQuestionnaires.includes(response.questionnaire.id)) {
    //     questionnaireResponsesForChart[key] = response;
    //   }
    // });

    const questionnairesByDate = createDateQuestionnaireNamesRecord(
      questionnaireResponses,
    );

    const chartData = createChartData(questionnaireResponsesForChart);
    console.log("Chart Data: ", chartData); 

    // Questionnaire Card
    const questionnaireCardData = createQuestionnaireCardData(questionnairesForChart);
    console.log("Questionnaire Card Data: ", questionnaireCardData)
    const questionnaireNames = Object.keys(questionnaireCardData);
    const longestQuestionnaireName = questionnaireNames.reduce(
      (longest, current) => (current.length > longest.length ? current : longest),
      "",
    );
    const lengthOfLongestQuestionnaireName = longestQuestionnaireName.length;

    // Line Chart
    const globalScoresDataSeries =
      globalHealthDimensions.length > 0
        ? chartData.yData.filter(
            (dataseries) =>
              dataseries.seriesType === ITEM_TYPES.score &&
              globalHealthDimensions.includes(dataseries.domain),
          )
        : undefined;
    const dimensionScoresDataSeries = chartData.yData.filter(
      (dataseries) =>
        dataseries.seriesType === ITEM_TYPES.score &&
        (globalHealthDimensions.length === 0 ||
          !globalHealthDimensions.includes(dataseries.domain)),
    );
    console.log("Scores: ", globalScoresDataSeries);
    console.log("Dimension Scores: ", dimensionScoresDataSeries);

    const itemsDataSeries = chartData.yData.filter(
      (dataseries) => dataseries.seriesType === ITEM_TYPES.item,
    );
    console.log("Items: ", itemsDataSeries);

    const allScoresDataSeries =
      globalScoresDataSeries !== undefined
        ? [...globalScoresDataSeries, ...dimensionScoresDataSeries]
        : dimensionScoresDataSeries;
    console.log("All Scores: ", allScoresDataSeries);

    // const chartDimensions = [
    //   ...new Set([
    //     ...itemDataSeries.map((item) => item.dimension),
    //     ...scoreDataSeries.map((score) => score.dimension),
    //   ]),
    // ]; 

    const lineChartData: Visualization.ChartData = {
      xData: chartData.xData,
      yData: globalScoresDataSeries ?? [],
    }
    const scoreChartSubTitle = Array.from(
      new Set(
        Object.values(questionnaireResponses).map(
          (questionnaireResponse) => {
            return questionnaireResponse.questionnaire.name;
          },
        ),
      ),
    );
    
    // Heatmap
    const heatmapDataByDomain: Record<string, Visualization.ChartData> =
      createHeatmapData(
        domains,
        questionnairesForChart,
        allScoresDataSeries,
        itemsDataSeries,
        chartData.xData,
      );
    console.log("Chart Data by Dimension: ", heatmapDataByDomain);

    // Table
    const tableDataByQuestionnaire: Record<string, Visualization.ChartData> =
      createTableData(questionnairesForChart, chartData);
    console.log("Table Data by Questionnaire: ", tableDataByQuestionnaire);

    // Header Cards
    const resourceIdsWithIssues = dataIssues
      .map((issue) => issue.resourceId)
      .filter((id) => id !== undefined);
    console.log("IDs of resources with issues: ", resourceIdsWithIssues);

    const itemWarningsByQuestionnaireId = _.groupBy(
      dataIssues.filter(
        (issue) => issue.level === "warning" && issue.linkId !== undefined,
      ),
      (issue) => issue.resourceId,
    );
    console.log(
      "Item Warnings by Questionnaire ID: ",
      itemWarningsByQuestionnaireId,
    );
    // const periodOfObservations = calculatePeriodOfObservations(
    //   questionnaireResponses,
    // );

    // set variables
    // setDisplayedQuestionnaires(questionnairesForChart);
    // setDisplayedQuestionnaireResponses(questionnaireResponsesForChart);
    setLengthOfLongestQuestionnaireName(lengthOfLongestQuestionnaireName);
    setLineChartData(lineChartData);
    setQuestionnairesByDate(questionnairesByDate);
    setHeatmapDataByDomain(heatmapDataByDomain);
    setTableDataByQuestionnaire(tableDataByQuestionnaire);
    setItemWarningsByQuestionnaireId(itemWarningsByQuestionnaireId);
    setQuestionnaireCardData(questionnaireCardData);
    // setPeriodOfObservations(periodOfObservations);
    setScoreChartSubTitle(scoreChartSubTitle);
    setIdsOfResourcesWithIssues(resourceIdsWithIssues);
  }, [
    questionnaires,
    questionnaireResponses,
    dataIssues,
    globalHealthDimensions,
    questionnairesReady,
    domains,
    // selectedQuestionnaires,
  ]);

  // Handlers

  const handleContinue = () => {
    setIsModalOpen(false);
  };

  const toggleErrorDetails = () => {
    setShowErrors((prev) => !prev);
    console.log("Toggled showErrors: ", showErrors);
  };

  const handleQuestionnaireSelection = (questionnaireId: string) => {
    setSelectedQuestionnaires((prev) => {
      const index = prev.indexOf(questionnaireId);
      if (index === -1) {
        return [...prev, questionnaireId];
      } else {
        return prev.filter((id) => id !== questionnaireId);
      }
    });
    // TODO: filtern hier (Funktion in utils), state für filteredQuestionnaires, filteredQuestionnaireResponses
    
    console.log("Selected Questionnaires: ", selectedQuestionnaires);
  }

  // Loading Errors
  if (configError)
    return (
      <React.Fragment>
        <div>Failed to load config</div>
        <div>{configError}</div>
      </React.Fragment>
    );
  if (fhirError)
    return (
      <React.Fragment>
        <div>Failed to load FHIR data</div>
        <div>{fhirError}</div>
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
          <main className="tw:max-w-screen tw:xl:max-w-9/10 tw:mx-auto tw:h-full tw:justify-center tw:px-6">
            <div className="tw:flex tw:flex-col tw:md:flex-row tw:gap-8 tw:py-16 tw:justify-center tw:items-start">
              <div className="tw:card tw:lg:basis-1/3 tw:xl:basis-md tw:bg-base-100 tw:shadow-md">
                <div className="tw:card-body">
                  <h3 className="tw:card-title">Filter Options</h3>
                  <div>
                    <p>Questionnaires</p>
                  </div>
                  <div>
                    {questionnaires.map((questionnaire) => (
                      <label key={questionnaire.id} className="tw:label tw:text-gray-900">
                        <input type="checkbox" checked={selectedQuestionnaires.includes(questionnaire.id)} onChange={() => handleQuestionnaireSelection(questionnaire.id)} className="tw:checkbox" />
                        {questionnaire.name}
                      </label>
                    ))}
                  </div>
                  <div>
                    <p>Time Range</p> 
                      <DateRangePicker />
                  </div>
                </div>
              </div>
              <div className="tw:card tw:lg:basis-1/3 tw:xl:basis-md tw:bg-base-100 tw:shadow-md tw:overflow-y-auto tw:max-h-[60vh]">
                <div className="tw:card-body">
                  <h3 className="tw:card-title">Data Info</h3>
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
                  <h3 className="tw:card-title">Error Info</h3>
                  <p>
                    For FHIR resources with follwing ids there have been errors
                    detected:
                  </p>
                  {idsOfResourcesWithIssues.length > 0 ? (
                    <ul className="tw:list-disc tw:pl-5">
                      {[...new Set(idsOfResourcesWithIssues)].map((id) => (
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
                        {showErrors
                          ? "Hide error details"
                          : "Show error details"}
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
                      {dataIssues.some(
                        (issue) => issue.level === "warning",
                      ) && (
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
             <h2 className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
                      Dimension Coverage by Questionnaire
                    </h2>
            <div className="tw:flex tw:flex-col tw:md:flex-row tw:gap-8 tw:py-16 tw:justify-left tw:items-start">
            
              {/* {chartData && questionnaireCardData && (
                <div className="flex flex-col">
                  {dimensions.map(dim => (
                    <div key={dim} className="h-6 text-xs flex items-center">
                      {dim}
                    </div>
                  ))}
                </div>
              )} */}
               { questionnaires && questionnaireCardData && (
                Object.entries(questionnaireCardData).filter(([id, _]) => (
                  selectedQuestionnaires.includes(id)
                )).
                map(([id, [name, questionnaireDimensions]]) => (
                <QuestionnaireCard key={id} questionnaire={{name: name, dimensions: questionnaireDimensions}} dimensions={domains} lengthOfLongestQuestionnaireName={lengthOfLongestQuestionnaireName} />
                )))
                }
            </div>
           
            {/* <div className="tw:grid tw:grid-cols-15 tw:item-center tw:py-4">
              <div className="tw:col-span-15 tw:lg:col-span-15 tw:2xl:col-span-15">
                <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
                  Dimension Covering
                </p>
                {chartData && questionnaireCardData && (
                  <Matrix
                    data={questionnaireCardData}
                    dimensions={[
                      ...new Set(
                        dimensions.filter(
                          (dimension) =>
                            dimension !== unspecifiedDimension &&
                            dimension !== "",
                        ),
                      ),
                    ]}
                    //subtitle={"Health indication per dimension where points closer to edges indicate better health status"}
                  />
                )}
              </div>
            </div> */}
            {/* 16 6 5*/}
            <div className="tw:grid tw:grid-cols-12 tw:item-center tw:py-4">
              {/* <div className="tw:col-span-15 tw:lg:col-span-6 tw:2xl:col-span-5">
                <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
                  Dimension Covering
                </p>
                {chartData && questionnaireCardData && (
                  <Matrix
                    data={questionnaireCardData}
                    dimensions={dimensions}
                    //subtitle={"Health indication per dimension where points closer to edges indicate better health status"}
                  />
                )}
              </div> */}

              {/* </div>
              
          
                  <div className="tw:flex-1 tw:item-center tw:py-4"> */}
                 
              <div className="tw:col-span-12 tw:lg:col-span-10 tw:lg:col-start-2 tw:2xl:col-span-8 tw:2xl:col-start-3">
                {lineChartData && lineChartData.yData.length > 0 && (
                  <>
                    <h2 className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
                      Global Health Scores (Normalized)
                    </h2>

                    <LineChart
                      subtitle={
                        "Questionnaires: " + scoreChartSubTitle.join(", ")
                      }
                      data={lineChartData}
                    />
                  </>
                )}
                {lineChartData === undefined || lineChartData.yData.length === 0 && (
                  <p className="tw:text-lg tw:text-center tw:text-[#333]">
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
           
            <Heatmap showItemDetails={showItemDetails} />
          </div> */}

            {/* <div className="tw:flex-1 tw:py-8">
            <div className="tw:join tw:join-vertical tw:bg-base-100" style={{display: "flex", alignItems: "center"}}>   
            <Heatmap data={chartData} />
            
          </div>
          </div> */}
            <h2 className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
              Selected PROs by Domain
            </h2>
            <div className="tw:grid tw:grid-cols-6 tw:py-8 tw:gap-8">
              {/* <div className="tw:join tw:join-vertical tw:bg-base-100" style={{display: "flex", alignItems: "center"}}>    */}
              {domains && heatmapDataByDomain && domains
                .map((domain) => (
                  <div
                    key={domain}
                    className="tw:col-span-6 tw:md:col-span-3 tw:lg:col-span-2"
                  > 
                  {heatmapDataByDomain[domain] !== undefined && heatmapDataByDomain[domain].yData.length > 0 && (

                  
                    <div className="tw:card tw:bg-base-100 tw:shadow-md">
                      <div className="tw:card-body">
                        <p className="tw:text-lg tw:font-bold tw:text-[#333]">
                          {domain}
                        </p>
                        <Heatmap data={heatmapDataByDomain[domain]} />
                      </div>
                    </div>
                  )}
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

            <h2 className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
              Complete PROs by PROM/Questionnaire
            </h2>

            {/* <div className="tw:flex-1 tw:py-8">
              <div
                className="tw:join tw:join-vertical tw:bg-base-100" */}
            {/* //     style={{ display: "flex", alignItems: "center" }}
            //   >
            //     {questionnairesForChart.map((questionnaire) => (
            //       <React.Fragment key={questionnaire.id}>
            //         <Collapse
            //           title={questionnaire.name}
            //           children={
            //             <Table
            //               data={tableDataByQuestionnaire[questionnaire.id]}
            //               dimensions={dimensions}
            //               errors={
            //                 itemWarningsByQuestionnaireId[questionnaire.id] !==
            //                 undefined
            //                   ? itemWarningsByQuestionnaireId[questionnaire.id]
            //                   : undefined
            //               }
            //             />
            //           }
            //         />
            //       </React.Fragment>
            //     ))}
            //   </div>
            // </div> */}

            <div className="tw:flex-1 tw:py-8">
              <div
                className="tw:join tw:join-vertical tw:bg-base-100"
                style={{ display: "flex", alignItems: "center" }}
              >
                {questionnaires && tableDataByQuestionnaire && questionnaires.filter((questionnaire) => (
                  selectedQuestionnaires.includes(questionnaire.id)
                )).
                map((questionnaire) => (
                  <React.Fragment key={questionnaire.id}>
                    {tableDataByQuestionnaire[questionnaire.id] !== undefined && (
                     <Collapse
                      title={questionnaire.name}
                      children={
                        <SimpleDataTable
                          data={tableDataByQuestionnaire[questionnaire.id]}
                          domains={domains}
                          errors={
                            itemWarningsByQuestionnaireId[questionnaire.id] !==
                            undefined
                              ? itemWarningsByQuestionnaireId[questionnaire.id]
                              : undefined
                          }
                         
                        />
                      }
                    />)}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* <div className="tw:flex-1 tw:item-center tw:py-4"> */}
            {/* <button onClick={toggleExpandAll} className="tw:btn">
              {expandAll ? "Collapse All" : "Expand All"}
            </button> */}
            {/* <CollapsibleHeatmap
              columns={chartXData}
              dimensions={heatmapDimensions}
              allRowsExpanded={expandAll}
            />
          </div> */}
          </main>
          {/* <Footer /> */}
        </div>
      </div>
      {dataIssues.length > 0 && (
        <ErrorModal
          data={[...new Set(dataIssues)]}
          open={isModalOpen}
          onClose={handleContinue}
        />
      )}
    </div>
  );
}

export default App;
