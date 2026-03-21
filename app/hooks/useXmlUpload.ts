"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { uploadFile as uploadFileRequest } from "../services/files.service";

type UseXmlUploadOptions = {
  onSuccess?: () => void | Promise<void>;
  closeDelayMs?: number;
};

const DEFAULT_CLOSE_DELAY_MS = 700;

export function useXmlUpload({
  onSuccess,
  closeDelayMs = DEFAULT_CLOSE_DELAY_MS,
}: UseXmlUploadOptions = {}) {
  const closeTimeoutRef = useRef<number | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  function resetUploadState() {
    setSelectedFile(null);
    setIsSubmitting(false);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function openModal() {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    resetUploadState();
    setIsOpen(true);
  }

  function closeModal() {
    if (isSubmitting || !!successMessage) {
      return;
    }

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setIsOpen(false);
    resetUploadState();
  }

  function isXmlFile(file: File): boolean {
    const name = file.name.toLowerCase();
    const mime = file.type.toLowerCase();
    return name.endsWith(".xml") || mime.includes("xml");
  }

  function extractUploadErrorMessage(error: unknown): string {
    if (!axios.isAxiosError(error)) {
      return "Não foi possível concluir o upload do arquivo.";
    }

    const responseData = error.response?.data;
    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData
    ) {
      const typedData = responseData as { message?: unknown };
      if (typeof typedData.message === "string") {
        return typedData.message;
      }
    }

    return "Não foi possível concluir o upload do arquivo.";
  }

  function selectFile(file: File | null) {
    setSelectedFile(file);
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function confirmUpload() {
    if (!selectedFile) {
      setErrorMessage("Selecione um arquivo XML para continuar.");
      setSuccessMessage("");
      return;
    }

    if (!isXmlFile(selectedFile)) {
      setErrorMessage("Arquivo inválido. Selecione um XML (.xml).");
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await uploadFileRequest(selectedFile);
      setSuccessMessage("Upload concluído com sucesso.");

      if (onSuccess) {
        await onSuccess();
      }

      closeTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(false);
        resetUploadState();
        closeTimeoutRef.current = null;
      }, closeDelayMs);
    } catch (error) {
      setErrorMessage(extractUploadErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isOpen,
    selectedFile,
    isSubmitting,
    errorMessage,
    successMessage,
    openModal,
    closeModal,
    selectFile,
    confirmUpload,
  };
}
