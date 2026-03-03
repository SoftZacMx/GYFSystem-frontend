import { toast } from 'sonner';
import { ApiError } from '@/types/api';

export interface ConfirmDeleteOptions {
  /** Mensaje del toast (ej. "¿Eliminar este documento?") */
  message: string;
  /** Función async que ejecuta la eliminación. Puede incluir refresh en el .then() */
  execute: () => Promise<void>;
  /** Mensaje del toast de éxito (ej. "Documento eliminado") */
  successMessage?: string;
  /** Mensaje por defecto en error si la excepción no es ApiError */
  errorMessage?: string;
  /** Texto del botón de acción (por defecto "Eliminar"; usar "Desasociar" etc. si aplica) */
  actionLabel?: string;
}

const DEFAULT_SUCCESS = 'Eliminado';
const DEFAULT_ERROR = 'Error al eliminar';

/**
 * Muestra un toast de confirmación con botones Eliminar/Cancelar.
 * Si el usuario confirma, ejecuta `execute()` y muestra éxito o error.
 */
export function confirmDelete({
  message,
  execute,
  successMessage = DEFAULT_SUCCESS,
  errorMessage = DEFAULT_ERROR,
  actionLabel = 'Eliminar',
}: ConfirmDeleteOptions): void {
  toast(message, {
    duration: 10000,
    action: {
      label: actionLabel,
      onClick: () => {
        execute()
          .then(() => toast.success(successMessage))
          .catch((err) =>
            toast.error(err instanceof ApiError ? err.message : errorMessage)
          );
      },
    },
    cancel: { label: 'Cancelar', onClick: () => {} },
  });
}
