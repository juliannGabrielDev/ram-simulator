// Define la estructura de un objeto de proceso.
export interface Process {
  // El nombre del proceso.
  name: string;
  // El tamaño del proceso en MB.
  size: number;
  // La ubicación del proceso en la memoria.
  location: 'RAM' | 'Virtual' | 'Inactive';
  // El nombre del archivo de icono para el proceso (opcional).
  icon?: string;
  // Prioridad del proceso (1 = más alta, 5 = más baja).
  priority: 1 | 2 | 3 | 4 | 5;
}