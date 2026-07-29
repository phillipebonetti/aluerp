/**
 * File Upload Component
 * Componente reutilizável para upload de arquivos com validação e preview
 */

'use client'

import { useState, useCallback } from 'react'
import { formatFileSize, getFileIcon, StorageFolder } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Upload, Trash2, FileIcon } from 'lucide-react'

interface FileUploadProps {
  folder: StorageFolder
  onFileSelect: (files: File[]) => void
  multiple?: boolean
  maxFiles?: number
  disabled?: boolean
}

export function FileUpload({
  folder,
  onFileSelect,
  multiple = false,
  maxFiles = 5,
  disabled = false,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (multiple && selectedFiles.length + files.length > maxFiles) {
        alert(`Máximo de ${maxFiles} arquivos permitidos`)
        return
      }

      const newFiles = multiple ? [...selectedFiles, ...files] : files
      setSelectedFiles(newFiles)
      onFileSelect(newFiles)
    },
    [selectedFiles, multiple, maxFiles, onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files)
      handleFileChange({ target: { files: new DataTransfer().items } as any })
    },
    [handleFileChange]
  )

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-accent/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Arraste arquivos aqui ou clique para selecionar</p>
          <p className="text-xs text-muted-foreground mt-1">
            {multiple ? `Máximo ${maxFiles} arquivos` : 'Um arquivo por vez'}
          </p>
          <input
            type="file"
            onChange={handleFileChange}
            multiple={multiple}
            disabled={disabled}
            className="hidden"
            accept={`.pdf,.jpg,.jpeg,.png,.mp4,.docx,.xlsx`}
          />
        </div>
      </label>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Arquivos selecionados ({selectedFiles.length})</p>
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-lg">{getFileIcon(file.type)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                type="button"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
