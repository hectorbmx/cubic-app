export type Obra = {
  id: number;
  clienteId: number;          // id del cliente en camelCase (uso interno en la app)
  clienteNombre?: string;     // opcional para mostrar en listados
  nombre: string;
  estado: string;             // 'planning' | 'in_progress' | 'completed' | etc.
  progreso: number;           // 0..100
  
};
