/* ==========================================================================
   authService.js — Capa de servicio para Seguridad (Feature 004)
   
   Encapsula las llamadas a /api/v1/auth/* y /api/v1/admin/audit-logs.
   Mientras no exista backend, retorna datos mock con delay simulado.
   
   Regla: Los componentes NUNCA llaman a Axios directamente.
   ========================================================================== */

import {
  MOCK_USERS,
  MOCK_CREDENTIALS,
  MOCK_AUDIT_LOGS,
} from '../mocks/authMock';

/** Simula latencia de red */
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

/* ── Autenticación ── */

export async function login(email, password) {
  await delay(800);
  const cred = MOCK_CREDENTIALS[email.toLowerCase()];
  if (!cred || cred.password !== password) {
    throw new Error('Correo o contraseña incorrectos.');
  }
  const user = MOCK_USERS.find(u => u.id === cred.userId);
  if (!user) throw new Error('Usuario no encontrado.');
  if (!user.isActive) throw new Error('Esta cuenta ha sido desactivada.');

  // Simula el token JWT (en producción viene del backend)
  const mockToken = `mock-jwt-${user.id}-${Date.now()}`;
  return {
    accessToken: mockToken,
    user: { ...user },
  };
}

export async function logout() {
  await delay(200);
  return { success: true };
}

export async function refreshToken() {
  await delay(300);
  // Simula renovación — en producción usa la cookie httpOnly
  return { accessToken: `mock-jwt-refreshed-${Date.now()}` };
}

export async function getCurrentUser() {
  await delay(300);
  // Simula GET /auth/me — retorna el psicólogo por defecto
  return { ...MOCK_USERS[0] };
}

/* ── Recuperación de contraseña ── */

export async function forgotPassword(email) {
  await delay(600);
  const exists = MOCK_USERS.some(u => u.email.toLowerCase() === email.toLowerCase());
  // Siempre retorna success para no exponer si el email existe
  return {
    success: true,
    message: 'Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.',
  };
}

export async function resetPassword(token, newPassword) {
  await delay(600);
  if (!token || token.length < 5) {
    throw new Error('Token inválido o expirado.');
  }
  return {
    success: true,
    message: 'Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.',
  };
}

/* ── Cambio de contraseña (autenticado) ── */

export async function changePassword(currentPassword, newPassword) {
  await delay(500);
  // Simula verificación de contraseña actual
  if (currentPassword === 'wrongpassword') {
    throw new Error('La contraseña actual es incorrecta.');
  }
  return { success: true, message: 'Contraseña actualizada exitosamente.' };
}

/* ── Registro de auditoría (solo ADMIN) ── */

export async function getAuditLogs({ page = 1, limit = 10, userId, resourceType, dateFrom, dateTo } = {}) {
  await delay(500);
  let logs = [...MOCK_AUDIT_LOGS];

  // Filtros
  if (userId) {
    logs = logs.filter(l => l.userId === userId);
  }
  if (resourceType) {
    logs = logs.filter(l => l.resourceType === resourceType);
  }
  if (dateFrom) {
    const from = new Date(dateFrom);
    logs = logs.filter(l => new Date(l.timestamp) >= from);
  }
  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59);
    logs = logs.filter(l => new Date(l.timestamp) <= to);
  }

  // Ordenar por fecha descendente
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Paginar
  const total = logs.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = logs.slice(start, start + limit);

  return { data, page, limit, total, totalPages };
}

/* ── Gestión de usuarios (solo ADMIN) ── */

export async function getUsers() {
  await delay();
  return [...MOCK_USERS];
}

export async function updateUserRole(userId, newRole) {
  await delay(500);
  const user = MOCK_USERS.find(u => u.id === userId);
  if (!user) throw new Error('Usuario no encontrado.');
  return { ...user, role: newRole };
}

export async function toggleUserActive(userId) {
  await delay(500);
  const user = MOCK_USERS.find(u => u.id === userId);
  if (!user) throw new Error('Usuario no encontrado.');
  return { ...user, isActive: !user.isActive };
}
