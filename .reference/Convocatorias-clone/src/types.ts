export interface Convocatoria {
  id: string;
  title: string;
  category: string;
  status: 'abierta' | 'proximamente' | 'cerrada';
  deadline?: string;
  openingDate?: string;
  location: string;
  image: string;
}

export interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
}
