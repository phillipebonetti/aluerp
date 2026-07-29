/**
 * Storage Service
 * Gerencia uploads, downloads, versionamento e exclusão de arquivos
 */

import prisma from '@/lib/prisma'
import { generateStoragePath, getValidationForFolder, StorageFolder } from '@/lib/storage'
import type { RepositoryOptions } from '@/repositories'

export class StorageService {
  /**
   * Registrar upload de documento de projeto
   */
  async uploadProjectDocument(
    options: RepositoryOptions,
    projectId: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    uploadedBy: string,
    description?: string
  ) {
    const storagePath = generateStoragePath('obras', options.companyId, fileName)

    // Criar novo documento
    const document = await prisma.projectDocument.create({
      data: {
        companyId: options.companyId,
        projectId,
        fileName,
        fileSize,
        mimeType,
        uploadedBy,
        description,
        version: 1,
        isLatest: true,
      },
    })

    return document
  }

  /**
   * Upload nova versão de documento
   */
  async uploadDocumentVersion(
    documentId: string,
    fileName: string,
    fileSize: number,
    uploadedBy: string,
    description?: string
  ) {
    // Obter documento existente
    const doc = await prisma.projectDocument.findUnique({
      where: { id: documentId },
    })

    if (!doc) throw new Error('Documento não encontrado')

    // Marcar versão anterior como não-latest
    await prisma.projectDocument.update({
      where: { id: documentId },
      data: { isLatest: false },
    })

    const newVersion = doc.version + 1

    // Criar nova versão
    const version = await prisma.documentVersion.create({
      data: {
        documentId,
        version: newVersion,
        fileName,
        fileSize,
        uploadedBy,
        description,
        url: generateStoragePath('obras', doc.companyId, fileName, newVersion),
      },
    })

    // Atualizar documento com nova versão
    await prisma.projectDocument.update({
      where: { id: documentId },
      data: {
        version: newVersion,
        isLatest: true,
        uploadedBy,
      },
    })

    return version
  }

  /**
   * Listar versões de um documento
   */
  async getDocumentVersions(documentId: string) {
    return prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { version: 'desc' },
    })
  }

  /**
   * Restaurar versão anterior
   */
  async restoreDocumentVersion(documentId: string, version: number) {
    const versionToRestore = await prisma.documentVersion.findUnique({
      where: {
        documentId_version: { documentId, version },
      },
    })

    if (!versionToRestore) throw new Error('Versão não encontrada')

    // Marcar atual como não-latest
    const current = await prisma.projectDocument.findUnique({
      where: { id: documentId },
    })

    if (!current) throw new Error('Documento não encontrado')

    // Criar nova versão baseada na anterior
    return this.uploadDocumentVersion(
      documentId,
      versionToRestore.fileName,
      versionToRestore.fileSize,
      current.uploadedBy,
      `Restaurado de v${version}`
    )
  }

  /**
   * Deletar documento
   */
  async deleteDocument(documentId: string) {
    return prisma.projectDocument.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    })
  }

  /**
   * Deletar versão específica (não a mais recente)
   */
  async deleteDocumentVersion(documentId: string, version: number) {
    return prisma.documentVersion.delete({
      where: {
        documentId_version: { documentId, version },
      },
    })
  }

  /**
   * Listar documentos de projeto
   */
  async getProjectDocuments(projectId: string, includeDeleted = false) {
    return prisma.projectDocument.findMany({
      where: {
        projectId,
        deletedAt: includeDeleted ? undefined : null,
      },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 3, // Últimas 3 versões
        },
      },
      orderBy: { uploadedAt: 'desc' },
    })
  }

  /**
   * Validar arquivo antes de upload
   */
  validateFile(file: File, folder: StorageFolder): { valid: boolean; error?: string } {
    const validation = getValidationForFolder(folder)

    if (file.size > validation.maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo: ${Math.round(validation.maxSize / 1024 / 1024)}MB`,
      }
    }

    if (!validation.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Aceitos: ${validation.allowedTypes.join(', ')}`,
      }
    }

    return { valid: true }
  }
}

export const storageService = new StorageService()
