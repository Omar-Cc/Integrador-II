export type RegistroFormData = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegistroPayload = Omit<RegistroFormData, "confirmPassword">;
