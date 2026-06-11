// Styles
import "@styles/style.css";

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas);

// React packages
import React, { useState, useEffect } from "react";
import * as _ from "lodash-es";

// Components
import DateRangePicker from "@components/DateRangePicker";
import LineChart from "@components/LineChart";
import Heatmap from "@components/Heatmap";
import QuestionnaireCard from "@components/QuestionnaireCard";
import SankeyDemo from "@components/SankeyDemo";
import SankeyChart from "@components/SankeyChart";
import DomainCard from "@components/DomainCard";
import SimpleDataTable from "@components/SimpleDataTable";
import Collapse from "@components/Collapse";
import ErrorModal from "@components/ErrorModal";
import Mapper from "@components/Mapper";
import RadarChart from "@components/RadarChart";
import MappingTable from "@components/MappingTable";
import ErrorCard from "@components/ErrorCard";
import GridTable from "@components/GridTable";
import FilterOptionsDisplay from "@components/FilterOptionsDisplay";

// Types
import { type Errors, forwardErrorsToUser } from "@utils/errors";
import type { Visualization } from "@utils/visualization";
import { ITEM_TYPES, type Mapping } from "@utils/mapping";

// Chart options
import {
  singleLineChartOptions,
  justYAxisLineChartOptions,
  groupedLineChartOptions,
  emptyLineChartOptions,
  justXAxisLineChartOptions,
  lineChartSeriesOption,
  groupedLineChartSeriesOption,
} from "@utils/charts";

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
  addUnspecifiedDimensionToDomains,
  createDateQuestionnaireNamesRecord,
  createTableData,
  createHeatmapData,
  createQuestionnaireCardData,
  createRadarData,
  createDomainQuestionnaireNamesDimensionsRecord,
  extractGlobalScoresDataSeries,
  extractDomainScoresDataSeries,
  extractDimensionScoresDataSeries,
  extractDomainDataSeries,
  extractItemsDataSeries,
  createQuestionnaireMostRecentResponseDateRecord,
  createDomainDimensionsRecord,
  filterQuestionnaireResponsesThatAreWithinDates,
  filterQuestionnaireResponsesThatAreOnSingleDates,
  filterQuestionnaireResponsesByQuestionnaireIds,
  extractDatesOfQuestionnaireResponses,
  createPseudoDataSeries,
  createDomainDimensionQuestionnaireTupleArray,
  createDimensionWithQuestionnaireByDomainRecord,
} from "@utils/visualization";

// Config
import {
  addConfigurationsToQuestionnaire,
  addConfigurationsToQuestionnaireResponse,
  extractQuestionnairesFromConfig,
  findQuestionnairesNotListedInConfig,
  extractGlobalHealthDomainsFromConfig,
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
  const [dataIssues, setDataIssues] = useState<Errors.DataIssue[]>([]);
  const [dataIssuesForUser, setDataIssuesForUser] = useState<
    Errors.DataIssue[]
  >([]);
  const [globalHealthDimensions, setGlobalHealthDimensions] = useState<
    string[]
  >([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [showItemsForDomain, setShowItemsForDomain] = useState<
    Record<string, boolean>
  >({});

  // Data transformation
  const [questionnaireNamesByDate, setQuestionnaireNamesByDate] = useState<
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
  // const [scoreChartSubTitle, setScoreChartSubTitle] = useState<string[]>([]);
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
    Record<string, [string, string[]]>
  >({});
  const [chartXData, setChartXData] = useState<string[]>([]);
  const [globalScoresDataSeries, setGlobalScoresDataSeries] = useState<
    Visualization.DataSeries[]
  >([]);
  const [domainScoresDataSeriesByDomain, setDomainScoresDataSeriesByDomain] =
    useState<Record<string, Visualization.DataSeries[]>>({});
  const [
    dimensionScoresDataSeriesByDomain,
    setDimensionScoresDataSeriesByDomain,
  ] = useState<Record<string, Visualization.DataSeries[]>>({});
  const [
    itemDataSeriesByDomainAndDimension,
    setItemDataSeriesByDomainAndDimension,
  ] = useState<Record<string, Record<string, Visualization.DataSeries[]>>>({});
  const [
    dimensionsWithQuestionnaireByDomain,
    setDimensionsWithQuestionnaireByDomain,
  ] = useState<Record<string, [string, string][]>>();
  const [domainsForChart, setDomainsForChart] = useState<string[]>([]);
  const [dimensionsByDomain, setDimensionsByDomain] = useState<
    Record<string, string[]>
  >({});
  const [domainsSankeyData, setDomainsSankeyData] = useState<
    Record<string, Record<string, string[]>>
  >({});
  const [globalScoresLineChartData, setGlobalScoresLineChartData] =
    useState<Visualization.ChartData>();
  const [radarChartData, setRadarChartData] = useState<
    Record<string, string[]>
  >({});
  const [
    lengthOfLongestQuestionnaireName,
    setLengthOfLongestQuestionnaireName,
  ] = useState<number>(0);
  const [itemWarningsByQuestionnaireId, setItemWarningsByQuestionnaireId] =
    useState<Record<string, Errors.DataIssue[]>>({});
  const [idsOfResourcesWithIssues, setIdsOfResourcesWithIssues] = useState<
    string[]
  >([]);
  const [
    domainQuestionnaireDimensionRecord,
    setDomainQuestionnaireDimensionRecord,
  ] = useState<Record<string, Record<string, string[]>>>({});
  const [
    domainDimensionQuestionnaireTuples,
    setDomainDimensionQuestionnaireTuples,
  ] = useState<[string, string, string][]>([]);
  const [
    allDatesOfQuestionnaireResponses,
    setAllDatesOfQuestionnaireResponses,
  ] = useState<string[]>([]);
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<
    string[]
  >([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedQuestionnaireResponses, setSelectedQuestionnaireResponses] =
    useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedDimensionsByDomain, setSelectedDimensionsByDomain] = useState<
    Record<string, string[]>
  >({});
  // const [displayedQuestionnaires, setDisplayedQuestionnaires] = useState<Mapping.Questionnaire[]>([]);
  // const [displayedQuestionnaireResponses, setDisplayedQuestionnaireResponses] = useState<Record<string, Mapping.QuestionnaireResponse>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [allDomainsSelected, setAllDomainsSelected] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const [dateValue, setDateValue] = useState<string>("");
  const [dateRange, setDateRange] = useState<Visualization.RangeState>({
    start: "",
    end: "",
  });

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
    const errors: Errors.DataIssue[] = [];

    // only questionnaires and responses that are defined in config file
    const questionnairesInConfig = extractQuestionnairesFromConfig(config);

    /* ----------------------- Normalize FHIR data ------------------------*/
    /* Questionnaires */
    const normalizedFhirQuestionnairesResult = fhirQuestionnaires
      .map((questionnaire) => normalizeQuestionnaire(questionnaire))
      .filter((result) => questionnairesInConfig.includes(result.data.url));
    const normalizedFhirQuestionnaires = normalizedFhirQuestionnairesResult.map(
      (questionnaire) => questionnaire.data,
    );
    const normalizedFhirQuestionnaireIssues =
      normalizedFhirQuestionnairesResult.flatMap(
        (questionnaire) => questionnaire.issues,
      );
    errors.push(...normalizedFhirQuestionnaireIssues);
    console.log(
      "Normalized FHIR Questionnaires: ",
      normalizedFhirQuestionnaires,
    );

    /* Questionnaire Responses */
    const allNormalizedFhirQuestionnaireResponsesResult =
      fhirQuestionnaireResponses.map((response) =>
        normalizeQuestionnaireResponse(response, normalizedFhirQuestionnaires),
      );
    const allNormalizedFhirQuestionnaireResponses =
      allNormalizedFhirQuestionnaireResponsesResult.map(
        (response) => response.data,
      );
    const normalizedFhirQuestionnaireResponsesResult =
      allNormalizedFhirQuestionnaireResponsesResult.filter(
        (result) =>
          result.data !== undefined &&
          result.data.questionnaire !== undefined &&
          questionnairesInConfig.includes(result.data.questionnaire),
      );
    const normalizedFhirQuestionnaireResponses =
      normalizedFhirQuestionnaireResponsesResult.map(
        (response) => response.data,
      );

    const questionnairesNotInConfigResult = findQuestionnairesNotListedInConfig(
      questionnairesInConfig,
      allNormalizedFhirQuestionnaireResponses,
      normalizedFhirQuestionnaires,
    );
    if (questionnairesNotInConfigResult.issues.length > 0) {
      errors.push(...questionnairesNotInConfigResult.issues);
    }
    const normalizedFhirQuestionnaireResponseIssues =
      normalizedFhirQuestionnaireResponsesResult.flatMap(
        (response) => response.issues,
      );
    errors.push(...normalizedFhirQuestionnaireResponseIssues);
    console.log(
      "Normalized FHIR Questionnaire Responses: ",
      normalizedFhirQuestionnaireResponses,
    );

    /* Observations */
    const normalizedFhirObservationsResult = fhirObservations.map(
      (observation) => normalizeObservation(observation),
    );
    const normalizedFhirObservations = normalizedFhirObservationsResult.map(
      (observation) => observation.data,
    );
    const normalizedFhirObservationIssues =
      normalizedFhirObservationsResult.flatMap(
        (observation) => observation.issues,
      );
    errors.push(...normalizedFhirObservationIssues);
    console.log("Normalized FHIR Observations: ", normalizedFhirObservations);

    /* Observation Definitions */
    const normalizedFhirObservationDefinitionsResult =
      fhirObservationDefinitions.map((observationDefinition) =>
        normalizeObservationDefinition(observationDefinition),
      );
    const normalizedFhirObservationDefinitions =
      normalizedFhirObservationDefinitionsResult.map(
        (observationDefinition) => observationDefinition.data,
      );
    const normalizedFhirObservationDefinitionIssues =
      normalizedFhirObservationDefinitionsResult.flatMap(
        (observationDefinition) => observationDefinition.issues,
      );
    errors.push(...normalizedFhirObservationDefinitionIssues);
    console.log(
      "Normalized FHIR Observation Definitions: ",
      normalizedFhirObservationDefinitions,
    );

    /* ----------------------- Mapping ------------------------ */
    /* Questionnaires */
    const promDataQuestionnairesResult = normalizedFhirQuestionnaires.map(
      (questionnaire) =>
        mapNormalizedQuestionnaireToPromDataQuestionnaire(questionnaire),
    );
    const promDataQuestionnaires = promDataQuestionnairesResult.map(
      (questionnaire) => questionnaire.data,
    );
    const promDataQuestionnaireIssues = promDataQuestionnairesResult.flatMap(
      (questionnaire) => questionnaire.issues,
    );
    errors.push(...promDataQuestionnaireIssues);
    console.log("Mapping Questionnaires: ", promDataQuestionnaires); // ok

    /* QuestionnaireResponses */
    const questionnaireResponsesResult =
      normalizedFhirQuestionnaireResponses.map((response) =>
        mapNormalizedQuestionnaireResponseToPromDataQuestionnaireResponse(
          response,
          promDataQuestionnaires,
        ),
      );
    const promDataQuestionnaireResponses = questionnaireResponsesResult.map(
      (questionnaireResponse) => questionnaireResponse.data,
    );
    console.log(
      "Mapping Questionnaire Responses: ",
      promDataQuestionnaireResponses,
    );
    const promDataQuestionnaireResponseIssues =
      questionnaireResponsesResult.flatMap(
        (questionnaireResponse) => questionnaireResponse.issues,
      );
    errors.push(...promDataQuestionnaireResponseIssues);

    /* Observations */
    const promDataObservationsResult = normalizedFhirObservations
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
      promDataObservationsResult,
    );
    const promDataObservations = promDataObservationsResult.map(
      (observation) => observation.data,
    );
    const promDataObservationIssues = promDataObservationsResult.flatMap(
      (observation) => observation.issues,
    );
    console.log("Mapping Observation Issues: ", promDataObservationIssues);
    errors.push(...promDataObservationIssues);
    console.log("Mapping Observations: ", promDataObservations); // ok

    /* ObservationDefinitions */
    const promDataObservationDefinitionsResult =
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
      promDataObservationDefinitionsResult.map(
        (observationDefinition) => observationDefinition.data,
      );
    const promDataObservationDefinitionIssues =
      promDataObservationDefinitionsResult.flatMap(
        (observationDefinition) => observationDefinition.issues,
      );
    errors.push(...promDataObservationDefinitionIssues);
    console.log(
      "Mapping Observation Definitions: ",
      promDataObservationDefinitions,
    );

    // Filter errors for Observations and Observation Definitions
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      if (error.resourceType === "Observation") {
        const observation = promDataObservations.find(
          (observation) => observation.id === error.context.resourceId,
        );
        if (observation === undefined) {
          errors.splice(i, 1);
          i = i - 1;
        }
      }
      if (error.resourceType === "ObservationDefinition") {
        const observationDefinition = promDataObservationDefinitions.find(
          (observationDefinition) =>
            observationDefinition.id === error.context.resourceId,
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
    const promDataQuestionnaireConfigurationIssues =
      promDataQuestionnairesWithConfigurationsAndErrorMessages.flatMap(
        (questionnaire) => questionnaire.issues,
      );
    errors.push(...promDataQuestionnaireConfigurationIssues);
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
    const promDataQuestionnaireResponsesConfigurationIssues =
      promDataQuestionnairesWithConfigurationsAndErrorMessages.flatMap(
        (questionnaire) => questionnaire.issues,
      );
    errors.push(...promDataQuestionnaireResponsesConfigurationIssues);
    console.log(
      "Mapping Questionnaire Responses with Configurations: ",
      promDataQuestionnaireResponsesWithConfigurations,
    );

    // Domains
    // const globalHealthDimensionsFromConfig =
    //   extractGlobalHealthDimensionsFromConfig(config);
    const domainsFromConfig = extractDomainsFromConfig(config);
    const globalHealthDomainsFromConfig =
      extractGlobalHealthDomainsFromConfig(config);
    console.log(
      "Global Health Domains from Config: ",
      globalHealthDomainsFromConfig,
    );
    const domains = sortDomains(
      domainsFromConfig,
      globalHealthDomainsFromConfig,
    );
    // const domainsWithUnspecifiedDomain = addUnspecifiedDimensionToDomains(domains);

    /* ----------------------- Clean data ------------------------ */
    /* Questionnaire Response */
    const questionnaireResponseIdsWithErrors = errors
      .filter(
        (error) =>
          error.level === "error" &&
          error.resourceType === "QuestionnaireResponse" &&
          error.context.field === undefined,
      )
      .map((error) => error.context.resourceId);
    const linkIdsWithErrors = errors
      .filter(
        (error) => error.level === "error" && error.context.field !== undefined,
      )
      .map((error) => error.context.field);
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
    const uniqueErrors = _.uniqBy(errors, (error) => error.id);
    const errorsForDisplay = errors.filter((error) => error.showUser);
    const uniqueErrorsForDisplay: Errors.DataIssue[] = _.uniqBy(
      errorsForDisplay,
      (error) => error.userMessage,
    );
    console.log("Unique Errors for Display: ", uniqueErrorsForDisplay);

    /* Questionnaires */
    const questionnaires = _.uniqBy(
      promDataQuestionnairesWithConfigurations,
      (questionnaire) => questionnaire.url,
    );
    console.log("Questionnaires: ", questionnaires);

    const allResponseDates = extractDatesOfQuestionnaireResponses(
      questionnaireResponsesWithFilteredItems,
    );

    // Set variables
    setQuestionnaires(questionnaires);
    setQuestionnaireResponses(questionnaireResponsesWithFilteredItems);
    setDataIssuesForUser(uniqueErrors); // ForDisplay
    setDataIssues(uniqueErrors);
    // setGlobalHealthDimensions(globalHealthDimensionsFromConfig);
    setDomains(domains);
    setQuestionnairesReady(true);
    setSelectedQuestionnaires(
      questionnaires.map((questionnaire) => questionnaire.id),
    );
    setAllDatesOfQuestionnaireResponses(allResponseDates);
    setSelectedDates(allResponseDates);
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
    // if (dataIssues.length > 0 && !modalShown) {
    //   setIsModalOpen(true);
    // }

    // Questionnaires, Questionnaire Responses and domains for chart
    const questionnairesForChart = questionnaires.filter((questionnaire) =>
      selectedQuestionnaires.includes(questionnaire.id),
    );
    console.log("Questionnaires for Chart: ", questionnairesForChart);
    //const questionnaireResponsesForChart: Record<string, Mapping.QuestionnaireResponse> = questionnaireResponses;
    const questionnaireResponsesFilteredBySelectedQuestionnaires: Record<
      string,
      Mapping.QuestionnaireResponse
    > = filterQuestionnaireResponsesByQuestionnaireIds(
      questionnaireResponses,
      selectedQuestionnaires,
    );
    const questionnaireResponsesFilteredBySelectedDates: Record<
      string,
      Mapping.QuestionnaireResponse
    > = filterQuestionnaireResponsesThatAreOnSingleDates(
      questionnaireResponses,
      selectedDates,
    );
    const questionnaireResponsesFilteredBySelectedRange: Record<
      string,
      Mapping.QuestionnaireResponse
    > = filterQuestionnaireResponsesThatAreWithinDates(
      questionnaireResponses,
      dateRange.start,
      dateRange.end,
    );

    console.log(
      "Questionnaire Responses Filtered by Selected Questionnaires: ",
      questionnaireResponsesFilteredBySelectedQuestionnaires,
    );
    console.log(
      "Questionnaire Responses Filtered by Selected Dates: ",
      questionnaireResponsesFilteredBySelectedDates,
    );
    console.log(
      "Questionnaire Responses Filtered by Selected Range: ",
      questionnaireResponsesFilteredBySelectedRange,
    );

    const questionnaireResponseIdsForChart = _.intersection(
      Object.keys(questionnaireResponsesFilteredBySelectedQuestionnaires),
      Object.keys(questionnaireResponsesFilteredBySelectedDates),
      Object.keys(questionnaireResponsesFilteredBySelectedRange),
    );

    const questionnaireResponsesForChart: Record<
      string,
      Mapping.QuestionnaireResponse
    > = {};
    questionnaireResponseIdsForChart.forEach((id) => {
      questionnaireResponsesForChart[id] = questionnaireResponses[id];
    });
    // questionnaireResponsesFilteredBySelectedQuestionnaires && Object.keys(questionnaireResponsesFilteredBySelectedQuestionnaires).forEach((id) => {
    //   questionnaireResponsesForChart[id] = questionnaireResponsesFilteredBySelectedQuestionnaires[id];
    // });
    // questionnaireResponsesFilteredBySelectedDates && Object.keys(questionnaireResponsesFilteredBySelectedDates).forEach((id) => {
    //   if (questionnaireResponsesForChart[id] === undefined) {
    //     questionnaireResponsesForChart[id] = questionnaireResponsesFilteredBySelectedDates[id];
    //   }
    // });
    // questionnaireResponsesFilteredBySelectedRange && Object.keys(questionnaireResponsesFilteredBySelectedRange).forEach((id) => {
    //   if (questionnaireResponsesForChart[id] === undefined) {
    //     questionnaireResponsesForChart[id] = questionnaireResponsesFilteredBySelectedRange[id];
    //   }
    // });
    console.log(
      "Questionnaire Responses for Chart: ",
      questionnaireResponsesForChart,
    );

    const domainsForChart = domains.filter((domain) =>
      questionnairesForChart.some((questionnaire) =>
        Object.values(questionnaire.items).some(
          (item) => item.domain === domain,
        ),
      ),
    );
    console.log("Domains for Chart: ", domainsForChart);
    const questionnaireNamesByDate: Record<string, string[]> =
      createDateQuestionnaireNamesRecord(questionnaireResponses);
    const questionnaireMostRecentResponseDateRecord: Record<string, string> =
      createQuestionnaireMostRecentResponseDateRecord(questionnaireNamesByDate);

    // Chart Data
    const chartData = createChartData(questionnaireResponsesForChart);
    console.log("Chart Data: ", chartData);

    // Data series for different charts
    const chartDataSeriesByDomain: Record<string, Visualization.DataSeries[]> =
      {};
    const globalScoresDataSeries: Visualization.DataSeries[] =
      extractGlobalScoresDataSeries(chartData.yData, questionnairesForChart);
    const domainScoresDataSeriesByDomain: Record<
      string,
      Visualization.DataSeries[]
    > = {};
    const dimensionScoresDataSeriesByDomain: Record<
      string,
      Visualization.DataSeries[]
    > = {};
    const domainDimensionItemsDataSeriesRecord: Record<
      string,
      Record<string, Visualization.DataSeries[]>
    > = {};
    const selectedDimensionsByDomain: Record<string, string[]> = {};
    const showItemsFlagByDomain: Record<string, boolean> = {};

    domainsForChart.forEach((domain) => {
      chartDataSeriesByDomain[domain] = extractDomainDataSeries(
        chartData.yData,
        questionnairesForChart,
        domain,
      );
      // domain and dimension scores not necessarily disjoint!
      domainScoresDataSeriesByDomain[domain] = extractDomainScoresDataSeries(
        chartDataSeriesByDomain[domain],
        questionnairesForChart,
      );
      dimensionScoresDataSeriesByDomain[domain] =
        extractDimensionScoresDataSeries(
          chartDataSeriesByDomain[domain],
          questionnairesForChart,
          domainScoresDataSeriesByDomain[domain],
        );
      domainDimensionItemsDataSeriesRecord[domain] = extractItemsDataSeries(
        chartDataSeriesByDomain[domain],
        domainScoresDataSeriesByDomain[domain],
        dimensionScoresDataSeriesByDomain[domain],
        questionnairesForChart,
      );
      selectedDimensionsByDomain[domain] = [];
      showItemsFlagByDomain[domain] = false;
    });

    console.log(
      "Dimension scores by domain: ",
      dimensionScoresDataSeriesByDomain,
    );

    console.log(
      "Items by domain and dimension: ",
      domainDimensionItemsDataSeriesRecord,
    );

    const dimensionsByDomain: Record<string, string[]> =
      createDomainDimensionsRecord(
        questionnairesForChart,
        dimensionScoresDataSeriesByDomain,
      );

    console.log("Dimensions by Domain: ", dimensionsByDomain);

    // const domainScoresDataSeries = chartData.yData.filter(
    //   (dataseries) =>
    //     dataseries.isDomainScore === true,
    // );
    // const dimensionScoresDataSeries = chartData.yData.filter(
    //   (dataseries) =>
    //     dataseries.isDimensionScore === true,
    // );
    // console.log("Scores: ", globalScoresDataSeries);
    // console.log("Dimension Scores: ", dimensionScoresDataSeries);

    // const itemsDataSeries = chartData.yData.filter(
    //   (dataseries) => dataseries.seriesType === ITEM_TYPES.item,
    // );
    // console.log("Items: ", itemsDataSeries);

    // const allScoresDataSeries =
    //   globalScoresDataSeries !== undefined
    //     ? [...globalScoresDataSeries, ...dimensionScoresDataSeries]
    //     : dimensionScoresDataSeries;
    // console.log("All Scores: ", allScoresDataSeries);

    // const chartDimensions = [
    //   ...new Set([
    //     ...itemDataSeries.map((item) => item.dimension),
    //     ...scoreDataSeries.map((score) => score.dimension),
    //   ]),
    // ];

    // Questionnaire Card
    const questionnaireCardData = createQuestionnaireCardData(
      questionnairesForChart,
    );
    console.log("Questionnaire Card Data: ", questionnaireCardData);
    const questionnaireNames = Object.keys(questionnaireCardData);
    const longestQuestionnaireName = questionnaireNames.reduce(
      (longest, current) =>
        current.length > longest.length ? current : longest,
      "",
    );
    const lengthOfLongestQuestionnaireName = longestQuestionnaireName.length;

    // Global Scores Line Chart
    const globalScoresLineChartData: Visualization.ChartData = {
      xData: chartData.xData,
      yData: globalScoresDataSeries,
    };
    // const scoreChartSubTitle = Array.from(
    //   new Set(
    //     Object.values(questionnaireResponsesForChart).map(
    //       (questionnaireResponse) => {
    //         return questionnaireResponse.questionnaire.name;
    //       },
    //     ),
    //   ),
    // );

    // Radar Chart
    // const mostRecentDomainScoresRadarData = createRadarData({
    //   xData: chartData.xData,
    //   yData: domainScoresDataSeriesByDomain});
    // console.log("Radar data: ", mostRecentDomainScoresRadarData)

    // Domain Dimension Mapping Sankey
    const domainsSankeyData = createDomainQuestionnaireNamesDimensionsRecord(
      dimensionScoresDataSeriesByDomain,
    );

    const domainQuestionnaireDimensionRecord =
      createDomainQuestionnaireNamesDimensionsRecord(
        dimensionScoresDataSeriesByDomain,
      );

    const domainDimensionQuestionnaireTuples =
      createDomainDimensionQuestionnaireTupleArray(
        dimensionScoresDataSeriesByDomain,
      );

    console.log(
      "Domain Questionnaire Dimension Record: ",
      domainQuestionnaireDimensionRecord,
    );
    console.log(
      "Domain Dimension Questionnaire Tuples: ",
      domainDimensionQuestionnaireTuples,
    );

    const domainDimensionWithQuestionnaireRecord =
      createDimensionWithQuestionnaireByDomainRecord(
        dimensionScoresDataSeriesByDomain,
      );
    console.log(
      "Domain Dimension With Questionnaire Record: ",
      domainDimensionWithQuestionnaireRecord,
    );

    // Heatmap
    // const heatmapDataByDomain: Record<string, Visualization.ChartData> =
    //   createHeatmapData(
    //     domainsForChart,
    //     chartData.yData,
    //     chartData.xData,
    //   );
    // console.log("Chart Data by Dimension: ", heatmapDataByDomain);

    // Table
    const tableDataByQuestionnaire: Record<string, Visualization.ChartData> =
      createTableData(questionnairesForChart, chartData);
    console.log("Table Data by Questionnaire: ", tableDataByQuestionnaire);

    // Header Cards
    // const resourceIdsWithIssues = dataIssues
    //   .map((issue) => issue.context.resourceId)
    //   .filter((id) => id !== undefined);
    // console.log("IDs of resources with issues: ", resourceIdsWithIssues);

    // const itemWarningsByQuestionnaireId = _.groupBy(
    //   dataIssues.filter(
    //     (issue) => issue.level === "warning" && issue.context.field !== undefined,
    //   ),
    //   (issue) => issue.context.resourceId,
    // );
    // console.log(
    //   "Item Warnings by Questionnaire ID: ",
    //   itemWarningsByQuestionnaireId,
    // );
    forwardErrorsToUser(dataIssues);

    // const periodOfObservations = calculatePeriodOfObservations(
    //   questionnaireResponses,
    // );

    // set variables
    // setDisplayedQuestionnaires(questionnairesForChart);
    // setDisplayedQuestionnaireResponses(questionnaireResponsesForChart);
    setDomainsForChart(domainsForChart);
    setDimensionsByDomain(dimensionsByDomain);
    setChartXData(chartData.xData);
    setGlobalScoresDataSeries(globalScoresDataSeries);
    setDomainScoresDataSeriesByDomain(domainScoresDataSeriesByDomain);
    setDimensionScoresDataSeriesByDomain(dimensionScoresDataSeriesByDomain);
    setItemDataSeriesByDomainAndDimension(domainDimensionItemsDataSeriesRecord);
    setLengthOfLongestQuestionnaireName(lengthOfLongestQuestionnaireName);
    setGlobalScoresLineChartData(globalScoresLineChartData);
    setQuestionnaireNamesByDate(questionnaireNamesByDate);
    setHeatmapDataByDomain(heatmapDataByDomain);
    setTableDataByQuestionnaire(tableDataByQuestionnaire);
    setItemWarningsByQuestionnaireId(itemWarningsByQuestionnaireId);
    setQuestionnaireCardData(questionnaireCardData);
    setDomainsSankeyData(domainsSankeyData);
    setSelectedDimensionsByDomain(selectedDimensionsByDomain);
    setShowItemsForDomain(showItemsFlagByDomain);
    setDomainDimensionQuestionnaireTuples(domainDimensionQuestionnaireTuples);
    setDomainQuestionnaireDimensionRecord(domainQuestionnaireDimensionRecord);
    setDimensionsWithQuestionnaireByDomain(
      domainDimensionWithQuestionnaireRecord,
    );
    // setRadarChartData(radarData);
    // setPeriodOfObservations(periodOfObservations);
    // setScoreChartSubTitle(scoreChartSubTitle);
    // setIdsOfResourcesWithIssues(resourceIdsWithIssues);
    setModalShown(true);
  }, [
    questionnaires,
    questionnaireResponses,
    dataIssues,
    // globalHealthDimensions,
    questionnairesReady,
    domains,
    selectedQuestionnaires,
    dateRange,
    selectedDates,
  ]);

  // Handlers

  const handleContinue = () => {
    setIsModalOpen(false);
  };

  const toggleShowItemsForDomain = (domain: string) => {
    setShowItemsForDomain((prev) => {
      return {
        ...prev,
        [domain]: !prev[domain],
      };
    });
    console.log("Toggled showItemsFlagByDomain: ", showItemsForDomain);
  };

  const toggleErrorDetails = () => {
    setShowErrors((prev) => !prev);
    console.log("Toggled showErrors: ", showErrors);
  };

  const selectAllDomains = (domains: string[]) => {
    // if (selectAllDomains) {
    //   setSelectedDomains([]);
    //   setSelectedDimensionsByDomain({});
    // } else {
    //   setSelectedDomains(domains);
    // }
    // if (!allDomainsSelected) {
    setSelectedDomains(domains);
    // }
    // setAllDomainsSelected((prev) => !prev);
  };

  const selectAllDimensionsForDomain = (
    domain: string,
    dimensions: string[],
  ) => {
    setSelectedDimensionsByDomain((prev) => {
      return {
        ...prev,
        [domain]: dimensions,
      };
    });
    console.log(
      "Selected dimensions by domain (all selected): ",
      selectedDimensionsByDomain,
    );
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
    console.log("Selected Questionnaires: ", selectedQuestionnaires);
  };

  const handleDateSelection = (date: string) => {
    setSelectedDates((prev) => {
      const index = prev.indexOf(date);
      if (index === -1) {
        return [...prev, date];
      } else {
        return prev.filter((d) => d !== date);
      }
    });
    console.log("Selected Dates: ", selectedDates);
  };

  const handleDomainSelection = (domain: string) => {
    setSelectedDomains((prev) => {
      const index = prev.indexOf(domain);
      if (index === -1) {
        return [...prev, domain];
      } else {
        return prev.filter((d) => d !== domain);
      }
    });
    console.log("Selected Domains: ", selectedDomains);
  };

  const handleDimensionSelection = (domain: string, dimension: string) => {
    setSelectedDimensionsByDomain((prev) => {
      const selectedDimensions = prev[domain] || [];
      const index = selectedDimensions.indexOf(dimension);
      if (index === -1) {
        return {
          ...prev,
          [domain]: [...selectedDimensions, dimension],
        };
      } else {
        return {
          ...prev,
          [domain]: selectedDimensions.filter((d) => d !== dimension),
        };
      }
    });
    console.log("Selected Dimensions by Domain: ", selectedDimensionsByDomain);
  };

  const toggleShowFilterOptions = () => {
    setShowFilterOptions((prev) => !prev);
  };

  const toggleShowErrors = () => {
    setShowErrors((prev) => !prev);
  };

  const handleRangeChange = (event: Event) => {
    if (event.type === "clear") {
      setDateRange({ start: "", end: "" });
      setDateValue("");
      return;
    }
    // Cast the target to access both value (start) and valueEnd (end)
    const target = event.target as HTMLInputElement;
    const cutPosition = target.value.indexOf("/");
    const start = target.value.substring(0, cutPosition);
    const end = target.value.substring(cutPosition + 1);
    console.log("Selected range: ", { start, end });
    setDateRange({
      start: start, // e.g., "2026-05-19"
      end: end, // e.g., "2026-05-26" (or empty string if not clicked yet)
    });
    setDateValue(target.value);
  };

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
        {/* <div
          className={`${isModalOpen ? "pointer-events-none select-none" : ""}`}
        > */}
        {/* <Header /> */}
        <main>
          <div className="tw:drawer tw:lg:drawer-open tw:drawer-end">
            <input
              id="filter-drawer"
              type="checkbox"
              className="tw:drawer-toggle"
            />
            <div className="tw:drawer-content">
              <div className="tw:max-w-screen tw:xl:max-w-9/10 tw:mx-auto tw:h-full tw:justify-center tw:px-6">
                {/* <div className="tw:flex tw:flex-col tw:md:flex-row tw:gap-8 tw:py-16 tw:justify-center tw:items-start">
                 */}

                {/* <div className="tw:card tw:lg:basis-1/3 tw:xl:basis-md tw:bg-base-100 tw:shadow-md">
                <div className="tw:card-body">
                  <h3 className="tw:card-title">Filter Options</h3>
                  <div>
                    <p>Questionnaires</p>
                  </div>
                  <div className="tw:flex tw:flex-wrap tw:gap-x-4 tw:gap-y-2 tw:justify-start">
                    {questionnaires.map((questionnaire) => (
                      <label key={questionnaire.id} className="tw:label tw:text-gray-900">
                        <input type="checkbox" checked={selectedQuestionnaires.includes(questionnaire.id)} onChange={() => handleQuestionnaireSelection(questionnaire.id)} className="tw:checkbox" />
                        {questionnaire.name}
                      </label>
                    ))}
                  </div>
                  <div>
                    <p>Dates</p>
                  </div>
                  <div>
                    <p>
                      Select single dates
                    </p>
                  </div>
                    <div className="tw:flex tw:flex-wrap tw:gap-x-4 tw:gap-y-2 tw:justify-start">
                      {allDatesOfQuestionnaireResponses.map((date) => (
                        <label key={date} className="tw:label tw:text-gray-900">
                          <input type="checkbox" checked={selectedDates.includes(date)} onChange={() => handleDateSelection(date)} className="tw:checkbox" />
                          {date}
                        </label>
                      ))}
                    </div>
                  <div>
                    <p>Or select a date range</p>
                    <DateRangePicker rangeHandler={handleRangeChange} dateValue={dateValue} range={dateRange}/>
                  </div>
                </div>
              </div> */}
                {/* </div> */}

                {/* <div className="tw:divider" /> */}
                {/* <h2 className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">
                      Dimension Domain Mapping
                    </h2>
            <div className="tw:flex tw:flex-col tw:md:flex-row tw:gap-8 tw:py-16 tw:justify-left tw:items-start">
               { questionnaires && domainsSankeyData && (
                Object.entries(domainsSankeyData).
                map(([domain, questionnaireDimensionRecord]) => (
                <DomainCard key={domain} domain={domain} dimensionsByQuestionnaireName={questionnaireDimensionRecord} />
                )))
                }
            </div> */}
                {/* <div className="tw:pt-4 tw:pb-8">
              <h2 className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333] tw:pt-8 tw:pb-6">
                Domains-to-Dimensions Mapping
              </h2>
              {dimensionsWithQuestionnaireByDomain && (
                <>
                <div className="tw:pb-4">
                  <Collapse 
                    title={"About this Diagram"} 
                    children={<p>This grid shows how {Object.keys(dimensionsWithQuestionnaireByDomain).length} domains (left) 
                        are mapped to their corresponding questionnaire dimensions (right).
                        <ul className="tw:list-disc tw:list-inside">
                          <li>Greek letters next to a dimension suffix indicate its source questionnaire.</li>
                          <li>The legend at the bottom defines which questionnaire matches each letter.</li>
                        </ul>
                        </p>} 
                      constrainWidth={true}
                        />
                  </div>
                  <div className="tw:py-4">
                      <MappingTable data={dimensionsWithQuestionnaireByDomain} />
                  </div>
                </>
              )}
            </div> */}
                <div className="tw:pt-4 tw:pb-8">
                  <h2 className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333] tw:pt-8 tw:pb-6">
                    Overview
                  </h2>
                  <div className="tw:flex tw:justify-start">
                    {questionnaireNamesByDate && (
                      <GridTable
                        data={questionnaireNamesByDate}
                        constrainWidth={true}
                      />
                    )}
                  </div>

                  {dataIssuesForUser.length > 0 && (
                    <>
                      <div className="tw:flex tw:flex-wrap tw:gap-4 tw:items-center tw:mx-4 tw:pt-4 tw:pb-2">
                        <div
                          role="alert"
                          className="tw:alert tw:alert-warning tw:alert-soft tw:border tw:border-amber-300 tw:rounded-md tw:max-w-md tw:py-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="tw:h-6 tw:w-6 tw:shrink-0 tw:stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <span>
                            Some Questionnaires could not be processed.
                          </span>
                        </div>

                        <button
                          className="tw:btn tw:btn-sm tw:rounded-md tw:py-4"
                          onClick={toggleShowErrors}
                        >
                          {showErrors ? "Hide Details" : "Show Details"}
                        </button>
                      </div>
                      {showErrors && (
                        <div className="tw:px-4">
                          {/* <div className="tw:card tw:card-border tw:border tw:border-gray-200 tw:bg-base-100 tw:max-w-2xl tw:md:w-2xl">
                         <div className="tw:card-body"> */}

                          <ErrorCard data={dataIssuesForUser} />

                          {/* </div>
                         </div> */}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="tw:pt-4 tw:pb-8">
                  <h2 className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333] tw:pt-8 tw:pb-6">
                    Charts
                  </h2>
                  {dimensionsWithQuestionnaireByDomain && (
                    <Collapse
                      title="Domain-to-Dimension Mapping Info"
                      children={
                        <>
                          <div className="tw:flex tw:justify-center tw:md:justify-start tw:pb-4">
                            <div
                              className="tw:tooltip tw:tooltip-top tw:md:tooltip-right tw:whitespace-normal tw:break-normal"
                              data-tip={`This grid shows how 
                                  ${Object.keys(dimensionsWithQuestionnaireByDomain).length} domains (left) 
                                  map to their corresponding questionnaire dimensions (right). 
                                  Greek letters indicate the source questionnaire for each dimension (see legend at the bottom).`}
                            >
                              <button className="tw:btn tw:btn-sm">
                                About this Diagram
                              </button>
                            </div>
                          </div>
                          <div className="tw:py-4">
                            <MappingTable
                              data={dimensionsWithQuestionnaireByDomain}
                            />
                          </div>
                        </>
                      }
                      constrainWidth={true}
                    />
                  )}
                  <label
                    htmlFor="filter-drawer"
                    className="tw:btn tw:btn-sm tw:drawer-button tw:mt-2 tw:lg:hidden"
                  >
                    <span>Filters</span>
                    <FontAwesomeIcon icon="fa-solid fa-filter" />
                  </label>
                </div>

                {/* <div className="tw:flex-1 tw:item-center tw:py-4"> */}

                {/* <div className="tw:col-span-15 tw:lg:col-span-6 tw:2xl:col-span-5">
                    {radarChartData && (
                      <>
                        <h2 className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333] tw:pt-8 tw:pb-4">
                          Health Indication
                        </h2>

                        <RadarChart
                          data={radarChartData}
                          dimensions={domains}
                        />
                      </>
                    )}
                  </div> */}
                <div className="tw:pt-4 tw:pb-8">
                  {/* <div className="tw:col-span-12 tw:lg:col-span-10 tw:lg:col-start-2 tw:2xl:col-span-8 tw:2xl:col-start-3"> */}
                  {globalScoresDataSeries.length > 0 && (
                    <>
                      <h2 className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333] tw:pt-8 tw:pb-6">
                        Global Health
                      </h2>
                      <div className="tw:flex tw:justify-center tw:md:justify-start tw:pb-4">
                        <div
                          className="tw:tooltip tw:tooltip-top tw:md:tooltip-right tw:whitespace-normal tw:break-normal"
                          data-tip={`This chart shows the progress over time of
                            those scores which represent global or overall
                            health of the patient. Negative scores are displayed as 0.`}
                        >
                          <button className="tw:btn tw:btn-sm">
                            About this Diagram
                          </button>
                        </div>
                      </div>
                      <div className="tw:flex tw:justify-start">
                        <LineChart
                          height={400}
                          data={{
                            xData: chartXData,
                            yData: globalScoresDataSeries,
                          }}
                          title={"Normalized Global Health Scores over Time"}
                          minMaxYLabels={["Worst Health", "Best Health"]}
                          titleOptions={singleLineChartOptions.title}
                          legendOptions={singleLineChartOptions.legend}
                          gridOptions={singleLineChartOptions.grid}
                          xAxisOptions={singleLineChartOptions.xAxis}
                          yAxisOptions={singleLineChartOptions.yAxis}
                          tooltipOptions={singleLineChartOptions.tooltip}
                          lineOption={lineChartSeriesOption}
                        />
                      </div>
                    </>
                  )}
                  {globalScoresDataSeries.length === 0 && (
                    <p className="tw:text-lg tw:text-center tw:text-[#333]">
                      No global health scores available
                    </p>
                  )}
                </div>
                <div className="tw:pt-4 tw:pb-8">
                  <h2 className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333] tw:pt-8 tw:pb-6">
                    Selected PROs by Domain
                  </h2>
                  <div>
                    <p>
                      Please select one or more domains to view the scores
                      belonging to them.
                    </p>
                  </div>
                  {/* <div className="tw:grid tw:grid-cols-6 tw:gap-8"> */}
                  <div className="tw:flex tw:flex-wrap tw:gap-4 tw:justify-start tw:py-4">
                    {domainsForChart.map(
                      (domain) =>
                        dimensionScoresDataSeriesByDomain[domain].length >
                          0 && (
                          <label
                            key={domain}
                            className="tw:label tw:text-gray-900"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDomains.includes(domain)}
                              onChange={() => handleDomainSelection(domain)}
                              className="tw:checkbox"
                            />
                            {domain}
                          </label>
                        ),
                    )}
                  </div>
                  {domainsForChart.length > 1 && (
                    <div className="tw:pb-2">
                      <button
                        className="tw:btn tw:btn-sm tw:mt-2"
                        onClick={() => selectAllDomains(domainsForChart)}
                      >
                        Select all
                      </button>
                    </div>
                  )}

                  {selectedDomains.map(
                    (domain) =>
                      dimensionScoresDataSeriesByDomain[domain].length > 0 && (
                        <React.Fragment key={domain}>
                          <h4 className="tw:text-lg tw:font-semibold tw:text-center tw:text-[#333] tw:pt-4 tw:pb-2">
                            {domain}
                          </h4>
                          <div className="tw:overflow-x-scroll">
                            <div className="tw:grid tw:grid-cols-5 tw:md:grid-cols-9 tw:xl:grid-cols-11 tw:2xl:grid-cols-13 tw:gap-0 tw:mt-2 tw:mb-8 tw:min-w-xs">
                              {dimensionScoresDataSeriesByDomain[domain].map(
                                (dataSeries, index) => (
                                  <React.Fragment key={dataSeries.id}>
                                    {/* cell with y axis */}

                                    <div
                                      className={`tw:col-span-1 
                              ${index % 2 === 1 ? "tw:md:hidden" : ""}`}
                                    >
                                      <LineChart
                                        data={{
                                          xData: [""],
                                          yData: [createPseudoDataSeries(0)],
                                        }}
                                        height={100}
                                        minMaxYLabels={["Worst", "Best"]}
                                        minMaxYValues={[-0.15, 1.55]}
                                        minMaxYValuesPosition={[0, 1]}
                                        titleOptions={
                                          justYAxisLineChartOptions.title
                                        }
                                        legendOptions={
                                          justYAxisLineChartOptions.legend
                                        }
                                        gridOptions={
                                          justYAxisLineChartOptions.grid
                                        }
                                        xAxisOptions={
                                          justYAxisLineChartOptions.xAxis
                                        }
                                        yAxisOptions={
                                          justYAxisLineChartOptions.yAxis
                                        }
                                        tooltipOptions={
                                          justYAxisLineChartOptions.tooltip
                                        }
                                      />
                                    </div>

                                    <div
                                      className={`tw:col-span-4 tw:md:col-span-4 tw:xl:col-span-5 tw:2xl:col-span-6
                                      ${index % 2 === 0 ? "tw:col-start-2 tw:md:col-start-2 tw:xl:col-start-2 tw:2xl:col-start-2" : ""} 
                                      tw:border-gray-200 tw:border-b tw:border-l tw:border-r
                                      ${index % 2 === 0 && dimensionScoresDataSeriesByDomain[domain].length > 1 ? "tw:md:border-r-0" : ""}
                                      ${index < 1 ? "tw:border-t" : ""} 
                                      ${index === 1 ? "tw:md:border-t" : ""} 
                                    `}
                                    >
                                      {/* cell with dimension score */}
                                      <LineChart
                                        key={domain + "-" + dataSeries.id}
                                        data={{
                                          xData: chartXData,
                                          yData: [dataSeries],
                                        }}
                                        // title={domain}
                                        height={100}
                                        minMaxYValues={[-0.15, 1.55]}
                                        minMaxYValuesPosition={[0, 1]}
                                        titleOptions={
                                          groupedLineChartOptions.title
                                        }
                                        legendOptions={
                                          groupedLineChartOptions.legend
                                        }
                                        gridOptions={
                                          groupedLineChartOptions.grid
                                        }
                                        xAxisOptions={
                                          groupedLineChartOptions.xAxis
                                        }
                                        yAxisOptions={
                                          groupedLineChartOptions.yAxis
                                        }
                                        tooltipOptions={
                                          groupedLineChartOptions.tooltip
                                        }
                                        lineOption={
                                          groupedLineChartSeriesOption
                                        }
                                      />
                                    </div>
                                  </React.Fragment>
                                ),
                              )}
                              {dimensionScoresDataSeriesByDomain[domain]
                                .length > 0 &&
                                dimensionScoresDataSeriesByDomain[domain]
                                  .length %
                                  2 ===
                                  1 && (
                                  <div
                                    className={`tw:col-span-4 tw:md:col-span-4 tw:xl:col-span-5 tw:2xl:col-span-6
                                    ${dimensionScoresDataSeriesByDomain[domain].length > 1 ? "tw:border-b tw:border-l tw:border-gray-200 tw:border-r" : ""} 
                                    tw:hidden tw:md:block`}
                                  >
                                    {/* empty data cell if number of dimensions is odd */}
                                    <LineChart
                                      data={{
                                        xData: chartXData,
                                        yData: [
                                          createPseudoDataSeries(
                                            chartXData.length,
                                          ),
                                        ],
                                      }}
                                      height={100}
                                      titleOptions={emptyLineChartOptions.title}
                                      legendOptions={
                                        emptyLineChartOptions.legend
                                      }
                                      gridOptions={emptyLineChartOptions.grid}
                                      xAxisOptions={emptyLineChartOptions.xAxis}
                                      yAxisOptions={emptyLineChartOptions.yAxis}
                                      tooltipOptions={
                                        emptyLineChartOptions.tooltip
                                      }
                                    />
                                  </div>
                                )}
                              <div className="tw:col-span-4 tw:col-start-2 tw:md:col-span-4 tw:xl:col-span-5 tw:2xl:col-span-6 tw:md:col-start-2 tw:xl:col-start-2 tw:2xl:col-start-2">
                                {/* left cell with x axis*/}
                                <LineChart
                                  data={{
                                    xData: chartXData,
                                    yData: [
                                      createPseudoDataSeries(chartXData.length),
                                    ],
                                  }}
                                  height={30}
                                  titleOptions={justXAxisLineChartOptions.title}
                                  legendOptions={
                                    justXAxisLineChartOptions.legend
                                  }
                                  gridOptions={justXAxisLineChartOptions.grid}
                                  xAxisOptions={justXAxisLineChartOptions.xAxis}
                                  yAxisOptions={justXAxisLineChartOptions.yAxis}
                                  tooltipOptions={
                                    justXAxisLineChartOptions.tooltip
                                  }
                                />
                              </div>
                              {dimensionScoresDataSeriesByDomain[domain]
                                .length > 1 && (
                                <div
                                  className={`tw:col-span-4 tw:md:col-span-4 tw:xl:col-span-5 tw:2xl:col-span-6 tw:hidden tw:md:block`}
                                >
                                  {/* right cell with x axis */}
                                  <LineChart
                                    data={{
                                      xData: chartXData,
                                      yData: [
                                        createPseudoDataSeries(
                                          chartXData.length,
                                        ),
                                      ],
                                    }}
                                    height={30}
                                    titleOptions={
                                      justXAxisLineChartOptions.title
                                    }
                                    legendOptions={
                                      justXAxisLineChartOptions.legend
                                    }
                                    gridOptions={justXAxisLineChartOptions.grid}
                                    xAxisOptions={
                                      justXAxisLineChartOptions.xAxis
                                    }
                                    yAxisOptions={
                                      justXAxisLineChartOptions.yAxis
                                    }
                                    tooltipOptions={
                                      justXAxisLineChartOptions.tooltip
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="tw:pl-8 tw:pb-4">
                            <div className="tw:pb-2">
                              <button
                                className="tw:btn tw:btn-sm tw:my-2"
                                onClick={() => toggleShowItemsForDomain(domain)}
                              >
                                {showItemsForDomain[domain]
                                  ? "Hide Items"
                                  : "Show Items"}
                              </button>
                            </div>
                            {showItemsForDomain[domain] && (
                              <React.Fragment>
                                <div className="tw:ml-0 tw:pl-4 tw:pr-2 tw:py-2 tw:border tw:border-gray-200">
                                  <div>
                                    <p>
                                      Please select one or more dimensions to
                                      view the items belonging to them.
                                    </p>
                                  </div>
                                  <div className="tw:flex tw:flex-wrap tw:gap-4 tw:justify-start tw:py-4">
                                    {dimensionsByDomain[domain].map(
                                      (dimension) =>
                                        itemDataSeriesByDomainAndDimension[
                                          domain
                                        ][dimension] !== undefined && (
                                          <label
                                            key={`${domain}: ${dimension}`}
                                            className="tw:label tw:text-gray-900"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={selectedDimensionsByDomain[
                                                domain
                                              ].includes(dimension)}
                                              onChange={() =>
                                                handleDimensionSelection(
                                                  domain,
                                                  dimension,
                                                )
                                              }
                                              className="tw:checkbox"
                                            />
                                            {dimension}
                                          </label>
                                        ),
                                    )}
                                  </div>
                                  {dimensionsByDomain[domain].length > 1 && (
                                    <div className="tw:pb-4">
                                      <button
                                        className="tw:btn tw:btn-sm tw:mt-2"
                                        onClick={() =>
                                          selectAllDimensionsForDomain(
                                            domain,
                                            dimensionsByDomain[domain],
                                          )
                                        }
                                      >
                                        Select all
                                      </button>
                                    </div>
                                  )}
                                  {selectedDimensionsByDomain[domain].map(
                                    (dimension) =>
                                      itemDataSeriesByDomainAndDimension[
                                        domain
                                      ][dimension] !== undefined &&
                                      itemDataSeriesByDomainAndDimension[
                                        domain
                                      ][dimension].length > 0 && (
                                        <React.Fragment
                                          key={`${domain}: ${dimension}`}
                                        >
                                          <h5 className="tw:text-md tw:font-semibold tw:text-left tw:text-[#333] tw:pt-2 tw:pb-2">
                                            {dimension}
                                          </h5>
                                          <div
                                            className={`tw:w-full tw:overflow-x-scroll
                                     ${chartXData.length < 2 ? "tw:max-w-md" : ""}
                                      ${chartXData.length >= 2 && chartXData.length < 4 ? "tw:max-w-lg" : ""}
                                      ${chartXData.length >= 4 && chartXData.length < 6 ? "tw:max-w-2xl" : ""}
                                      ${chartXData.length >= 6 && chartXData.length < 8 ? "tw:max-w-4xl" : ""}
                                      ${chartXData.length >= 8 && chartXData.length < 10 ? "tw:max-w-6xl" : ""}
                                      ${chartXData.length >= 10 && chartXData.length < 12 ? "tw:max-w-7xl" : ""}                                     
                                      `}
                                          >
                                            <div className="tw:grid tw:grid-cols-4 tw:md:grid-cols-6 tw:xl:grid-cols-7 tw:2xl:grid-cols-8 tw:gap-0 tw:mt-2 tw:mb-8 tw:min-w-xs">
                                              {itemDataSeriesByDomainAndDimension[
                                                domain
                                              ][dimension].map(
                                                (dataSeries, index) => (
                                                  <React.Fragment
                                                    key={dataSeries.id}
                                                  >
                                                    <div className="tw:col-span-1 tw:flex tw:items-center tw:justify-center">
                                                      <div className="tw:text-xs tw:break-normal">
                                                        {dataSeries.shortName}
                                                      </div>
                                                    </div>
                                                    <div
                                                      className={`tw:col-span-3 tw:md:col-span-5 tw:xl:col-span-6 tw:2xl:col-span-7 tw:col-start-2
                                                tw:border-gray-200 tw:border-b tw:border-l tw:border-r
                                                ${index < 1 ? "tw:border-t" : ""} 
                                              `}
                                                    >
                                                      {/* cell with dimension score */}
                                                      <LineChart
                                                        key={
                                                          domain +
                                                          "-" +
                                                          dataSeries.id
                                                        }
                                                        data={{
                                                          xData: chartXData,
                                                          yData: [dataSeries],
                                                        }}
                                                        // title={domain}
                                                        height={40}
                                                        minMaxYValues={[
                                                          -0.12, 1.12,
                                                        ]}
                                                        //minMaxYValuesPosition={[0, 1]}
                                                        titleOptions={
                                                          groupedLineChartOptions.title
                                                        }
                                                        legendOptions={
                                                          emptyLineChartOptions.legend
                                                        }
                                                        gridOptions={
                                                          groupedLineChartOptions.grid
                                                        }
                                                        xAxisOptions={
                                                          groupedLineChartOptions.xAxis
                                                        }
                                                        yAxisOptions={
                                                          groupedLineChartOptions.yAxis
                                                        }
                                                        tooltipOptions={
                                                          groupedLineChartOptions.tooltip
                                                        }
                                                        lineOption={
                                                          groupedLineChartSeriesOption
                                                        }
                                                      />
                                                    </div>
                                                  </React.Fragment>
                                                ),
                                              )}
                                              {/* empty data cell if number of dimensions is odd */}
                                              {/* {itemDataSeriesByDomainAndDimension[domain][dimension].length >
                                        0 &&
                                        itemDataSeriesByDomainAndDimension[domain][dimension].length %
                                          2 ===
                                          1 && (
                                          <div
                                            className={`tw:col-span-4 tw:md:col-span-8 tw:xl:col-span-10 tw:2xl:col-span-12
                                              ${itemDataSeriesByDomainAndDimension[domain][dimension].length > 1 ? "tw:border-b tw:border-l tw:border-gray-200 tw:border-r" : ""} 
                                              tw:hidden tw:md:block`}
                                          >
                                            
                                            <LineChart
                                              data={{
                                                xData: chartXData,
                                                yData: [
                                                  createPseudoDataSeries(
                                                    chartXData.length,
                                                  ),
                                                ],
                                              }}
                                              height={40}
                                              titleOptions={emptyLineChartOptions.title}
                                              legendOptions={emptyLineChartOptions.legend}
                                              gridOptions={emptyLineChartOptions.grid}
                                              xAxisOptions={emptyLineChartOptions.xAxis}
                                              yAxisOptions={emptyLineChartOptions.yAxis}
                                              tooltipOptions={
                                                emptyLineChartOptions.tooltip
                                              }
                                            />
                                          </div>
                                        )} */}
                                              <div className="tw:col-span-3 tw:col-start-2 tw:md:col-span-5 tw:xl:col-span-6 tw:2xl:col-span-7 tw:md:col-start-2 tw:xl:col-start-2 tw:2xl:col-start-2">
                                                {/* left cell with x axis*/}
                                                <LineChart
                                                  data={{
                                                    xData: chartXData,
                                                    yData: [
                                                      createPseudoDataSeries(
                                                        chartXData.length,
                                                      ),
                                                    ],
                                                  }}
                                                  height={30}
                                                  titleOptions={
                                                    justXAxisLineChartOptions.title
                                                  }
                                                  legendOptions={
                                                    justXAxisLineChartOptions.legend
                                                  }
                                                  gridOptions={
                                                    justXAxisLineChartOptions.grid
                                                  }
                                                  xAxisOptions={
                                                    justXAxisLineChartOptions.xAxis
                                                  }
                                                  yAxisOptions={
                                                    justXAxisLineChartOptions.yAxis
                                                  }
                                                  tooltipOptions={
                                                    justXAxisLineChartOptions.tooltip
                                                  }
                                                />
                                              </div>
                                              {/* right cell with x axis */}
                                              {/* {itemDataSeriesByDomainAndDimension[domain][dimension].length >
                                        1 && (
                                        <div
                                          className={`tw:col-span-4 tw:md:col-span-8 tw:xl:col-span-10 tw:2xl:col-span-12 tw:hidden tw:md:block`}
                                        >
                                          <LineChart
                                            data={{
                                              xData: chartXData,
                                              yData: [
                                                createPseudoDataSeries(chartXData.length),
                                              ],
                                            }}
                                            height={30}
                                            titleOptions={justXAxisLineChartOptions.title}
                                            legendOptions={
                                              justXAxisLineChartOptions.legend
                                            }
                                            gridOptions={justXAxisLineChartOptions.grid}
                                            xAxisOptions={justXAxisLineChartOptions.xAxis}
                                            yAxisOptions={justXAxisLineChartOptions.yAxis}
                                            tooltipOptions={
                                              justXAxisLineChartOptions.tooltip
                                            }
                                          />
                                        </div> 
                                      )} */}
                                            </div>
                                          </div>
                                        </React.Fragment>
                                      ),
                                  )}
                                </div>
                              </React.Fragment>
                            )}
                          </div>
                        </React.Fragment>
                      ),
                  )}
                </div>
                <div className="tw:pt-4 tw:pb-8">
                  <h2 className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333] tw:pt-8 tw:pb-6">
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

                  <div className="tw:join tw:join-vertical tw:bg-base-100 tw:flex tw:justify-center">
                    {questionnaires &&
                      tableDataByQuestionnaire &&
                      questionnaires.map((questionnaire) => (
                        <React.Fragment key={questionnaire.id}>
                          {tableDataByQuestionnaire[questionnaire.id] !==
                            undefined && (
                            <Collapse
                              title={questionnaire.name}
                              children={
                                <SimpleDataTable
                                  data={
                                    tableDataByQuestionnaire[questionnaire.id]
                                  }
                                  // domains={domains}
                                  // errors={
                                  //   itemWarningsByQuestionnaireId[questionnaire.id] !==
                                  //   undefined
                                  //     ? itemWarningsByQuestionnaireId[questionnaire.id]
                                  //     : undefined
                                  // }
                                />
                              }
                            />
                          )}
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
              </div>
            </div>
            <div className="tw:drawer-side">
              <label
                htmlFor="filter-drawer"
                aria-label="close sidebar"
                className="tw:drawer-overlay"
              ></label>
              <ul className="tw:menu tw:bg-base-200 tw:min-h-full tw:w-80 tw:p-4">
                <div className="tw:text tw:font-semibold tw:text-lg tw:pt-4 tw:pb-4">
                  Filter Questionnaires
                </div>

                <FilterOptionsDisplay
                  questionnaires={questionnaires}
                  selectedQuestionnaires={selectedQuestionnaires}
                  questionnaireSelectionHandler={handleQuestionnaireSelection}
                  dates={allDatesOfQuestionnaireResponses}
                  selectedDates={selectedDates}
                  dateSelectionHandler={handleDateSelection}
                  datePickerValue={dateValue}
                  datePickerRange={dateRange}
                  rangeSelectionHandler={handleRangeChange}
                />
              </ul>
            </div>
          </div>
        </main>
        {/* <Footer /> */}
        {/* </div> */}
      </div>
      {/* {dataIssues.length > 0 && (
        <ErrorModal
          data={[...new Set(dataIssues)]}
          open={isModalOpen}
          onClose={handleContinue}
        />
      )} */}
    </div>
  );
}

export default App;
