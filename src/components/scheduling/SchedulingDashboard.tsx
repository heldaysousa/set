/**
 * @fileoverview Dashboard principal do sistema de agendamento
 * @status 🚧 Em desenvolvimento
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, Users, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AgendaView } from './AgendaView'
import { ProfessionalsView } from './ProfessionalsView'
import { ServicesView } from './ServicesView'
import { SchedulingSettings } from './SchedulingSettings'
import { Logo } from '@/components/Logo'
import { LoadingLogo } from '@/components/LoadingLogo'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function SchedulingDashboard() {
  const { business } = useAuth()
  const [activeTab, setActiveTab] = useState('agenda')

  // Buscar métricas
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['scheduling-metrics', business?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('business_id', business?.id)
        .gte('start_time', today)
        .order('start_time')

      const { data: professionals } = await supabase
        .from('professionals')
        .select('*')
        .eq('business_id', business?.id)

      return {
        todayAppointments: appointments?.filter(apt => 
          apt.start_time.startsWith(today)
        ).length || 0,
        upcomingAppointments: appointments?.length || 0,
        activeProfessionals: professionals?.length || 0,
      }
    },
    enabled: !!business?.id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingLogo />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto py-4">
          <Logo size="lg" />
        </div>
      </header>

      <main className="container mx-auto py-6 space-y-6">
        {/* Métricas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Agendamentos Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.todayAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próximos Agendamentos
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.upcomingAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Profissionais Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.activeProfessionals}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Conteúdo */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="professionals">Profissionais</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="agenda" className="mt-6">
            <AgendaView />
          </TabsContent>

          <TabsContent value="professionals" className="mt-6">
            <ProfessionalsView />
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <ServicesView />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SchedulingSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
