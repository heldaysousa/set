import { Service } from '@/types/supabase'

export const mockServices: Service[] = [
  {
    id: '1',
    business_id: 'mock-business-id-123',
    name: 'Corte Masculino',
    description: 'Corte moderno com acabamento em navalha',
    price: 50.00,
    duration: 30,
    category: 'cabelo',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    professionals: [
      {
        professional: {
          id: '1',
          name: 'João Silva'
        }
      },
      {
        professional: {
          id: '2',
          name: 'Pedro Santos'
        }
      }
    ]
  },
  {
    id: '2',
    business_id: 'mock-business-id-123',
    name: 'Barba',
    description: 'Barba completa com toalha quente',
    price: 35.00,
    duration: 30,
    category: 'barba',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    professionals: [
      {
        professional: {
          id: '1',
          name: 'João Silva'
        }
      }
    ]
  },
  {
    id: '3',
    business_id: 'mock-business-id-123',
    name: 'Coloração',
    description: 'Coloração profissional com produtos de alta qualidade',
    price: 150.00,
    duration: 120,
    category: 'cabelo',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    professionals: [
      {
        professional: {
          id: '3',
          name: 'Maria Oliveira'
        }
      }
    ]
  }
]
