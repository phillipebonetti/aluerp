'use server'

import { getSession } from '@/src/core/auth'
import { ProjectService } from '@/services'

export async function getActiveProjects() {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const projectService = new ProjectService()
    const projects = await projectService.getActiveProjectsWithAnalysis({
      companyId: session.company.id,
    })

    return { data: projects }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

export async function getProjectFinancialStatus(projectId: string) {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const projectService = new ProjectService()
    const status = await projectService.getProjectFinancialStatus(projectId, {
      companyId: session.company.id,
    })

    return { data: status }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

export async function getProjectsByStatus(status: string) {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const projectService = new ProjectService()
    const projects = await projectService.getProjectsByStatus(status, {
      companyId: session.company.id,
    })

    return { data: projects }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

export async function countActiveProjects() {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const projectService = new ProjectService()
    const count = await projectService.countActiveProjects({
      companyId: session.company.id,
    })

    return { data: count }
  } catch (error: unknown) {
    return { error: error.message }
  }
}
