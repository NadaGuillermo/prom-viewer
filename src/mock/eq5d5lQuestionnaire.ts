import type { PromData } from "@data/mapping/types";

const eq5d5lQuestionnaire: PromData.Questionnaire = {
  id: "eq5d-5l",
  name: "EQ-5D-5L",
  url: "https://example.com/eq5d-5l",
  description: "A health-related quality of life questionnaire",
  items: {
    mobility: {
      linkId: "mobility",
      text: "Mobility",
      answerOptions: [
        { value: 1, label: "I have no problems in walking about" },
        { value: 2, label: "I have slight problems in walking about" },
        { value: 3, label: "I have moderate problems in walking about" },
        { value: 4, label: "I have severe problems in walking about" },
        { value: 5, label: "I am unable to walk about" },
      ],
      dimension: "Physical Function",
    },
    "self-care": {
      linkId: "self-care",
      text: "Self-care",
      answerOptions: [
        { value: 1, label: "I have no problems with self-care" },
        {
          value: 2,
          label: "I have slight problems washing or dressing myself",
        },
        {
          value: 3,
          label: "I have moderate problems washing or dressing myself",
        },
        {
          value: 4,
          label: "I have severe problems washing or dressing myself",
        },
        { value: 5, label: "I am unable to wash or dress myself" },
      ],
      dimension: "Physical Function",
    },
    "usual-activities": {
      linkId: "usual-activities",
      text: "Usual activities",
      answerOptions: [
        {
          value: 1,
          label: "I have no problems with performing my usual activities",
        },
        {
          value: 2,
          label: "I have slight problems with performing my usual activities",
        },
        {
          value: 3,
          label: "I have moderate problems with performing my usual activities",
        },
        {
          value: 4,
          label: "I have severe problems with performing my usual activities",
        },
        { value: 5, label: "I am unable to perform my usual activities" },
      ],
      dimension: "Physical Function",
    },
    "pain-discomfort": {
      linkId: "pain-discomfort",
      text: "Pain/Discomfort",
      answerOptions: [
        { value: 1, label: "I have no pain or discomfort" },
        { value: 2, label: "I have slight pain or discomfort" },
        { value: 3, label: "I have moderate pain or discomfort" },
        { value: 4, label: "I have severe pain or discomfort" },
        { value: 5, label: "I have extreme pain or discomfort" },
      ],
      dimension: "Symptoms",
    },
    "anxiety-depression": {
      linkId: "anxiety-depression",
      text: "Anxiety/Depression",
      answerOptions: [
        { value: 1, label: "I am not anxious or depressed" },
        { value: 2, label: "I am slightly anxious or depressed" },
        { value: 3, label: "I am moderately anxious or depressed" },
        { value: 4, label: "I am severely anxious or depressed" },
        { value: 5, label: "I am extremely anxious or depressed" },
      ],
      dimension: "Emotional Well-being",
    },
    vas: {
      linkId: "vas",
      text: "VAS",
      range: [0, 100],
      scoreHealthCorrelation: "increase",
      dimension: "Overall Health/Quality of Life",
    },
    "eq-5d-index": {
      linkId: "eq-5d-index",
      text: "EQ-5D Index",
      dimension: "Overall Health/Quality of Life",
      range: [-0.594, 1],
      scoreHealthCorrelation: "increase",
    },
  },
};

export default eq5d5lQuestionnaire;
