export const mockUserData = {
  user: {
    id: "mock-user-id-123",
    email: "helday.sousa@gmail.com",
    name: "Helday Sousa",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=helday",
    subscription_status: "active",
    subscription_end: "2024-12-31",
    created_at: "2024-01-01",
    updated_at: "2024-02-20",
    last_sign_in: "2024-02-20"
  },
  business: {
    id: "mock-business-id-123",
    name: "Helday's Business",
    owner_id: "mock-user-id-123",
    created_at: "2024-01-01",
    updated_at: "2024-02-20",
    type: "service",
    address: "Rua Principal, 123",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 99999-9999"
  },
  dashboardData: {
    revenue: {
      today: 850.00,
      week: 4500.00,
      month: 18500.00,
      year: 220000.00
    },
    appointments: {
      today: 8,
      week: 42,
      month: 168,
      pending: 12
    },
    clients: {
      total: 450,
      active: 380,
      new: 25
    },
    services: {
      total: 12,
      mostPopular: [
        { name: "Corte de Cabelo", count: 85 },
        { name: "Barba", count: 65 },
        { name: "Coloração", count: 45 }
      ]
    },
    recentTransactions: [
      {
        id: "tx-1",
        client: "João Silva",
        service: "Corte de Cabelo",
        value: 80.00,
        date: "2024-02-20T14:30:00"
      },
      {
        id: "tx-2",
        client: "Maria Oliveira",
        service: "Coloração",
        value: 250.00,
        date: "2024-02-20T11:00:00"
      },
      {
        id: "tx-3",
        client: "Pedro Santos",
        service: "Barba",
        value: 45.00,
        date: "2024-02-20T09:15:00"
      }
    ],
    chartData: {
      revenue: {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
        data: [15000, 18500, 16800, 19200, 18500, 22000]
      },
      appointments: {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
        data: [145, 168, 152, 178, 165, 182]
      }
    }
  }
}
