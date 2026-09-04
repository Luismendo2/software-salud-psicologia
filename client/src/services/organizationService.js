/* ==========================================================================
   organizationService.js — Servicio para Equipo y Supervisión (Feature 009)
   ========================================================================== */

import {
  MOCK_ORGANIZATION,
  MOCK_ORG_MEMBERS,
  MOCK_ORG_INVITES,
  MOCK_SUPERVISION_CASES,
} from '../mocks/organizationMock';

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

let organization = { ...MOCK_ORGANIZATION };
let members = [...MOCK_ORG_MEMBERS];
let invites = [...MOCK_ORG_INVITES];
let supervisionCases = [...MOCK_SUPERVISION_CASES];

/* ── Organización ── */

export async function getOrganization() {
  await delay();
  return { ...organization };
}

export async function updateOrganization(updates) {
  await delay(500);
  if (updates.settings) {
    organization.settings = { ...organization.settings, ...updates.settings };
  }
  if (updates.name) organization.name = updates.name;
  if (updates.slug) organization.slug = updates.slug;
  return { ...organization };
}

/* ── Miembros ── */

export async function getMembers() {
  await delay();
  return members
    .sort((a, b) => {
      // OWNER primero, luego SUPERVISOR, luego MEMBER, luego ASSISTANT
      const order = { OWNER: 0, SUPERVISOR: 1, MEMBER: 2, ASSISTANT: 3 };
      return (order[a.orgRole] ?? 4) - (order[b.orgRole] ?? 4);
    });
}

export async function updateMemberRole(memberId, newRole) {
  await delay(500);
  const member = members.find(m => m.id === memberId);
  if (!member) throw new Error('Miembro no encontrado');
  member.orgRole = newRole;
  return { ...member };
}

export async function toggleMemberActive(memberId) {
  await delay(500);
  const member = members.find(m => m.id === memberId);
  if (!member) throw new Error('Miembro no encontrado');
  member.isActive = !member.isActive;
  return { ...member };
}

/* ── Invitaciones ── */

export async function getInvites() {
  await delay();
  return invites
    .filter(i => !i.acceptedAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function createInvite({ email, role }) {
  await delay(500);
  const newInvite = {
    id: `inv-${Date.now()}`,
    organizationId: organization.id,
    email,
    role,
    token: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    acceptedAt: null,
    createdAt: new Date().toISOString(),
  };
  invites.push(newInvite);
  return newInvite;
}

export async function revokeInvite(inviteId) {
  await delay(300);
  invites = invites.filter(i => i.id !== inviteId);
}

export async function acceptInvite(token, { name, password }) {
  await delay(800);
  const invite = invites.find(i => i.token === token);
  if (!invite) throw new Error('Invitación no encontrada o ya fue utilizada.');
  if (invite.acceptedAt) throw new Error('Esta invitación ya fue aceptada.');
  if (new Date(invite.expiresAt) < new Date()) throw new Error('Esta invitación ha expirado.');

  invite.acceptedAt = new Date().toISOString();

  // Simular creación de nuevo miembro
  const newMember = {
    id: `mem-${Date.now()}`,
    organizationId: invite.organizationId,
    userId: `usr-${Date.now()}`,
    firstName: name.split(' ')[0] || name,
    lastName: name.split(' ').slice(1).join(' ') || '',
    email: invite.email,
    role: 'PSYCHOLOGIST',
    orgRole: invite.role,
    invitedAt: invite.createdAt,
    joinedAt: new Date().toISOString(),
    isActive: true,
  };
  members.push(newMember);

  return { success: true, member: newMember };
}

/* ── Supervisión ── */

export async function getSupervisionCases(filters = {}) {
  await delay();
  let result = [...supervisionCases];
  if (filters.supervisorId) result = result.filter(c => c.supervisorId === filters.supervisorId);
  if (filters.superviseeId) result = result.filter(c => c.superviseeId === filters.superviseeId);
  if (filters.status) result = result.filter(c => c.status === filters.status);
  
  // PENDING_REVIEW primero, luego IN_REVIEW, luego RESOLVED
  const statusOrder = { PENDING_REVIEW: 0, IN_REVIEW: 1, RESOLVED: 2 };
  return result.sort((a, b) => {
    const orderDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    if (orderDiff !== 0) return orderDiff;
    return new Date(a.createdAt) - new Date(b.createdAt); // Más antiguos primero
  });
}

export async function getSupervisionCase(caseId) {
  await delay();
  const sc = supervisionCases.find(c => c.id === caseId);
  if (!sc) throw new Error('Caso no encontrado');
  return { ...sc };
}

export async function createSupervisionCase({ sessionNoteId, supervisorId, isAnonymized, patientName, sessionDate, sessionNumber, noteExcerpt }) {
  await delay(500);
  const newCase = {
    id: `sc-${Date.now()}`,
    sessionNoteId,
    supervisorId,
    supervisorName: members.find(m => m.userId === supervisorId)?.firstName + ' ' + members.find(m => m.userId === supervisorId)?.lastName || 'Supervisor',
    superviseeId: 'usr-1', // Mock: siempre el usuario actual
    superviseeName: 'María López',
    organizationId: organization.id,
    isAnonymized,
    status: 'PENDING_REVIEW',
    patientName,
    patientAlias: isAnonymized ? `Paciente #${Math.floor(1000 + Math.random() * 9000)}` : null,
    sessionDate,
    sessionNumber,
    noteExcerpt,
    supervisorFeedback: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
  supervisionCases.unshift(newCase);
  return newCase;
}

export async function submitFeedback(caseId, feedback) {
  await delay(500);
  const sc = supervisionCases.find(c => c.id === caseId);
  if (!sc) throw new Error('Caso no encontrado');
  sc.supervisorFeedback = feedback;
  sc.status = 'RESOLVED';
  sc.resolvedAt = new Date().toISOString();
  return { ...sc };
}

export async function updateCaseStatus(caseId, status) {
  await delay(300);
  const sc = supervisionCases.find(c => c.id === caseId);
  if (!sc) throw new Error('Caso no encontrado');
  sc.status = status;
  return { ...sc };
}

/**
 * Obtiene los supervisores disponibles en la organización
 */
export async function getSupervisors() {
  await delay(200);
  return members.filter(m => m.orgRole === 'SUPERVISOR' && m.isActive);
}
