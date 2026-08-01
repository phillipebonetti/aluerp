'use server'

import { BackupService } from '@/src/lib/backup/service'
import { BackupFrequency } from '@prisma/client'

export async function createBackupAction(companyId: string, userId: string) {
  return BackupService.createManualBackup(companyId, userId)
}

export async function restoreBackupAction(
  companyId: string,
  backupId: string,
  userId: string
) {
  return BackupService.restoreBackup(companyId, backupId, userId)
}

export async function listBackupsAction(companyId: string, page = 1, pageSize = 50) {
  return BackupService.listBackups(companyId, pageSize, (page - 1) * pageSize)
}

export async function getBackupConfigAction(companyId: string) {
  return BackupService.getBackupConfig(companyId)
}

export async function updateBackupConfigAction(
  companyId: string,
  frequency: BackupFrequency,
  scheduledHour: number,
  scheduledDay?: number
) {
  return BackupService.updateBackupConfig(companyId, frequency, scheduledHour, scheduledDay)
}

export async function deleteBackupAction(companyId: string, backupId: string) {
  return BackupService.deleteBackup(companyId, backupId)
}

export async function getBackupStatsAction(companyId: string) {
  return BackupService.getBackupStats(companyId)
}
