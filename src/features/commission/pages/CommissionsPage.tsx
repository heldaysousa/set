import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react'
import { calculateCommission } from '../utils/calculateCommission'
import { CommissionCalculation } from '@/types/commission'
import { formatCurrency } from '@/lib/utils'

export function CommissionsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all')
  const [commissions, setCommissions] = useState<CommissionCalculation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadCommissions = async () => {
    setIsLoading(true)
    try {
      // TODO: Implementar busca de dados do backend
      // const response = await api.get('/commissions', {
      //   params: {
      //     startDate: startOfMonth(selectedMonth),
      //     endDate: endOfMonth(selectedMonth),
      //     professionalId: selectedProfessional !== 'all' ? selectedProfessional : undefined
      //   }
      // })
      // setCommissions(response.data)
    } catch (error) {
      console.error('Erro ao carregar comissões:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setSelectedMonth(current => 
      direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1)
    )
  }

  const handleExport = () => {
    // TODO: Implementar exportação de relatório
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Comissões</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card rounded-lg p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMonthChange('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMonthChange('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Select
            value={selectedProfessional}
            onValueChange={setSelectedProfessional}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              {/* TODO: Adicionar lista de profissionais */}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : commissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Calendar className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma comissão encontrada para o período selecionado
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {commissions.map((commission) => (
            <Card key={commission.professionalId}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{commission.professionalName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {commission.totalServices} serviços realizados
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {formatCurrency(commission.commissionValue)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total em comissões
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commission.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{service.serviceName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(service.date), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(service.commissionValue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {service.commissionType === 'percentage'
                            ? `${service.value}% de ${formatCurrency(service.value)}`
                            : 'Valor fixo'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
