// src/Kanban.jsx - Design Premium Moderno
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './Kanban.css';

const columnsConfig = [
  { id: 'novo', title: 'Novos Leads', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' },
  { id: 'contato', title: 'Em Contato', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' },
  { id: 'proposta', title: 'Proposta Enviada', color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' },
  { id: 'ganho', title: 'Negócio Fechado', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
  { id: 'perda', title: 'Perdidos', color: '#64748B', gradient: 'linear-gradient(135deg, #64748B 0%, #475569 100%)' },
];

const Kanban = () => {
  const [leads, setLeads] = useState([]);
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadKanban();
  }, []);

  const loadKanban = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const leadsData = data || [];
      setLeads(leadsData);

      const initialColumns = {};
      columnsConfig.forEach(col => {
        initialColumns[col.id] = leadsData.filter(lead => lead.status === col.id);
      });

      setColumns(initialColumns);
    } catch (err) {
      console.error('Error:', err);
      setError('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  }, []);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const leadId = draggableId;
    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    try {
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));

      setColumns(prev => {
        const sourceCol = [...(prev[oldStatus] || [])];
        const destCol = [...(prev[newStatus] || [])];
        const leadIndex = sourceCol.findIndex(l => l.id === leadId);
        
        if (leadIndex > -1) {
          const [movedLead] = sourceCol.splice(leadIndex, 1);
          movedLead.status = newStatus;
          destCol.splice(destination.index, 0, movedLead);
          
          return {
            ...prev,
            [oldStatus]: sourceCol,
            [newStatus]: destCol
          };
        }
        return prev;
      });

      await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
    } catch (error) {
      console.error('Drag error:', error);
      loadKanban();
    }
  };

  if (loading) {
    return (
      <div className="kanban-wrapper">
        <div className="loading-state">
          <div className="loader"></div>
          <p>Carregando seu pipeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kanban-wrapper">
        <div className="error-state">
          <h3>Erro ao carregar pipeline</h3>
          <p>{error}</p>
          <button onClick={loadKanban} className="btn-primary">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  const totalLeads = leads.length;
  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);

  return (
    <div className="kanban-wrapper">
      {/* Top Bar Premium */}
      <div className="top-bar">
        <div className="top-bar-left">
          <h1 className="page-title">Pipeline de Vendas</h1>
          <div className="breadcrumb">
            <span>CRM</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
            <span>Pipeline</span>
          </div>
        </div>
        <div className="top-bar-right">
          <button className="btn-icon" onClick={loadKanban} title="Atualizar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23,4 23,10 17,10"/>
              <polyline points="1,20 1,14 7,14"/>
              <path d="M3.51,9A9,9,0,0,1,14.85,3.36L23,10M1,14l8.14,6.64A9,9,0,0,0,20.49,15"/>
            </svg>
          </button>
          <button className="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21,15v4a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V15"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar
          </button>
          <button className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Lead
          </button>
        </div>
      </div>

      {/* Stats Cards Premium */}
      <div className="stats-grid">
        <div className="stat-card stat-purple">
          <div className="stat-header">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17,21V19a4,4,0,0,0-4-4H5a4,4,0,0,0-4,4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23,21V19a4,4,0,0,0-3-3.87"/>
                <path d="M16,3.13a4,4,0,0,1,0,7.75"/>
              </svg>
            </div>
            <h3>Total de Leads</h3>
          </div>
          <div className="stat-value">{totalLeads}</div>
          <div className="stat-footer">
            <span className="stat-change positive">+12% vs mês anterior</span>
          </div>
        </div>

        <div className="stat-card stat-blue">
          <div className="stat-header">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17,5H9.5a3.5,3.5,0,0,0,0,7h5a3.5,3.5,0,0,1,0,7H6"/>
              </svg>
            </div>
            <h3>Valor do Pipeline</h3>
          </div>
          <div className="stat-value">R$ {(totalValue / 1000).toFixed(1)}k</div>
          <div className="stat-footer">
            <span className="stat-change positive">+24% vs mês anterior</span>
          </div>
        </div>

        <div className="stat-card stat-cyan">
          <div className="stat-header">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22,11.08V12a10,10,0,1,1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
            <h3>Taxa de Conversão</h3>
          </div>
          <div className="stat-value">
            {totalLeads > 0 ? ((columns.ganho?.length / totalLeads) * 100).toFixed(1) : 0}%
          </div>
          <div className="stat-footer">
            <span className="stat-change neutral">Meta: 25%</span>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-header">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
            </div>
            <h3>Deals Fechados</h3>
          </div>
          <div className="stat-value">{columns.ganho?.length || 0}</div>
          <div className="stat-footer">
            <span className="stat-change positive">+8 este mês</span>
          </div>
        </div>
      </div>

      {/* Pipeline Board Premium */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="pipeline-board">
          {columnsConfig.map((col, idx) => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`board-column ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                  style={{ '--column-color': col.color }}
                >
                  <div className="column-header">
                    <div className="column-title-wrapper">
                      <div className="column-indicator" style={{ background: col.gradient }}></div>
                      <h2 className="column-title">{col.title}</h2>
                    </div>
                    <div className="column-count">{columns[col.id]?.length || 0}</div>
                  </div>

                  <div className="cards-container">
                    {(columns[col.id] || []).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`deal-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                            style={{
                              ...provided.draggableProps.style,
                              '--card-accent': col.color
                            }}
                          >
                            <div className="card-top">
                              <div className="lead-avatar" style={{ background: col.gradient }}>
                                {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                              <div className="card-badge" style={{ background: col.gradient }}>
                                {col.id === 'novo' && 'Novo'}
                                {col.id === 'contato' && 'Ativo'}
                                {col.id === 'proposta' && 'Aguardando'}
                                {col.id === 'ganho' && 'Ganho'}
                                {col.id === 'perda' && 'Perdido'}
                              </div>
                            </div>

                            <h3 className="card-title">{lead.name}</h3>
                            <p className="card-email">{lead.email}</p>

                            {lead.phone && (
                              <div className="card-detail">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22,16.92v3a2,2,0,0,1-2.18,2,19.79,19.79,0,0,1-8.63-3.07,19.5,19.5,0,0,1-6-6,19.79,19.79,0,0,1-3.07-8.67A2,2,0,0,1,4.11,2h3a2,2,0,0,1,2,1.72,12.84,12.84,0,0,0,.7,2.81,2,2,0,0,1-.45,2.11L8.09,9.91a16,16,0,0,0,6,6l1.27-1.27a2,2,0,0,1,2.11-.45,12.84,12.84,0,0,0,2.81.7A2,2,0,0,1,22,16.92z"/>
                                </svg>
                                <span>{lead.phone}</span>
                              </div>
                            )}

                            <div className="card-footer">
                              <div className="card-date">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <polyline points="12,6 12,12 16,14"/>
                                </svg>
                                {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                              </div>
                              <button className="card-action" title="Ver detalhes">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="9,18 15,12 9,6"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {(!columns[col.id] || columns[col.id].length === 0) && (
                      <div className="empty-column">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                        </svg>
                        <p>Nenhum lead nesta etapa</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Kanban;
