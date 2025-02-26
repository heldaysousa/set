export interface Commission {
  id: string
  professionalId: string
  serviceId: string
  percentage: number
  fixedValue?: number
  isPercentage: boolean
  createdAt: string
  updatedAt: string
}

export interface CommissionCalculation {
  professionalId: string
  professionalName: string
  totalServices: number
  totalValue: number
  commissionValue: number
  period: {
    startDate: string
    endDate: string
  }
  services: Array<{
    id: string
    date: string
    serviceName: string
    value: number
    commissionValue: number
    commissionType: 'percentage' | 'fixed'
  }>
}

export interface CommissionSettings {
  defaultPercentage: number
  calculationPeriod: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  paymentDay: number
  minimumValue?: number
  maximumValue?: number
}
