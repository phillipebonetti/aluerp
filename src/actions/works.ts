'use server'

import { workService } from '@/src/services/work.service'

// ==================== ETAPAS ====================

export async function getWorkStagesAction(projectId: string) {
  try {
    const stages = await workService.getStages(projectId)
    return { success: true, data: stages }
  } catch (error) {
    console.error('[Works] Erro ao obter etapas:', error)
    return { success: false, error: 'Falha ao obter etapas' }
  }
}

export async function createWorkStageAction(input: any) {
  try {
    const stage = await workService.createStage(input)
    return { success: true, data: stage }
  } catch (error) {
    console.error('[Works] Erro ao criar etapa:', error)
    return { success: false, error: 'Falha ao criar etapa' }
  }
}

export async function updateWorkStageAction(id: string, data: any) {
  try {
    const stage = await workService.updateStage(id, data)
    return { success: true, data: stage }
  } catch (error) {
    console.error('[Works] Erro ao atualizar etapa:', error)
    return { success: false, error: 'Falha ao atualizar etapa' }
  }
}

// ==================== TAREFAS ====================

export async function getWorkTasksAction(projectId: string, filter?: any) {
  try {
    const tasks = await workService.getTasks(projectId, filter)
    return { success: true, data: tasks }
  } catch (error) {
    console.error('[Works] Erro ao obter tarefas:', error)
    return { success: false, error: 'Falha ao obter tarefas' }
  }
}

export async function createWorkTaskAction(input: any) {
  try {
    const task = await workService.createTask(input)
    return { success: true, data: task }
  } catch (error) {
    console.error('[Works] Erro ao criar tarefa:', error)
    return { success: false, error: 'Falha ao criar tarefa' }
  }
}

export async function updateWorkTaskAction(id: string, data: any) {
  try {
    const task = await workService.updateTask(id, data)
    return { success: true, data: task }
  } catch (error) {
    console.error('[Works] Erro ao atualizar tarefa:', error)
    return { success: false, error: 'Falha ao atualizar tarefa' }
  }
}

// ==================== CHECKLISTS ====================

export async function addChecklistAction(input: any) {
  try {
    const checklist = await workService.addChecklist(input)
    return { success: true, data: checklist }
  } catch (error) {
    console.error('[Works] Erro ao adicionar checklist:', error)
    return { success: false, error: 'Falha ao adicionar checklist' }
  }
}

export async function updateChecklistAction(id: string, data: any) {
  try {
    const checklist = await workService.updateChecklist(id, data)
    return { success: true, data: checklist }
  } catch (error) {
    console.error('[Works] Erro ao atualizar checklist:', error)
    return { success: false, error: 'Falha ao atualizar checklist' }
  }
}

// ==================== EQUIPE ====================

export async function getWorkTeamAction(projectId: string) {
  try {
    const team = await workService.getTeam(projectId)
    return { success: true, data: team }
  } catch (error) {
    console.error('[Works] Erro ao obter equipe:', error)
    return { success: false, error: 'Falha ao obter equipe' }
  }
}

export async function addTeamMemberAction(input: any) {
  try {
    const member = await workService.addTeamMember(input)
    return { success: true, data: member }
  } catch (error) {
    console.error('[Works] Erro ao adicionar membro:', error)
    return { success: false, error: 'Falha ao adicionar membro' }
  }
}

// ==================== MEDIÇÕES ====================

export async function getWorkMeasurementsAction(projectId: string) {
  try {
    const measurements = await workService.getMeasurements(projectId)
    return { success: true, data: measurements }
  } catch (error) {
    console.error('[Works] Erro ao obter medições:', error)
    return { success: false, error: 'Falha ao obter medições' }
  }
}

export async function createMeasurementAction(input: any) {
  try {
    const measurement = await workService.createMeasurement(input)
    return { success: true, data: measurement }
  } catch (error) {
    console.error('[Works] Erro ao criar medição:', error)
    return { success: false, error: 'Falha ao criar medição' }
  }
}

// ==================== OCORRÊNCIAS ====================

export async function getWorkOccurrencesAction(projectId: string) {
  try {
    const occurrences = await workService.getOccurrences(projectId)
    return { success: true, data: occurrences }
  } catch (error) {
    console.error('[Works] Erro ao obter ocorrências:', error)
    return { success: false, error: 'Falha ao obter ocorrências' }
  }
}

export async function createOccurrenceAction(input: any) {
  try {
    const occurrence = await workService.createOccurrence(input)
    return { success: true, data: occurrence }
  } catch (error) {
    console.error('[Works] Erro ao criar ocorrência:', error)
    return { success: false, error: 'Falha ao criar ocorrência' }
  }
}

// ==================== DIÁRIO ====================

export async function getWorkDiaryAction(projectId: string, limit?: number) {
  try {
    const diary = await workService.getDiary(projectId, limit)
    return { success: true, data: diary }
  } catch (error) {
    console.error('[Works] Erro ao obter diário:', error)
    return { success: false, error: 'Falha ao obter diário' }
  }
}

export async function createDiaryEntryAction(input: any) {
  try {
    const entry = await workService.createDiaryEntry(input)
    return { success: true, data: entry }
  } catch (error) {
    console.error('[Works] Erro ao criar entrada no diário:', error)
    return { success: false, error: 'Falha ao criar entrada no diário' }
  }
}

// ==================== CUSTOS ====================

export async function getProjectCostsAction(projectId: string) {
  try {
    const result = await workService.getProjectCosts(projectId)
    return { success: true, data: result }
  } catch (error) {
    console.error('[Works] Erro ao obter custos:', error)
    return { success: false, error: 'Falha ao obter custos' }
  }
}

export async function addCostAction(projectId: string, input: any) {
  try {
    const cost = await workService.addCost(projectId, input)
    return { success: true, data: cost }
  } catch (error) {
    console.error('[Works] Erro ao adicionar custo:', error)
    return { success: false, error: 'Falha ao adicionar custo' }
  }
}

// ==================== STATISTICS ====================

export async function getProjectStatsAction(projectId: string) {
  try {
    const stats = await workService.getProjectStats(projectId)
    return { success: true, data: stats }
  } catch (error) {
    console.error('[Works] Erro ao obter estatísticas:', error)
    return { success: false, error: 'Falha ao obter estatísticas' }
  }
}
