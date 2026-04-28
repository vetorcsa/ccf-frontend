"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { uploadBatch as uploadBatchRequest } from "../services/batches.service";

type UseBatchUploadOptions = {
  onSuccess?: () => void | Promise<void>;
  closeDelayMs?: number;
};

const DEFAULT_CLOSE_DELAY_MS = 700;
const configuredMaxBatchUploadFiles = Number(process.env.NEXT_PUBLIC_BATCH_UPLOAD_MAX_FILES);
export const MAX_BATCH_UPLOAD_FILES =
  Number.isInteger(configuredMaxBatchUploadFiles) && configuredMaxBatchUploadFiles > 0
    ? configuredMaxBatchUploadFiles
    : 2000;
export const BATCH_UPLOAD_FILE_LIMIT_MESSAGE = `Para melhor estabilidade, envie até ${MAX_BATCH_UPLOAD_FILES} XMLs por vez.`;

export function useBatchUpload({
  onSuccess,
  closeDelayMs = DEFAULT_CLOSE_DELAY_MS,
}: UseBatchUploadOptions = {}) {
  const closeTimeoutRef = useRef<number | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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

  function resetState() {
    setBatchName("");
    setSelectedFiles([]);
    setIsSubmitting(false);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function openModal() {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    resetState();
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
    resetState();
  }

  function isXmlFile(file: File): boolean {
    const name = file.name.toLowerCase();
    const mime = file.type.toLowerCase();
    return name.endsWith(".xml") || mime.includes("xml");
  }

  function extractUploadErrorMessage(error: unknown): string {
    if (!axios.isAxiosError(error)) {
      return "Não foi possível concluir o envio do lote.";
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

      if (Array.isArray(typedData.message)) {
        const firstMessage = typedData.message.find((message) => typeof message === "string");
        if (typeof firstMessage === "string") {
          return firstMessage;
        }
      }
    }

    return "Não foi possível concluir o envio do lote.";
  }

  function updateBatchName(value: string) {
    setBatchName(value);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function selectFiles(files: FileList | null) {
    const nextFiles = files ? Array.from(files) : [];

    if (nextFiles.length > MAX_BATCH_UPLOAD_FILES) {
      setSelectedFiles([]);
      setErrorMessage(
        `Quantidade máxima de arquivos por envio excedida. Você selecionou ${nextFiles.length} arquivo(s). ${BATCH_UPLOAD_FILE_LIMIT_MESSAGE}`,
      );
      setSuccessMessage("");
      return;
    }

    setSelectedFiles(nextFiles);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function removeFileAt(index: number) {
    setSelectedFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index));
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function confirmUpload() {
    const trimmedName = batchName.trim();

    if (!trimmedName) {
      setErrorMessage("Informe o nome do lote para continuar.");
      setSuccessMessage("");
      return;
    }

    if (selectedFiles.length === 0) {
      setErrorMessage("Selecione ao menos um arquivo XML para continuar.");
      setSuccessMessage("");
      return;
    }

    if (selectedFiles.length > MAX_BATCH_UPLOAD_FILES) {
      setErrorMessage(`Quantidade máxima de arquivos por envio excedida. ${BATCH_UPLOAD_FILE_LIMIT_MESSAGE}`);
      setSuccessMessage("");
      return;
    }

    const invalidFile = selectedFiles.find((file) => !isXmlFile(file));
    if (invalidFile) {
      setErrorMessage(`Arquivo inválido: ${invalidFile.name}. Selecione apenas XML (.xml).`);
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await uploadBatchRequest(trimmedName, selectedFiles);
      const acceptedFiles = response.files?.accepted;
      const receivedText =
        typeof acceptedFiles === "number" && acceptedFiles > 0
          ? `Lote recebido com ${acceptedFiles} arquivo(s).`
          : "Lote recebido com sucesso.";

      setSuccessMessage(`${receivedText} O processamento continuará em background.`);

      if (onSuccess) {
        await onSuccess();
      }

      closeTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(false);
        resetState();
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
    batchName,
    selectedFiles,
    isSubmitting,
    errorMessage,
    successMessage,
    openModal,
    closeModal,
    updateBatchName,
    selectFiles,
    removeFileAt,
    confirmUpload,
  };
}
