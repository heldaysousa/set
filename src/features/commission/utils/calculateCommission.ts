import { Commission, CommissionCalculation } from '@/types/commission'

interface ServiceData {
  id: string
  date: string
  serviceName: string
  value: number
  professionalId: string
  professionalName: string
  commissionConfig: Commission
}

export function calculateCommission(
  services: ServiceData[],
  period: { startDate: string; endDate: string }
): CommissionCalculation[] {
  // Agrupar serviços por profissional
  const servicesByProfessional = services.reduce((acc, service) => {
    if (!acc[service.professionalId]) {
      acc[service.professionalId] = {
        professionalId: service.professionalId,
        professionalName: service.professionalName,
        services: []
      }
    }
    acc[service.professionalId].services.push(service)
    return acc
  }, {} as Record<string, { professionalId: string; professionalName: string; services: ServiceData[] }>)

  // Calcular comissões para cada profissional
  return Object.values(servicesByProfessional).map(({ professionalId, professionalName, services }) => {
    const calculatedServices = services.map(service => {
      const commissionValue = service.commissionConfig.isPercentage
        ? (service.value * service.commissionConfig.percentage) / 100
        : service.commissionConfig.fixedValue || 0

      return {
        id: service.id,
        date: service.date,
        serviceName: service.serviceName,
        value: service.value,
        commissionValue,
        commissionType: service.commissionConfig.isPercentage ? 'percentage' : 'fixed' as const
      }
    })

    const totalServices = calculatedServices.length
    const totalValue = calculatedServices.reduce((sum, service) => sum + service.value, 0)
    const commissionValue = calculatedServices.reduce((sum, service) => sum + service.commissionValue, 0)

    return {
      professionalId,
      professionalName,
      totalServices,
      totalValue,
      commissionValue,
      period,
      services: calculatedServices
    }
  })
}
