"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Send, FileText, ImageIcon, Film, Music } from "lucide-react"
import { formatFileSize, getFileType } from "@/utils/media-utils"
import Image from "next/image"

interface MediaPreviewProps {
  files: File[]
  onClose: () => void
  onSend: (files: File[]) => void
}

export function MediaPreview({ files, onClose, onSend }: MediaPreviewProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>(files)

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    if (selectedFiles.length <= 1) {
      onClose()
    }
  }

  const getFileIcon = (file: File) => {
    const type = getFileType(file)
    switch (type) {
      case "image":
        return <ImageIcon className="h-6 w-6" />
      case "video":
        return <Film className="h-6 w-6" />
      case "audio":
        return <Music className="h-6 w-6" />
      default:
        return <FileText className="h-6 w-6" />
    }
  }

  const renderPreview = (file: File, index: number) => {
    const type = getFileType(file)
    const url = URL.createObjectURL(file)

    return (
      <div key={index} className="relative rounded-lg border p-2">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 z-10 h-6 w-6 rounded-full bg-black/50 text-white hover:bg-black/70"
          onClick={() => removeFile(index)}
        >
          <X className="h-3 w-3" />
        </Button>

        <div className="mb-2 aspect-square overflow-hidden rounded-md">
          {type === "image" ? (
            <div className="relative h-full w-full">
              <Image src={url || "/placeholder.svg"} alt={file.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
              {getFileIcon(file)}
            </div>
          )}
        </div>

        <div className="text-xs truncate font-medium">{file.name}</div>
        <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Share Media</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {selectedFiles.map((file, index) => renderPreview(file, index))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" className="mr-2" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onSend(selectedFiles)}>
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </CardFooter>
    </Card>
  )
}
