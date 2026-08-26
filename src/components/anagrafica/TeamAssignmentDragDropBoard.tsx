import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Award,
  ArrowRightLeft,
  GripVertical,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Move,
  UserPlus,
  RefreshCw,
  Sparkles,
  Phone,
  Building,
  GraduationCap,
  ChevronRight,
  Info,
  X,
} from 'lucide-react';
import { Discente, Faculty, GroupType, Team } from '../../types';
import { getCountryFlag } from './MasterAnagraficaManager';
import { getTeamCodeName } from '../../utils/teamUtils';

interface TeamAssignmentDragDropBoardProps {
  teams: Team[];
  faculty: Faculty[];
  discenti: Discente[];
  updateDiscente: (id: string, updates: Partial<Discente>) => void;
  updateFaculty: (id: string, updates: Partial<Faculty>) => void;
  updateTeam: (teamId: number, updates: Partial<Team>) => void;
}

type DragPayload = {
  type: 'DISCENTE' | 'FACULTY';
  id: string;
  sourceTeamId: number;
  name: string;
};

export const TeamAssignmentDragDropBoard: React.FC<TeamAssignmentDragDropBoardProps> = ({
  teams,
  faculty,
  discenti,
  updateDiscente,
  updateFaculty,
  updateTeam,
}) => {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'ALL' | GroupType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState<DragPayload | null>(null);
  const [dragOverTeamId, setDragOverTeamId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile / Quick Move Modal State
  const [quickMoveModal, setQuickMoveModal] = useState<{
    type: 'DISCENTE' | 'FACULTY';
    id: string;
    name: string;
    currentTeamId: number;
    roleOrSpecialty: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Drag handlers
  const handleDragStart = (
    e: React.DragEvent,
    type: 'DISCENTE' | 'FACULTY',
    id: string,
    sourceTeamId: number,
    name: string
  ) => {
    const payload: DragPayload = { type, id, sourceTeamId, name };
    setDraggedItem(payload);
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverTeamId(null);
  };

  const handleDragOver = (e: React.DragEvent, teamId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTeamId !== teamId) {
      setDragOverTeamId(teamId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, teamId: number) => {
    if (dragOverTeamId === teamId) {
      setDragOverTeamId(null);
    }
  };

  const handleDropOnTeam = (e: React.DragEvent, targetTeamId: number) => {
    e.preventDefault();
    setDragOverTeamId(null);

    let payload = draggedItem;
    if (!payload) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) payload = JSON.parse(raw);
      } catch (err) {
        console.error('Error parsing drag payload', err);
      }
    }

    if (!payload) return;

    const { type, id, sourceTeamId, name } = payload;
    if (sourceTeamId === targetTeamId) {
      setDraggedItem(null);
      return;
    }

    if (type === 'DISCENTE') {
      updateDiscente(id, { teamId: targetTeamId });
      showToast(`✓ Discente ${name} riassegnato a ${getTeamCodeName(targetTeamId)}`);
    } else if (type === 'FACULTY') {
      // Find current faculty of target team to swap
      const targetFaculty = faculty.find(
        (f) => f.assignedTeamId === targetTeamId || f.id === teams.find((t) => t.id === targetTeamId)?.facultyId
      );

      // Reassign moving faculty to target team
      updateFaculty(id, { assignedTeamId: targetTeamId });
      updateTeam(targetTeamId, { facultyId: id });

      if (targetFaculty && targetFaculty.id !== id) {
        // Swap previous faculty to the source team
        updateFaculty(targetFaculty.id, { assignedTeamId: sourceTeamId });
        updateTeam(sourceTeamId, { facultyId: targetFaculty.id });
        showToast(
          `✓ Scambio Tutor completato: ${name} ➔ ${getTeamCodeName(targetTeamId)} | ${targetFaculty.name} ➔ ${getTeamCodeName(sourceTeamId)}`
        );
      } else {
        showToast(`✓ Tutor ${name} assegnato a ${getTeamCodeName(targetTeamId)}`);
      }
    }

    setDraggedItem(null);
  };

  // Quick Move Execution (for click/touch)
  const executeQuickMove = (targetTeamId: number) => {
    if (!quickMoveModal) return;
    const { type, id, name, currentTeamId } = quickMoveModal;

    if (currentTeamId === targetTeamId) {
      setQuickMoveModal(null);
      return;
    }

    if (type === 'DISCENTE') {
      updateDiscente(id, { teamId: targetTeamId });
      showToast(`✓ Discente ${name} spostato in ${getTeamCodeName(targetTeamId)}`);
    } else if (type === 'FACULTY') {
      const targetFaculty = faculty.find(
        (f) => f.assignedTeamId === targetTeamId || f.id === teams.find((t) => t.id === targetTeamId)?.facultyId
      );

      updateFaculty(id, { assignedTeamId: targetTeamId });
      updateTeam(targetTeamId, { facultyId: id });

      if (targetFaculty && targetFaculty.id !== id) {
        updateFaculty(targetFaculty.id, { assignedTeamId: currentTeamId });
        updateTeam(currentTeamId, { facultyId: targetFaculty.id });
        showToast(
          `✓ Scambio Tutor: ${name} ➔ ${getTeamCodeName(targetTeamId)} | ${targetFaculty.name} ➔ ${getTeamCodeName(currentTeamId)}`
        );
      } else {
        showToast(`✓ Tutor ${name} assegnato a ${getTeamCodeName(targetTeamId)}`);
      }
    }

    setQuickMoveModal(null);
  };

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (selectedGroupFilter !== 'ALL' && t.groupId !== selectedGroupFilter) return false;
      return true;
    });
  }, [teams, selectedGroupFilter]);

  // Statistics calculation
  const totalDiscenti = discenti.length;
  const totalFaculty = faculty.length;
  const avgDiscentiPerTeam = (totalDiscenti / (teams.length || 1)).toFixed(1);

  const getTeamGroupTheme = (groupId: GroupType) => {
    switch (groupId) {
      case 'A':
        return {
          border: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.08)',
          badgeBg: 'bg-red-950 text-red-300 border-red-700',
          label: 'GRUPPO A (ROSSO)',
        };
      case 'B':
        return {
          border: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.08)',
          badgeBg: 'bg-blue-950 text-blue-300 border-blue-700',
          label: 'GRUPPO B (BLU)',
        };
      case 'C':
        return {
          border: '#10b981',
          bg: 'rgba(16, 185, 129, 0.08)',
          badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-700',
          label: 'GRUPPO C (VERDE)',
        };
      case 'D':
        return {
          border: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.08)',
          badgeBg: 'bg-amber-950 text-amber-300 border-amber-700',
          label: 'GRUPPO D (GIALLO)',
        };
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="p-3 bg-emerald-950 border-2 border-emerald-500 text-emerald-200 flex items-center justify-between gap-3 text-xs font-bold shadow-2xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER & DRAG-AND-DROP INSTRUCTION BAR */}
      <div className="bg-neutral-900 border-2 border-orange-500/80 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-orange-500 text-black font-mono font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                MATRICE OPERATIVA SQUADRE & RIASSEGNAZIONE DRAG & DROP
              </span>
              <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold">
                12 SQUADRE • 4 GRUPPI
              </span>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1.5">
              Assortimento Squadre, Assegnazione Faculty e Discenti
            </h3>
            <p className="text-xs text-neutral-400 max-w-3xl mt-1 leading-relaxed">
              Trascina (<strong>Drag and Drop</strong>) i tesserini di <strong>Discenti</strong> o <strong>Faculty</strong> da una squadra all'altra per riassegnarli o scambiarli istantaneamente. Su smartphone o tablet puoi anche toccare il pulsante <strong className="text-orange-400">"Sposta"</strong> per il cambio rapido.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-center min-w-[90px]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">Discenti</span>
              <span className="text-base font-black text-white">{totalDiscenti}</span>
              <span className="text-[9px] font-mono text-neutral-500 block">med. {avgDiscentiPerTeam}/sq</span>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-center min-w-[90px]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">Faculty Tutor</span>
              <span className="text-base font-black text-emerald-400">{totalFaculty}</span>
              <span className="text-[9px] font-mono text-neutral-500 block">1 per squadra</span>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-center min-w-[90px]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">Squadre</span>
              <span className="text-base font-black text-orange-400">{teams.length}</span>
              <span className="text-[9px] font-mono text-neutral-500 block">4 Gruppi A-D</span>
            </div>
          </div>
        </div>

        {/* CONTROLS: Group Tabs Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Group Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedGroupFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-black uppercase font-mono tracking-wider border transition-all cursor-pointer flex-shrink-0 ${
                selectedGroupFilter === 'ALL'
                  ? 'bg-neutral-100 text-black border-neutral-100'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-600'
              }`}
            >
              TUTTI I 4 GRUPPI ({teams.length})
            </button>

            {(['A', 'B', 'C', 'D'] as const).map((grp) => {
              const theme = getTeamGroupTheme(grp);
              const count = teams.filter((t) => t.groupId === grp).length;
              return (
                <button
                  key={grp}
                  onClick={() => setSelectedGroupFilter(grp)}
                  className={`px-3 py-1.5 text-xs font-black uppercase font-mono tracking-wider border transition-all cursor-pointer flex-shrink-0 ${
                    selectedGroupFilter === grp
                      ? `${theme.badgeBg} font-black border-current shadow-sm`
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                  style={{
                    borderColor: selectedGroupFilter === grp ? theme.border : undefined,
                  }}
                >
                  GRUPPO {grp} ({count} Sq.)
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca discente o tutor..."
              className="w-full bg-neutral-950 border border-neutral-700 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 12 SQUADS GRID WITH DRAG AND DROP CAPABILITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTeams.map((team) => {
          const groupTheme = getTeamGroupTheme(team.groupId);
          const assignedFac = faculty.find(
            (f) => f.assignedTeamId === team.id || f.id === team.facultyId
          );

          let teamDiscenti = discenti.filter((d) => d.teamId === team.id);

          // Apply search filter if query is present
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchesTeamOrFaculty =
              team.name.toLowerCase().includes(q) ||
              assignedFac?.name.toLowerCase().includes(q) ||
              assignedFac?.specialty.toLowerCase().includes(q);

            if (!matchesTeamOrFaculty) {
              teamDiscenti = teamDiscenti.filter(
                (d) =>
                  d.name.toLowerCase().includes(q) ||
                  d.role.toLowerCase().includes(q) ||
                  d.organization?.toLowerCase().includes(q)
              );
            }
          }

          const isOver = dragOverTeamId === team.id;
          const hasBalanceWarning = teamDiscenti.length < 4 || teamDiscenti.length > 6;

          return (
            <div
              key={team.id}
              id={`team-drop-target-${team.id}`}
              onDragOver={(e) => handleDragOver(e, team.id)}
              onDragLeave={(e) => handleDragLeave(e, team.id)}
              onDrop={(e) => handleDropOnTeam(e, team.id)}
              className={`bg-neutral-900 border-2 transition-all flex flex-col justify-between relative shadow-lg ${
                isOver
                  ? 'border-orange-400 ring-4 ring-orange-500/40 bg-neutral-900/95 scale-[1.01]'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
              style={{
                borderLeftColor: team.color || groupTheme.border,
                borderLeftWidth: '6px',
              }}
            >
              {/* Drop overlay highlight message */}
              {isOver && (
                <div className="absolute inset-0 bg-orange-950/80 border-2 border-orange-400 z-30 flex flex-col items-center justify-center p-4 backdrop-blur-xs text-center animate-in fade-in">
                  <ArrowRightLeft className="w-8 h-8 text-orange-400 animate-bounce mb-1" />
                  <span className="text-sm font-black text-white uppercase tracking-wider">
                    RILASCIA QUI
                  </span>
                  <span className="text-xs text-orange-200 font-mono mt-0.5">
                    Assegna a {getTeamCodeName(team)} (Gruppo {team.groupId})
                  </span>
                </div>
              )}

              <div className="p-3.5 sm:p-4 space-y-3">
                {/* SQUAD HEADER */}
                <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black uppercase font-mono border ${groupTheme.badgeBg}`}
                      >
                        GRUPPO {team.groupId}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/40 inline-block"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="text-[10px] font-mono text-neutral-400 font-bold">
                        POSTAZIONE {team.id}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-white uppercase tracking-tight">
                      {getTeamCodeName(team)}
                    </h4>
                  </div>

                  {/* Discenti Counter Badge */}
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-mono font-black uppercase border block ${
                        hasBalanceWarning
                          ? 'bg-amber-950 text-amber-300 border-amber-600'
                          : 'bg-neutral-950 text-emerald-400 border-neutral-700'
                      }`}
                    >
                      {teamDiscenti.length} DISCENTI
                    </span>
                    {hasBalanceWarning && (
                      <span className="text-[9px] text-amber-400 font-mono font-bold flex items-center gap-0.5 justify-end mt-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {teamDiscenti.length < 4 ? 'Organico ridotto' : 'Sovrannumero'}
                      </span>
                    )}
                  </div>
                </div>

                {/* ASSIGNED FACULTY / TUTOR SECTION */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono font-black uppercase text-emerald-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      TUTOR / FACULTY ASSEGNATO
                    </span>
                    <span className="text-neutral-500 font-normal">
                      (Trascina per scambiare)
                    </span>
                  </div>

                  {assignedFac ? (
                    <div
                      draggable={true}
                      onDragStart={(e) =>
                        handleDragStart(
                          e,
                          'FACULTY',
                          assignedFac.id,
                          team.id,
                          assignedFac.name
                        )
                      }
                      onDragEnd={handleDragEnd}
                      className="bg-emerald-950/40 border border-emerald-600/70 p-2.5 cursor-grab active:cursor-grabbing hover:border-emerald-400 transition-all group relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-emerald-500/70 group-hover:text-emerald-300 flex-shrink-0" />
                          <div className="w-7 h-7 bg-emerald-600 text-white font-black flex items-center justify-center text-xs flex-shrink-0">
                            {assignedFac.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white uppercase group-hover:text-emerald-200">
                                {assignedFac.name}
                              </span>
                              <span className="text-[10px]">
                                {getCountryFlag(assignedFac.nationality)}
                              </span>
                            </div>
                            <p className="text-[10px] text-emerald-300/90 font-medium line-clamp-1">
                              {assignedFac.specialty}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setQuickMoveModal({
                              type: 'FACULTY',
                              id: assignedFac.id,
                              name: assignedFac.name,
                              currentTeamId: team.id,
                              roleOrSpecialty: assignedFac.specialty,
                            })
                          }
                          className="px-2 py-1 bg-neutral-900 hover:bg-emerald-600 hover:text-white text-emerald-300 border border-emerald-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                          title="Sposta o scambia tutor con un'altra squadra"
                        >
                          <Move className="w-3 h-3" />
                          <span className="hidden xs:inline">SCAMBIA</span>
                        </button>
                      </div>

                      <div className="mt-1.5 pt-1.5 border-t border-emerald-900/80 flex items-center justify-between text-[9px] font-mono text-neutral-400">
                        <span className="truncate max-w-[170px]">
                          {assignedFac.organization || 'AOU Trauma Center'}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {assignedFac.badgeCode || 'FAC'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-neutral-950 border border-dashed border-neutral-700 text-center text-xs text-neutral-400">
                      Nessun Tutor assegnato (Trascina qui un Faculty)
                    </div>
                  )}
                </div>

                {/* DISCENTI LIST SECTION */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono font-black uppercase text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-orange-400" />
                      DISCENTI DELLA SQUADRA ({teamDiscenti.length})
                    </span>
                    <span className="text-neutral-500 font-normal">
                      (Trascina per spostare)
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {teamDiscenti.length === 0 ? (
                      <div className="p-4 bg-neutral-950 border border-dashed border-neutral-800 text-center text-xs text-neutral-500 font-mono">
                        Nessun discente in questa squadra.
                        <br />
                        Trascina qui i discenti per assegnarli.
                      </div>
                    ) : (
                      teamDiscenti.map((d) => (
                        <div
                          key={d.id}
                          draggable={true}
                          onDragStart={(e) =>
                            handleDragStart(
                              e,
                              'DISCENTE',
                              d.id,
                              team.id,
                              d.name
                            )
                          }
                          onDragEnd={handleDragEnd}
                          className="bg-neutral-950 border border-neutral-800 hover:border-orange-500 p-2 cursor-grab active:cursor-grabbing transition-all group relative hover:bg-neutral-900"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-start gap-1.5 min-w-0 flex-1">
                              <GripVertical className="w-3.5 h-3.5 text-neutral-600 group-hover:text-orange-400 flex-shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-white group-hover:text-orange-300 truncate">
                                    {d.name}
                                  </span>
                                  <span className="text-[10px]">
                                    {getCountryFlag(d.nationality)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className="px-1.5 py-0.2 bg-neutral-900 text-orange-300 border border-neutral-700 text-[9px] font-mono font-bold">
                                    {d.role}
                                  </span>
                                  <span className="text-[9px] text-neutral-400 truncate max-w-[140px]">
                                    {d.organization}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quick move action button */}
                            <button
                              type="button"
                              onClick={() =>
                                setQuickMoveModal({
                                  type: 'DISCENTE',
                                  id: d.id,
                                  name: d.name,
                                  currentTeamId: team.id,
                                  roleOrSpecialty: d.role,
                                })
                              }
                              className="p-1 bg-neutral-900 hover:bg-orange-500 hover:text-black text-neutral-400 border border-neutral-700 transition-colors cursor-pointer flex-shrink-0"
                              title="Sposta in un'altra squadra"
                            >
                              <Move className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER STATS PER SQUAD */}
              <div className="p-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-neutral-500" />
                  Rotazione: {team.groupId} Extra/Intra
                </span>
                <span className="text-orange-400 font-bold">
                  {getTeamCodeName(team)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK REASSIGNMENT MODAL (Accessible via touch or click) */}
      {quickMoveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-neutral-950 border-3 border-orange-500 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-orange-950/80 border-b-2 border-orange-500 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-orange-500 text-black font-black flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-orange-300">
                    RIASSEGNAZIONE RAPIDA {quickMoveModal.type}
                  </span>
                  <h4 className="text-base font-black text-white uppercase">
                    {quickMoveModal.name}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setQuickMoveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white border border-neutral-700 bg-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div className="bg-neutral-900 border border-neutral-800 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Ruolo / Specialità:</span>
                  <span className="text-white font-bold">{quickMoveModal.roleOrSpecialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Squadra Attuale:</span>
                  <span className="text-orange-400 font-bold font-mono">
                    {getTeamCodeName(quickMoveModal.currentTeamId)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-white uppercase tracking-wider block font-mono">
                  Seleziona la Squadra di Destinazione:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {teams.map((t) => {
                    const isCurrent = t.id === quickMoveModal.currentTeamId;
                    const teamMembersCount = discenti.filter((d) => d.teamId === t.id).length;
                    return (
                      <button
                        key={t.id}
                        disabled={isCurrent}
                        onClick={() => executeQuickMove(t.id)}
                        className={`p-2.5 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-neutral-900/50 border-neutral-800 opacity-40 cursor-not-allowed'
                            : 'bg-neutral-900 border-neutral-700 hover:border-orange-500 hover:bg-neutral-800'
                        }`}
                        style={{ borderLeftColor: t.color, borderLeftWidth: '4px' }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white uppercase">
                            Sq. {t.id}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-400">
                            Gr. {t.groupId}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-300 font-semibold truncate mt-1">
                          {getTeamCodeName(t)}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400 mt-1 block">
                          {quickMoveModal.type === 'DISCENTE'
                            ? `${teamMembersCount} discenti`
                            : 'Tutor: ' + (faculty.find((f) => f.assignedTeamId === t.id)?.name || 'N/D')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setQuickMoveModal(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase border border-neutral-700 cursor-pointer"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
