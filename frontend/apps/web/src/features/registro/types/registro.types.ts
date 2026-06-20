export type RegistroFormData = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono: string;
  documento: string;
  direccion: string;
};

export type RegistroPayload = {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  documento: string;
  direccion: string;
};
