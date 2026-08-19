import { ASSESSMENT_TEMPLATES, MOCK_PATIENT_ASSESSMENTS } from '../mocks/evaluationsMock.js';

let assessments = [...MOCK_PATIENT_ASSESSMENTS];

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getTemplates = async () => {
  await delay();
  return ASSESSMENT_TEMPLATES;
};

export const getPatientAssessments = async (patientId) => {
  await delay();
  return assessments.filter(a => a.patientId === patientId);
};

export const sendAssessment = async (patientId, templateId) => {
  await delay();
  const newAssessment = {
    id: `a${Date.now()}`,
    templateId,
    patientId,
    status: "SENT",
    sentAt: new Date().toISOString()
  };
  assessments.push(newAssessment);
  return newAssessment;
};

const calculateSeverity = (templateId, score) => {
  if (templateId === "phq-9") {
    if (score <= 4) return "Minimal";
    if (score <= 9) return "Mild";
    if (score <= 14) return "Moderate";
    if (score <= 19) return "Moderately Severe";
    return "Severe";
  } else if (templateId === "gad-7") {
    if (score <= 4) return "Minimal";
    if (score <= 9) return "Mild";
    if (score <= 14) return "Moderate";
    return "Severe";
  }
  return "Unknown";
};

export const submitAssessment = async (assessmentId, responses) => {
  await delay();
  const index = assessments.findIndex(a => a.id === assessmentId);
  if (index === -1) throw new Error("Assessment not found");
  
  const assessment = assessments[index];
  
  let score = 0;
  let riskFlag = false;

  responses.forEach(r => {
    score += r.value;
    if (assessment.templateId === "phq-9" && r.questionId === "q9" && r.value > 0) {
      riskFlag = true;
    }
  });

  const updatedAssessment = {
    ...assessment,
    status: "COMPLETED",
    score,
    severity: calculateSeverity(assessment.templateId, score),
    riskFlag,
    completedAt: new Date().toISOString(),
    responses
  };

  assessments[index] = updatedAssessment;
  
  return updatedAssessment;
};
