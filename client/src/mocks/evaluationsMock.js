export const ASSESSMENT_TEMPLATES = [
  {
    id: "phq-9",
    name: "PHQ-9",
    description: "Patient Health Questionnaire for Depression",
    type: "depression",
    questions: [
      { id: "q1", text: "Little interest or pleasure in doing things" },
      { id: "q2", text: "Feeling down, depressed, or hopeless" },
      { id: "q3", text: "Trouble falling or staying asleep, or sleeping too much" },
      { id: "q4", text: "Feeling tired or having little energy" },
      { id: "q5", text: "Poor appetite or overeating" },
      { id: "q6", text: "Feeling bad about yourself - or that you are a failure or have let yourself or your family down" },
      { id: "q7", text: "Trouble concentrating on things, such as reading the newspaper or watching television" },
      { id: "q8", text: "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual" },
      { id: "q9", text: "Thoughts that you would be better off dead, or of hurting yourself" }
    ],
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "gad-7",
    name: "GAD-7",
    description: "General Anxiety Disorder-7",
    type: "anxiety",
    questions: [
      { id: "q1", text: "Feeling nervous, anxious or on edge" },
      { id: "q2", text: "Not being able to stop or control worrying" },
      { id: "q3", text: "Worrying too much about different things" },
      { id: "q4", text: "Trouble relaxing" },
      { id: "q5", text: "Being so restless that it is hard to sit still" },
      { id: "q6", text: "Becoming easily annoyed or irritable" },
      { id: "q7", text: "Feeling afraid as if something awful might happen" }
    ],
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "pcl-5",
    name: "PCL-5",
    description: "PTSD Checklist for DSM-5",
    type: "ptsd",
    questions: [
      { id: "q1", text: "Repeated, disturbing, and unwanted memories of the stressful experience?" },
      { id: "q2", text: "Repeated, disturbing dreams of the stressful experience?" },
      { id: "q3", text: "Suddenly feeling or acting as if the stressful experience were actually happening again?" },
      { id: "q4", text: "Feeling very upset when something reminded you of the stressful experience?" },
      { id: "q5", text: "Having strong physical reactions when something reminded you of the stressful experience?" }
    ],
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" }
    ]
  }
];

export const MOCK_PATIENT_ASSESSMENTS = [
  {
    id: "a1",
    templateId: "phq-9",
    patientId: "p1",
    status: "COMPLETED",
    score: 18,
    severity: "Moderately Severe",
    riskFlag: true,
    completedAt: "2026-05-10T10:00:00Z"
  },
  {
    id: "a2",
    templateId: "phq-9",
    patientId: "p1",
    status: "COMPLETED",
    score: 14,
    severity: "Moderate",
    riskFlag: false,
    completedAt: "2026-06-15T10:00:00Z"
  },
  {
    id: "a3",
    templateId: "phq-9",
    patientId: "p1",
    status: "COMPLETED",
    score: 10,
    severity: "Moderate",
    riskFlag: false,
    completedAt: "2026-07-20T10:00:00Z"
  },
  {
    id: "a4",
    templateId: "phq-9",
    patientId: "p1",
    status: "COMPLETED",
    score: 5,
    severity: "Mild",
    riskFlag: false,
    completedAt: "2026-08-10T10:00:00Z"
  },
  {
    id: "a5",
    templateId: "gad-7",
    patientId: "p1",
    status: "SENT",
    sentAt: "2026-08-18T09:00:00Z"
  }
];
