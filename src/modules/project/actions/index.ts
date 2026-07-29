'use server'

import { getCurrentUser } from '@/src/core/auth'
import { ProjectService } from '@/services'

export async function getActiveProjects() {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const projectService = new ProjectService()
    const projects = await projectService.getActiveProjectsWithAnalysis({
      companyId: user.companyId,
    })

    return { data: projects }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getProjectFinancialStatus(projectId: string) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const projectService = new ProjectService()
    const status = await projectService.getProjectFinancialStatus(projectId, {
      companyId: user.companyId,
    })

    return { data: status }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getProjectsByStatus(status: string) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const projectService = new ProjectService()
    const projects = await projectService.getProjectsByStatus(status, {
      companyId: user.companyId,
    })

    return { data: projects }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function countActiveProjects() {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const projectService = new ProjectService()
    const count = await projectService.countActiveProjects({
      companyId: user.companyId,
    })

    return { data: count }
  } catch (error: any) {
    return { error: error.message }
  }
}
