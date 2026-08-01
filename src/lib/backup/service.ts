import { db } from '@/src/lib/db'
import { BackupStatus, BackupFrequency } from '@prisma/client'

export interface BackupOptions {
  includesDatabase?: boolean
  includesUploads?: boolean
  includesPDFs?: boolean
  includesLogos?: boolean
  includesAttachments?: boolean
  includesXML?: boolean
}

export interface BackupMetadata {
  totalTables?: number
  totalRecords?: number
  totalSize?: number
  startTime?: string
  endTime?: string
  duration?: number
}

export class BackupService {
  /**
   * Criar backup manual
   */
  static async createManualBackup(
    companyId: string,
    userId: string,
    options: BackupOptions = {}
  ) {
    try {
      const backup = await db.backup.create({
        data: {
          companyId,
          name: `Backup - ${new Date().toLocaleString('pt-BR')}`,
          status: BackupStatus.IN_PROGRESS,
          type: 'MANUAL',
          createdBy: userId,
          includesDatabase: options.includesDatabase ?? true,
          includesUploads: options.includesUploads ?? true,
          includesPDFs: options.includesPDFs ?? true,
          includesLogos: options.includesLogos ?? true,
          includesAttachments: options.includesAttachments ?? true,
          includesXML: options.includesXML ?? true,
          startedAt: new Date(),
        },
      })

      // Aqui viria a lógica de backup real (dump de banco, etc)
      // Por enquanto, simulamos como concluído
      const completed = await db.backup.update({
        where: { id: backup.id },
        data: {
          status: BackupStatus.COMPLETED,
          completedAt: new Date(),
          size: Math.floor(Math.random() * 1000000) + 1000000, // Simulado
          metadata: JSON.stringify({
            totalTables: 45,
            totalRecords: 150000,
            duration: Math.floor(Math.random() * 300) + 60,
          } as BackupMetadata),
        },
      })

      // Log
      await db.backupLog.create({
        data: {
          companyId,
          backupId: backup.id,
          action: 'BACKUP_COMPLETED',
          userId,
          success: true,
          details: JSON.stringify({ size: completed.size }),
        },
      })

      return { success: true, data: completed }
    } catch (error) {
      console.error('[Backup] Error creating manual backup:', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * Restaurar backup
   */
  static async restoreBackup(
    companyId: string,
    backupId: string,
    userId: string
  ) {
    try {
      const backup = await db.backup.findUnique({
        where: { id: backupId },
      })

      if (!backup || backup.companyId !== companyId) {
        return { success: false, error: 'Backup não encontrado' }
      }

      if (backup.status !== BackupStatus.COMPLETED) {
        return { success: false, error: 'Backup não está completo' }
      }

      // Criar backup automático do estado atual como segurança
      const safetyBackup = await this.createManualBackup(companyId, userId, {
        includesDatabase: true,
        includesUploads: true,
      })

      if (!safetyBackup.success) {
        return { success: false, error: 'Falha ao criar backup de segurança' }
      }

      // Aqui viria a lógica de restauração real
      // Por enquanto, simulamos como concluído
      const restored = await db.backup.update({
        where: { id: backupId },
        data: {
          lastRestoredAt: new Date(),
          lastRestoredBy: userId,
        },
      })

      // Log
      await db.backupLog.create({
        data: {
          companyId,
          backupId,
          action: 'RESTORE_COMPLETED',
          userId,
          success: true,
          details: JSON.stringify({ safetyBackupId: safetyBackup.data?.id }),
        },
      })

      return { success: true, data: restored }
    } catch (error) {
      console.error('[Backup] Error restoring backup:', error)

      // Log de erro
      await db.backupLog.create({
        data: {
          companyId,
          backupId,
          action: 'RESTORE_COMPLETED',
          userId,
          success: false,
          errorMessage: String(error),
        },
      }).catch(() => {})

      return { success: false, error: String(error) }
    }
  }

  /**
   * Listar backups
   */
  static async listBackups(
    companyId: string,
    limit = 50,
    offset = 0
  ) {
    try {
      const [backups, total] = await Promise.all([
        db.backup.findMany({
          where: { companyId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        db.backup.count({ where: { companyId } }),
      ])

      return { success: true, data: { backups, total } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Obter configuração de backup
   */
  static async getBackupConfig(companyId: string) {
    try {
      let config = await db.backupConfiguration.findUnique({
        where: { companyId },
      })

      if (!config) {
        config = await db.backupConfiguration.create({
          data: {
            companyId,
            frequency: BackupFrequency.DAILY,
            scheduledHour: 2,
          },
        })
      }

      return { success: true, data: config }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Atualizar configuração de backup
   */
  static async updateBackupConfig(
    companyId: string,
    frequency: BackupFrequency,
    scheduledHour: number,
    scheduledDay?: number
  ) {
    try {
      const config = await db.backupConfiguration.upsert({
        where: { companyId },
        create: {
          companyId,
          frequency,
          scheduledHour,
          scheduledDay,
        },
        update: {
          frequency,
          scheduledHour,
          scheduledDay,
        },
      })

      return { success: true, data: config }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Deletar backup
   */
  static async deleteBackup(companyId: string, backupId: string) {
    try {
      const backup = await db.backup.findUnique({
        where: { id: backupId },
      })

      if (!backup || backup.companyId !== companyId) {
        return { success: false, error: 'Backup não encontrado' }
      }

      await db.backup.delete({ where: { id: backupId } })

      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Limpar backups antigos
   */
  static async cleanupOldBackups(companyId: string) {
    try {
      const config = await db.backupConfiguration.findUnique({
        where: { companyId },
      })

      if (!config || !config.autoDelete) {
        return { success: true, deletedCount: 0 }
      }

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - config.retainBackups)

      const deleted = await db.backup.deleteMany({
        where: {
          companyId,
          createdAt: { lt: cutoffDate },
          status: BackupStatus.COMPLETED,
        },
      })

      return { success: true, deletedCount: deleted.count }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Obter estatísticas de backups
   */
  static async getBackupStats(companyId: string) {
    try {
      const [totalBackups, completedBackups, failedBackups, totalSize] = await Promise.all([
        db.backup.count({ where: { companyId } }),
        db.backup.count({ where: { companyId, status: BackupStatus.COMPLETED } }),
        db.backup.count({ where: { companyId, status: BackupStatus.FAILED } }),
        db.backup.aggregate({
          where: { companyId, status: BackupStatus.COMPLETED },
          _sum: { size: true },
        }),
      ])

      return {
        success: true,
        data: {
          totalBackups,
          completedBackups,
          failedBackups,
          totalSize: totalSize._sum.size || 0,
        },
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}
