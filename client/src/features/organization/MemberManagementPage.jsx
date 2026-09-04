import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import * as orgService from '../../services/organizationService';
import { ORG_ROLE_CONFIG } from '../../mocks/organizationMock';

export default function MemberManagementPage() {
  const { hasRole } = useAuth();
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, invitesData] = await Promise.all([
        orgService.getMembers(),
        orgService.getInvites()
      ]);
      setMembers(membersData);
      setInvites(invitesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await orgService.createInvite({ email: inviteEmail, role: inviteRole });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('MEMBER');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvite = async (id) => {
    if (!window.confirm('¿Seguro que deseas revocar esta invitación?')) return;
    try {
      await orgService.revokeInvite(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const openRoleModal = (member) => {
    setSelectedMember(member);
    setNewRole(member.orgRole);
    setShowRoleModal(true);
  };

  const handleRoleChange = async (e) => {
    e.preventDefault();
    try {
      await orgService.updateMemberRole(selectedMember.id, newRole);
      setShowRoleModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (member) => {
    if (member.orgRole === 'OWNER') {
      alert('No puedes desactivar a un Propietario directamente.');
      return;
    }
    const action = member.isActive ? 'desactivar' : 'reactivar';
    if (!window.confirm(`¿Seguro que deseas ${action} a ${member.firstName} ${member.lastName}?`)) return;
    try {
      await orgService.toggleMemberActive(member.id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!hasRole(['ADMIN', 'PSYCHOLOGIST'])) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>No tienes permiso para ver esta página.</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>👥 Equipo y Supervisión</h1>
          <p className="page-subtitle">Gestiona a los terapeutas y asistentes de tu organización.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
          + Invitar Miembro
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>Cargando equipo...</div>
      ) : (
        <>
          {/* Miembros Activos */}
          <div className="member-table-wrapper" style={{ marginBottom: 'var(--space-2xl)' }}>
            <table className="member-table">
              <thead>
                <tr>
                  <th>Miembro</th>
                  <th>Rol en Equipo</th>
                  <th>Ingreso</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id} style={{ opacity: member.isActive ? 1 : 0.6 }}>
                    <td data-label="Miembro">
                      <div className="member-info">
                        <div className="member-avatar" style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}>
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="member-name">{member.firstName} {member.lastName}</div>
                          <div className="member-email">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Rol en Equipo">
                      <span className="org-role-badge" style={{ 
                        backgroundColor: ORG_ROLE_CONFIG[member.orgRole]?.bgColor, 
                        color: ORG_ROLE_CONFIG[member.orgRole]?.color 
                      }}>
                        {ORG_ROLE_CONFIG[member.orgRole]?.icon} {ORG_ROLE_CONFIG[member.orgRole]?.label}
                      </span>
                    </td>
                    <td data-label="Ingreso">
                      {new Date(member.joinedAt).toLocaleDateString('es-CO')}
                    </td>
                    <td data-label="Estado">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-gray-600)' }}>
                        <span className={`member-status-dot ${member.isActive ? 'active' : 'inactive'}`}></span>
                        {member.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td data-label="Acciones" style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '8px' }}
                        onClick={() => openRoleModal(member)}
                        disabled={member.orgRole === 'OWNER'}
                      >
                        Cambiar Rol
                      </button>
                      <button 
                        className="btn btn-outline-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: member.isActive ? 'var(--color-danger)' : 'var(--color-success)' }}
                        onClick={() => handleToggleActive(member)}
                        disabled={member.orgRole === 'OWNER'}
                      >
                        {member.isActive ? 'Desactivar' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invitaciones Pendientes */}
          {invites.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Invitaciones Pendientes</h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {invites.map(invite => {
                  const isExpired = new Date(invite.expiresAt) < new Date();
                  return (
                    <div key={invite.id} className="invite-card">
                      <div className="invite-info">
                        <div className="invite-email">{invite.email}</div>
                        <div className="invite-meta">
                          Rol: {ORG_ROLE_CONFIG[invite.role]?.label} • Enviada: {new Date(invite.createdAt).toLocaleDateString('es-CO')}
                        </div>
                        {isExpired && <div className="invite-expired">La invitación ha expirado</div>}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleRevokeInvite(invite.id)}>
                          Revocar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Invitar */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Invitar a la Clínica</h2>
              <button className="modal-close" onClick={() => setShowInviteModal(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleInviteSubmit}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', marginBottom: 'var(--space-md)' }}>
                Enviaremos un correo con un enlace seguro de un solo uso para que el nuevo integrante configure su cuenta.
              </p>
              
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Rol en el equipo</label>
                <select 
                  className="form-control" 
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                >
                  <option value="MEMBER">Terapeuta (MEMBER)</option>
                  <option value="SUPERVISOR">Supervisor (SUPERVISOR)</option>
                  <option value="ASSISTANT">Asistente Administrativo (ASSISTANT)</option>
                </select>
                <small style={{ display: 'block', marginTop: '8px', color: 'var(--color-gray-500)', fontSize: '0.75rem' }}>
                  {inviteRole === 'MEMBER' && 'Podrá gestionar su propia agenda y pacientes. No verá datos de otros terapeutas.'}
                  {inviteRole === 'SUPERVISOR' && 'Tendrá acceso a los casos de supervisión que le sean asignados, además de su propia práctica.'}
                  {inviteRole === 'ASSISTANT' && 'Podrá agendar citas y gestionar facturación, pero no tendrá acceso a las notas clínicas.'}
                </small>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowInviteModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={inviting || !inviteEmail}>
                  {inviting ? 'Enviando...' : 'Enviar Invitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambiar Rol */}
      {showRoleModal && selectedMember && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Cambiar Rol</h2>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleRoleChange}>
              <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-md)' }}>
                Modificar el rol de <strong>{selectedMember.firstName} {selectedMember.lastName}</strong>.
              </p>
              
              <div className="form-group">
                <select 
                  className="form-control" 
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                >
                  <option value="MEMBER">Terapeuta (MEMBER)</option>
                  <option value="SUPERVISOR">Supervisor (SUPERVISOR)</option>
                  <option value="ASSISTANT">Asistente (ASSISTANT)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowRoleModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
