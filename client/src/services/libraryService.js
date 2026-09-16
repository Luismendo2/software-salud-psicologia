/* ==========================================================================
   libraryService.js — Capa de servicio para Biblioteca Terapéutica (Feature 012)
   Gestión de filtros combinados, subida y descarga de recursos clínicos.
   ========================================================================== */

import { MOCK_LIBRARY_ITEMS, RESOURCE_TYPES, THERAPY_APPROACHES } from '../mocks/libraryMock';

const delay = (ms = 250) => new Promise(r => setTimeout(r, ms));

let currentItems = [...MOCK_LIBRARY_ITEMS];

/**
 * Obtiene los materiales de la biblioteca con filtros simultáneos (CA-16, CA-17)
 */
export async function getLibraryResources({
  search = '',
  type = 'ALL',
  therapyType = 'ALL',
  scope = 'ALL', // 'ALL', 'PUBLIC', 'PRIVATE'
  organizationId = 'org-1',
} = {}) {
  await delay(200);

  return currentItems.filter((item) => {
    // Control de visibilidad por organización (CA-17)
    if (!item.isPublic && item.organizationId !== organizationId) {
      return false;
    }

    if (scope === 'PUBLIC' && !item.isPublic) return false;
    if (scope === 'PRIVATE' && item.isPublic) return false;

    // Filtro por tipo
    if (type !== 'ALL' && item.type !== type) return false;

    // Filtro por enfoque terapéutico
    if (therapyType !== 'ALL' && item.therapyType !== therapyType) return false;

    // Búsqueda por texto libre
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    return true;
  });
}

/**
 * Sube un nuevo recurso clínico a la biblioteca (CA-15)
 */
export async function uploadLibraryResource(resourceData) {
  await delay(500);

  const newItem = {
    id: `res-${Date.now()}`,
    title: resourceData.title,
    description: resourceData.description,
    type: resourceData.type,
    therapyType: resourceData.therapyType,
    format: resourceData.fileName?.endsWith('.docx') ? 'docx' : resourceData.fileName?.endsWith('.mp4') ? 'mp4' : 'pdf',
    fileSize: resourceData.fileSize || '1.5 MB',
    fileUrl: 'https://example.com/mock-file.pdf',
    tags: resourceData.tags || [],
    isPublic: resourceData.isPublic ?? true,
    authorName: resourceData.authorName || 'Dra. María López',
    organizationId: resourceData.organizationId || 'org-1',
    downloadsCount: 0,
    createdAt: new Date().toISOString(),
  };

  currentItems = [newItem, ...currentItems];
  return newItem;
}

/**
 * Elimina un recurso de la biblioteca
 */
export async function deleteLibraryResource(id) {
  await delay(300);
  currentItems = currentItems.filter((item) => item.id !== id);
  return { success: true };
}

export { RESOURCE_TYPES, THERAPY_APPROACHES };
