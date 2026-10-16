// Opción del menú (viene del backend dentro del token)
export interface Modulo {
  descripcion: string;
  url: string;
}

// Datos del usuario que inició sesión (se leen del token)
export interface UserSession {
  username: string;
  nombres: string;
  apellidos: string;
  rol: string;             // JEFE, TECNICO o SISTEMAS
  rolDescripcion: string;  // ej. "Jefe del área"
  modulos: Modulo[];
  expira: number;          // fecha de vencimiento del token (en segundos)
}
