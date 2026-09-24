import { FirebaseError } from 'firebase/app';

export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Ocurrió un error inesperado. Intentá de nuevo.';
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'El email ingresado no es válido.';
    case 'auth/user-not-found':
      return 'No existe una cuenta con ese email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Contraseña incorrecta.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese email.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.';
    case 'auth/popup-closed-by-user':
      return 'Se cerró la ventana de Google antes de completar el inicio de sesión.';
    default:
      return 'No se pudo completar la operación. Intentá de nuevo.';
  }
}