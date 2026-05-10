export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'bebida' | 'snack' | 'equipo' | 'promocion';
}

export type TeamLevel = 'principiante' | 'intermedio' | 'avanzado';

export interface SearchEvent {
  id: string;
  type: 'players' | 'rival';
  creatorName: string;
  creatorTeamName?: string;
  teamLevel: TeamLevel;
  matchName: string;
  fieldName: string;
  location: string;
  date: string;
  time: string;
  duration: number;
  fieldType: string;
  playersNeeded?: number;
  positionNeeded?: string;
  message: string;
  currentPlayers?: number;
  maxPlayers?: number;
}

export interface Field {
  id: string;
  name: string;
  location: string;
  image: string;
  available: number;
  total: number;
  price: number;
  type: '5v5' | '7v7' | '11v11';
  rating: number;
  hasFullVaso: boolean;
  fullVasoPromo?: string;
  amenities: string[];
  products: Product[];
}

const commonProducts: Product[] = [
  {
    id: 'p1',
    name: 'Agua San Luis 625ml',
    description: 'Agua mineral sin gas',
    price: 2.50,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    category: 'bebida'
  },
  {
    id: 'p2',
    name: 'Gatorade 500ml',
    description: 'Bebida rehidratante, varios sabores',
    price: 5.00,
    image: 'https://images.unsplash.com/photo-1629385982145-8c5f9fd7da27?w=400',
    category: 'bebida'
  },
  {
    id: 'p3',
    name: 'Coca Cola 500ml',
    description: 'Gaseosa clásica',
    price: 4.00,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
    category: 'bebida'
  },
  {
    id: 'p4',
    name: 'Papas Lays',
    description: 'Papas fritas clásicas 150g',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
    category: 'snack'
  },
  {
    id: 'p5',
    name: 'Snickers',
    description: 'Barra de chocolate con maní',
    price: 3.00,
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4cbc3b97?w=400',
    category: 'snack'
  },
  {
    id: 'p6',
    name: 'Balón Premium Nike',
    description: 'Balón profesional de fútbol',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1614632537239-d3d6e8aeb1fd?w=400',
    category: 'equipo'
  }
];

export const mockFields: Field[] = [
  {
    id: '1',
    name: 'Canchita La Merced',
    location: 'Tahuaycani',
    image: 'https://images.unsplash.com/photo-1641029185333-7ed62a19d5f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBmaWVsZCUyMGFlcmlhbHxlbnwxfHx8fDE3NTk5ODI2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 2,
    total: 10,
    price: 35,
    type: '11v11',
    rating: 4.8,
    hasFullVaso: true,
    fullVasoPromo: '2x1 en cervezas al reservar + Piqueo gratis',
    amenities: ['Duchas', 'Vestuarios', 'Estacionamiento', 'Iluminación'],
    products: [
      {
        id: 'promo1',
        name: 'Full Vaso Premium',
        description: '2x1 en cervezas al reservar + Piqueo gratis',
        price: 25.00,
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
        category: 'promocion'
      },
      ...commonProducts
    ]
  },
  {
    id: '2',
    name: 'Estadio Zona Sur',
    location: 'Santa Bárbara',
    image: 'https://images.unsplash.com/photo-1680537732560-7dd5f9b1ed53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBzb2NjZXIlMjBjb3VydHxlbnwxfHx8fDE3NTk5NjA3NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 5,
    total: 10,
    price: 45,
    type: '7v7',
    rating: 4.6,
    hasFullVaso: false,
    amenities: ['Vestuarios', 'Estacionamiento', 'Iluminación'],
    products: commonProducts
  },
  {
    id: '3',
    name: 'Cancha Los Pinos',
    location: 'Centro',
    image: 'https://images.unsplash.com/photo-1663380821666-aa8aa44fc445?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMGZpZWxkJTIwZ3Jhc3N8ZW58MXx8fHwxNzYwMDQ1OTIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 0,
    total: 10,
    price: 40,
    type: '5v5',
    rating: 4.5,
    hasFullVaso: true,
    fullVasoPromo: 'Balde de 5 cervezas con piqueo incluido - S/25',
    amenities: ['Duchas', 'Iluminación'],
    products: [
      {
        id: 'promo3',
        name: 'Balde Full Vaso',
        description: 'Balde de 5 cervezas con piqueo incluido',
        price: 25.00,
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
        category: 'promocion'
      },
      ...commonProducts
    ]
  },
  {
    id: '4',
    name: 'Complejo Deportivo Norte',
    location: 'Tahuaycani',
    image: 'https://images.unsplash.com/photo-1641029185333-7ed62a19d5f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBmaWVsZCUyMGFlcmlhbHxlbnwxfHx8fDE3NTk5ODI2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 3,
    total: 10,
    price: 50,
    type: '11v11',
    rating: 4.9,
    hasFullVaso: false,
    amenities: ['Duchas', 'Vestuarios', 'Estacionamiento', 'Iluminación'],
    products: commonProducts
  },
  {
    id: '5',
    name: 'Arena Futsal Pro',
    location: 'Centro',
    image: 'https://images.unsplash.com/photo-1680537732560-7dd5f9b1ed53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBzb2NjZXIlMjBjb3VydHxlbnwxfHx8fDE3NTk5NjA3NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: 4,
    total: 8,
    price: 55,
    type: '5v5',
    rating: 4.7,
    hasFullVaso: true,
    fullVasoPromo: '3 cervezas + Nachos - S/20 (Solo fines de semana)',
    amenities: ['Duchas', 'Vestuarios', 'Estacionamiento'],
    products: [
      {
        id: 'promo5',
        name: 'Combo Weekend',
        description: '3 cervezas + Nachos (Solo fines de semana)',
        price: 20.00,
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
        category: 'promocion'
      },
      ...commonProducts
    ]
  }
];
