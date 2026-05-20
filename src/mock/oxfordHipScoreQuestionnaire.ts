import type { PromData } from "@utils/mapping/types";

const oxfordHipScoreQuestionnaire: PromData.Questionnaire = {
  id: "ox-hip-score",
  name: "Oxford Hip Score",
  url: "https://example.com/ox-hip-score",
  description: "A health-related quality of life questionnaire",
  items: {
    pain: {
      linkId: "pain",
      text: "Pain",
      answerOptions: [
        { value: 4, label: "None" },
        { value: 3, label: "Very mild" },
        { value: 2, label: "Mild" },
        { value: 1, label: "Moderate" },
        { value: 0, label: "Severe" },
      ],
      dimension: "Symptoms",
    },
    "night-pain": {
      linkId: "night-pain",
      text: "Night pain",
      answerOptions: [
        { value: 4, label: "No nights" },
        { value: 3, label: "Only 1 or 2 nights" },
        { value: 2, label: "Some nights" },
        { value: 1, label: "Most nights" },
        { value: 0, label: "Every night" },
      ],
      dimension: "Symptoms",
    },
    "sudden-pain": {
      linkId: "sudden-pain",
      text: "Sudden pain",
      answerOptions: [
        { value: 4, label: "No days" },
        { value: 3, label: "Only 1 or 2 days" },
        { value: 2, label: "Some days" },
        { value: 1, label: "Most days" },
        { value: 0, label: "Every day" },
      ],
      dimension: "Symptoms",
    },
    limping: {
      linkId: "limping",
      text: "Limping",
      answerOptions: [
        { value: 4, label: "Rarely/Never" },
        { value: 3, label: "Sometimes or just at first" },
        { value: 2, label: "Often, not just at first" },
        { value: 1, label: "Most of the time" },
        { value: 0, label: "All of the time" },
      ],
      dimension: "Symptoms",
    },
    walking: {
      linkId: "walking",
      text: "Walking",
      answerOptions: [
        { value: 4, label: "No pain/30 minutes or more" },
        { value: 3, label: "16 to 30 minutes" },
        { value: 2, label: "5 to 15 minutes" },
        { value: 1, label: "Around the house only" },
        { value: 0, label: "Not at all" },
      ],
      dimension: "Physical Function",
    },
    stairs: {
      linkId: "stairs",
      text: "Stairs",
      answerOptions: [
        { value: 4, label: "Yes, easily" },
        { value: 3, label: "With little difficulty" },
        { value: 2, label: "With moderate difficulty" },
        { value: 1, label: "With extreme difficulty" },
        { value: 0, label: "No, impossible" },
      ],
      dimension: "Physical Function",
    },
    dressing: {
      linkId: "dressing",
      text: "Dressing",
      answerOptions: [
        { value: 4, label: "Yes, easily" },
        { value: 3, label: "With little difficulty" },
        { value: 2, label: "With moderate difficulty" },
        { value: 1, label: "With extreme difficulty" },
        { value: 0, label: "No, impossible" },
      ],
      dimension: "Physical Function",
    },
    standing: {
      linkId: "standing",
      text: "Standing",
      answerOptions: [
        { value: 4, label: "Not at all painful" },
        { value: 3, label: "Slightly painful" },
        { value: 2, label: "Moderately painful" },
        { value: 1, label: "Very painful" },
        { value: 0, label: "Unbearable" },
      ],
      dimension: "Physical Function",
    },
    transport: {
      linkId: "transport",
      text: "Transport",
      answerOptions: [
        { value: 4, label: "No trouble at all" },
        { value: 3, label: "Very little trouble" },
        { value: 2, label: "Moderate trouble" },
        { value: 1, label: "Extreme difficulty" },
        { value: 0, label: "Impossible to do" },
      ],
      dimension: "Physical Function",
    },
    washing: {
      linkId: "washing",
      text: "Washing",
      answerOptions: [
        { value: 4, label: "No trouble at all" },
        { value: 3, label: "Very little trouble" },
        { value: 2, label: "Moderate trouble" },
        { value: 1, label: "Extreme difficulty" },
        { value: 0, label: "Impossible to do" },
      ],
      dimension: "Physical Function",
    },
    shopping: {
      linkId: "shopping",
      text: "Shopping",
      answerOptions: [
        { value: 4, label: "Yes, easily" },
        { value: 3, label: "With little difficulty" },
        { value: 2, label: "With moderate difficulty" },
        { value: 1, label: "With extreme difficulty" },
        { value: 0, label: "No, impossible" },
      ],
      dimension: "Physical Function",
    },
    work: {
      linkId: "work",
      text: "Work",
      answerOptions: [
        { value: 4, label: "Not at all" },
        { value: 3, label: "A little bit" },
        { value: 2, label: "Moderately" },
        { value: 1, label: "Greatly" },
        { value: 0, label: "Totally" },
      ],
      dimension: "Physical Function",
    },
    "ox-hip-score": {
      linkId: "ox-hip-score",
      text: "Oxford Hip Score",
      dimension: "Overall Health/Quality of Life",
      range: [0, 48],
      scoreHealthCorrelation: "increase",
      // referenceQuestionnaireItems: ["pain", "night-pain", "sudden-pain", "limping", "walking", "stairs", "dressing", "standing", "transport", "washing", "shopping", "work"]
    },
  },
};

export default oxfordHipScoreQuestionnaire;
