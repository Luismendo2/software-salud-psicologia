/* ==========================================================================
   communicationService.js — Servicio para Comunicación y Seguimiento (008)
   ========================================================================== */

import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_THERAPEUTIC_TASKS,
  MOCK_SATISFACTION_SURVEYS,
} from '../mocks/communicationMock';

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

let conversations = [...MOCK_CONVERSATIONS];
let messages = JSON.parse(JSON.stringify(MOCK_MESSAGES));
let tasks = [...MOCK_THERAPEUTIC_TASKS];
let surveys = [...MOCK_SATISFACTION_SURVEYS];

/* ── Mensajería ── */

export async function getConversations(userId) {
  await delay();
  return conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
}

export async function getMessages(conversationId, after = null) {
  await delay(200);
  let msgs = messages[conversationId] || [];
  if (after) {
    msgs = msgs.filter(m => new Date(m.createdAt) > new Date(after));
  }
  return msgs;
}

export async function sendMessage(conversationId, senderId, senderName, content) {
  await delay(300);
  const newMsg = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId,
    senderName,
    content,
    readAt: null,
    createdAt: new Date().toISOString(),
  };
  if (!messages[conversationId]) messages[conversationId] = [];
  messages[conversationId].push(newMsg);

  // Actualizar lastMessageAt de la conversación
  const conv = conversations.find(c => c.id === conversationId);
  if (conv) conv.lastMessageAt = newMsg.createdAt;

  return newMsg;
}

export async function markMessagesRead(conversationId, userId) {
  await delay(200);
  const msgs = messages[conversationId] || [];
  const now = new Date().toISOString();
  msgs.forEach(m => {
    if (m.senderId !== userId && !m.readAt) {
      m.readAt = now;
    }
  });
  // Resetear unread
  const conv = conversations.find(c => c.id === conversationId);
  if (conv) conv.unreadCount = 0;
}

/* ── Tareas Terapéuticas ── */

export async function getTasks(filters = {}) {
  await delay();
  let result = [...tasks];
  if (filters.patientId) result = result.filter(t => t.patientId === filters.patientId);
  if (filters.psychologistId) result = result.filter(t => t.psychologistId === filters.psychologistId);
  if (filters.status) result = result.filter(t => t.status === filters.status);
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getPatientTasks(patientId) {
  await delay();
  return tasks
    .filter(t => t.patientId === patientId)
    .sort((a, b) => {
      // Pendientes primero
      const order = { ASSIGNED: 0, IN_PROGRESS: 1, OVERDUE: 2, COMPLETED: 3 };
      return (order[a.status] ?? 4) - (order[b.status] ?? 4);
    });
}

export async function createTask({ patientId, patientName, psychologistId, title, description, dueDate }) {
  await delay(500);
  const newTask = {
    id: `task-${Date.now()}`,
    patientId,
    patientName,
    psychologistId,
    title,
    description,
    dueDate,
    status: 'ASSIGNED',
    response: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  tasks.unshift(newTask);
  return newTask;
}

export async function respondToTask(taskId, response) {
  await delay(500);
  const task = tasks.find(t => t.id === taskId);
  if (!task) throw new Error('Tarea no encontrada');
  task.status = 'COMPLETED';
  task.response = response;
  task.completedAt = new Date().toISOString();
  return task;
}

/* ── Encuestas de Satisfacción ── */

export async function getSurveys(filters = {}) {
  await delay();
  let result = surveys.filter(s => s.submittedAt !== null);
  if (filters.psychologistId) result = result.filter(s => s.psychologistId === filters.psychologistId);
  if (filters.startDate) result = result.filter(s => new Date(s.submittedAt) >= new Date(filters.startDate));
  if (filters.endDate) result = result.filter(s => new Date(s.submittedAt) <= new Date(filters.endDate));
  return result.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export async function getPendingSurvey(patientId) {
  await delay(200);
  return surveys.find(s => s.patientId === patientId && s.submittedAt === null) || null;
}

export async function submitSurvey(surveyId, npsScore, comment) {
  await delay(500);
  const survey = surveys.find(s => s.id === surveyId);
  if (!survey) throw new Error('Encuesta no encontrada');
  survey.npsScore = npsScore;
  survey.comment = comment || '';
  survey.submittedAt = new Date().toISOString();
  return survey;
}

/**
 * Calcula el NPS: % Promotores (9-10) - % Detractores (0-6)
 */
export function calculateNPS(surveyList) {
  if (surveyList.length === 0) return { nps: 0, promoters: 0, passives: 0, detractors: 0, total: 0 };
  const promoters = surveyList.filter(s => s.npsScore >= 9).length;
  const detractors = surveyList.filter(s => s.npsScore <= 6).length;
  const passives = surveyList.length - promoters - detractors;
  const nps = Math.round(((promoters - detractors) / surveyList.length) * 100);
  return { nps, promoters, passives, detractors, total: surveyList.length };
}
