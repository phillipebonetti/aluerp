import { getPrisma } from '@/src/core/database'
import type { WorkStage, WorkTask, TaskChecklist, WorkTeam, WorkMeasurement, WorkOccurrence } from '@prisma/client'

export class WorkService {
  private prisma = getPrisma()

  // ==================== ETAPAS ====================

  async getStages(projectId: string) {
    return this.prisma.workStage.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    })
  }

  async createStage(data: {
    projectId: string
    companyId: string
    name: string
    position: number
    description?: string
    responsibleId?: string
  }) {
    return this.prisma.workStage.create({ data })
  }

  async updateStage(id: string, data: any) {
    return this.prisma.workStage.update({ where: { id }, data })
  }

  // ==================== TAREFAS ====================

  async getTasks(projectId: string, filter?: { stageId?: string; status?: string }) {
    return this.prisma.workTask.findMany({
      where: {
        projectId,
        ...(filter?.stageId && { stageId: filter.stageId }),
        ...(filter?.status && { status: filter.status as any }),
      },
      include: { responsible: true, checklists: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createTask(data: {
    projectId: string
    stageId: string
    companyId: string
    title: string
    description?: string
    priority?: string
    responsibleId?: string
    dueDate?: Date
  }) {
    return this.prisma.workTask.create({ data })
  }

  async updateTask(id: string, data: any) {
    return this.prisma.workTask.update({ where: { id }, data })
  }

  // ==================== CHECKLISTS ====================

  async addChecklist(data: { taskId: string; projectId: string; companyId: string; title: string }) {
    return this.prisma.taskChecklist.create({ data })
  }

  async updateChecklist(id: string, data: any) {
    return this.prisma.taskChecklist.update({ where: { id }, data })
  }

  // ==================== EQUIPE ====================

  async getTeam(projectId: string) {
    return this.prisma.workTeam.findMany({
      where: { projectId, status: 'ASSIGNED' },
      include: { employee: true },
    })
  }

  async addTeamMember(data: {
    projectId: string
    employeeId: string
    companyId: string
    role?: string
    addedBy: string
  }) {
    return this.prisma.workTeam.create({ data })
  }

  // ==================== MEDIÇÕES ====================

  async getMeasurements(projectId: string) {
    return this.prisma.workMeasurement.findMany({
      where: { projectId },
      orderBy: { recordedAt: 'desc' },
    })
  }

  async createMeasurement(data: {
    projectId: string
    companyId: string
    environment?: string
    height?: any
    width?: any
    depth?: any
    quantity?: number
    unit?: string
    notes?: string
    recordedBy: string
  }) {
    return this.prisma.workMeasurement.create({ data })
  }

  // ==================== OCORRÊNCIAS ====================

  async getOccurrences(projectId: string) {
    return this.prisma.workOccurrence.findMany({
      where: { projectId },
      orderBy: { reportedAt: 'desc' },
    })
  }

  async createOccurrence(data: {
    projectId: string
    companyId: string
    type: string
    title: string
    description?: string
    priority?: string
    reportedBy: string
  }) {
    return this.prisma.workOccurrence.create({ data })
  }

  // ==================== DIÁRIO ====================

  async getDiary(projectId: string, limit = 10) {
    return this.prisma.workDiary.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
      take: limit,
    })
  }

  async createDiaryEntry(data: {
    projectId: string
    companyId: string
    author: string
    description: string
    weather?: string
    weather_temp?: number
    teamPresent?: string
    materialsUsed?: string
  }) {
    return this.prisma.workDiary.create({ data })
  }

  // ==================== CUSTOS ====================

  async getProjectCosts(projectId: string) {
    const costs = await this.prisma.projectCost.findMany({ where: { projectId } })
    const total = costs.reduce((sum, cost) => sum + Number(cost.amount), 0)
    return { costs, total }
  }

  async addCost(projectId: string, data: { description: string; amount: any; category?: string }) {
    return this.prisma.projectCost.create({
      data: { projectId, ...data },
    })
  }

  // ==================== DASH STATS ====================

  async getProjectStats(projectId: string) {
    const [stages, tasks, team, occurrences, costs] = await Promise.all([
      this.prisma.workStage.count({ where: { projectId } }),
      this.prisma.workTask.findMany({
        where: { projectId },
        select: { status: true },
      }),
      this.prisma.workTeam.count({ where: { projectId } }),
      this.prisma.workOccurrence.count({
        where: { projectId, status: 'OPEN' },
      }),
      this.getProjectCosts(projectId),
    ])

    const completed = tasks.filter((t) => t.status === 'COMPLETED').length
    const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0

    return {
      totalStages: stages,
      totalTasks: tasks.length,
      completedTasks: completed,
      progress,
      teamMembers: team,
      openOccurrences: occurrences,
      totalCosts: costs.total,
    }
  }
}

export const workService = new WorkService()
