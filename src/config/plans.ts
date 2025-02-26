export type PlanId = 'starter' | 'pro' | 'enterprise'

export interface PlanFeature {
  title: string
  description: string
  included: boolean
  limit?: number
}

export interface Plan {
  id: PlanId
  name: string
  price: number
  description: string
  features: PlanFeature[]
}

export const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49.90,
    description: 'Ideal para profissionais autônomos',
    features: [
      {
        title: 'Agendamentos',
        description: 'Agendamentos mensais',
        included: true,
        limit: 50
      },
      {
        title: 'Profissionais',
        description: 'Número de profissionais',
        included: true,
        limit: 1
      },
      {
        title: 'Clientes',
        description: 'Base de clientes',
        included: true,
        limit: 100
      },
      {
        title: 'Agenda Online',
        description: 'Link para agendamento online',
        included: true
      },
      {
        title: 'Lembretes WhatsApp',
        description: 'Lembretes automáticos via WhatsApp',
        included: true
      }
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 99.90,
    description: 'Perfeito para pequenos salões',
    features: [
      {
        title: 'Agendamentos',
        description: 'Agendamentos mensais',
        included: true,
        limit: 200
      },
      {
        title: 'Profissionais',
        description: 'Número de profissionais',
        included: true,
        limit: 5
      },
      {
        title: 'Clientes',
        description: 'Base de clientes',
        included: true,
        limit: 500
      },
      {
        title: 'Agenda Online',
        description: 'Link para agendamento online',
        included: true
      },
      {
        title: 'Lembretes WhatsApp',
        description: 'Lembretes automáticos via WhatsApp',
        included: true
      },
      {
        title: 'Relatórios Básicos',
        description: 'Relatórios de desempenho básicos',
        included: true
      },
      {
        title: 'Controle Financeiro',
        description: 'Gestão financeira básica',
        included: true
      }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199.90,
    description: 'Para salões em crescimento',
    features: [
      {
        title: 'Agendamentos',
        description: 'Agendamentos mensais',
        included: true
      },
      {
        title: 'Profissionais',
        description: 'Número de profissionais',
        included: true,
        limit: 15
      },
      {
        title: 'Clientes',
        description: 'Base de clientes',
        included: true
      },
      {
        title: 'Agenda Online',
        description: 'Link para agendamento online',
        included: true
      },
      {
        title: 'Lembretes WhatsApp',
        description: 'Lembretes automáticos via WhatsApp',
        included: true
      },
      {
        title: 'Relatórios Avançados',
        description: 'Relatórios e análises avançadas',
        included: true
      },
      {
        title: 'Controle Financeiro',
        description: 'Gestão financeira completa',
        included: true
      },
      {
        title: 'Gestão de Estoque',
        description: 'Controle de estoque completo',
        included: true
      },
      {
        title: 'Marketing Integrado',
        description: 'Ferramentas de marketing e CRM',
        included: true
      }
    ]
  }
]
