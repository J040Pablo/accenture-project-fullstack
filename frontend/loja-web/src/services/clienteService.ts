import { api } from './api';
import { isAxiosError } from 'axios';
import type { Cliente, ClienteRequest } from '../types/Cliente';

export interface ClienteApiFieldError {
  field: string | undefined;
  message: string;
}

export interface ClienteApiErrorInfo {
  message?: string;
  fieldErrors: ClienteApiFieldError[];
  statusCode?: number;
  isUnexpected: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function pickMessage(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const candidates = [
    value.mensagem,
    value.message,
    value.defaultMessage,
    value.error,
    value.detail,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  return undefined;
}

function pickField(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const candidates = [value.campo, value.field, value.path, value.property];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  return undefined;
}

function parseFieldErrors(source: unknown): ClienteApiFieldError[] {
  if (!source) {
    return [];
  }

  if (Array.isArray(source)) {
    const parsed: ClienteApiFieldError[] = [];

    for (const entry of source) {
      const message = pickMessage(entry);
      if (!message) {
        continue;
      }

      parsed.push({
        field: pickField(entry),
        message,
      });
    }

    return parsed;
  }

  if (isRecord(source)) {
    const parsed: ClienteApiFieldError[] = [];

    for (const [field, value] of Object.entries(source)) {
      const message = Array.isArray(value)
        ? value.find((item) => typeof item === 'string' && item.trim())
        : pickMessage(value) ?? (typeof value === 'string' ? value : undefined);

      if (!message) {
        continue;
      }

      parsed.push({ field, message });
    }

    return parsed;
  }

  return [];
}

export function extrairErroCliente(error: unknown): ClienteApiErrorInfo {
  if (!isAxiosError(error)) {
    return {
      message: 'Erro inesperado ao processar a solicitação.',
      fieldErrors: [],
      isUnexpected: true,
    };
  }

  const statusCode = error.response?.status;
  const data = error.response?.data;
  const isUnexpected =
    !error.response ||
    (typeof statusCode === 'number' && statusCode >= 500) ||
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED';

  if (!isRecord(data)) {
    return {
      message: isUnexpected ? 'Erro inesperado ao processar a solicitação.' : error.message,
      fieldErrors: [],
      statusCode,
      isUnexpected,
    };
  }

  const directField = pickField(data);
  const directMessage = pickMessage(data);

  const fieldErrors = [
    ...parseFieldErrors(data.errors),
    ...parseFieldErrors(data.erros),
    ...parseFieldErrors(data.fieldErrors),
    ...parseFieldErrors(data.violations),
    ...(directField && directMessage ? [{ field: directField, message: directMessage }] : []),
  ];

  return {
    message: directMessage,
    fieldErrors,
    statusCode,
    isUnexpected,
  };
}

export const clienteService = {
  listar: async (): Promise<Cliente[]> => {
    const res = await api.get<Cliente[]>('/clientes');
    return res.data;
  },

  buscarPorId: async (id: number): Promise<Cliente> => {
    const res = await api.get<Cliente>(`/clientes/${id}`);
    return res.data;
  },

  cadastrar: async (dto: ClienteRequest): Promise<Cliente> => {
    const res = await api.post<Cliente>('/clientes', dto);
    return res.data;
  },

  atualizar: async (id: number, dto: ClienteRequest): Promise<Cliente> => {
    const res = await api.put<Cliente>(`/clientes/${id}`, dto);
    return res.data;
  },

  deletar: async (id: number): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },
};