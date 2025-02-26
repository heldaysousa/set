/**
 * @fileoverview Formulário de criação de agendamentos
 * @status 🚧 Em desenvolvimento
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { SchedulingService } from '@/services/scheduling/SchedulingService'

const schema = z.object({
  customer_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  customer_phone: z.string().min(10, 'Telefone inválido'),
  service_id: z.string().min(1, 'Selecione um serviço'),
  professional_id: z.string().min(1, 'Selecione um profissional'),
  date: z.date({ required_error: 'Selecione uma data' }),
  time_slot: z.string().min(1, 'Selecione um horário'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSuccess: () => void
}

export function NewAppointmentForm({ onSuccess }: Props) {
  const { business } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const schedulingService = new SchedulingService(business?.id!)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Buscar serviços
  const { data: services } = useQuery({
    queryKey: ['services', business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', business?.id)
        .order('name')

      if (error) throw error
      return data
    },
    enabled: !!business?.id,
  })

  // Buscar profissionais
  const { data: professionals } = useQuery({
    queryKey: ['professionals', business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('business_id', business?.id)
        .order('name')

      if (error) throw error
      return data
    },
    enabled: !!business?.id,
  })

  // Buscar horários disponíveis
  const { data: timeSlots } = useQuery({
    queryKey: [
      'time-slots',
      business?.id,
      form.watch('service_id'),
      form.watch('professional_id'),
      selectedDate,
    ],
    queryFn: async () => {
      if (!selectedDate || !form.watch('service_id')) return []

      return schedulingService.getAvailableSlots(
        selectedDate.toISOString(),
        form.watch('service_id'),
        form.watch('professional_id')
      )
    },
    enabled: !!(
      business?.id &&
      selectedDate &&
      form.watch('service_id')
    ),
  })

  // Mutation para criar cliente
  const createCustomer = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      const { data: customer, error } = await supabase
        .from('customers')
        .insert({
          business_id: business?.id,
          name: data.name,
          phone: data.phone,
        })
        .select()
        .single()

      if (error) throw error
      return customer
    },
  })

  // Mutation para criar agendamento
  const createAppointment = useMutation({
    mutationFn: async (data: FormData) => {
      // Criar ou buscar cliente
      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', business?.id)
        .eq('phone', data.customer_phone)
        .limit(1)

      let customer = customers?.[0]

      if (!customer) {
        customer = await createCustomer.mutateAsync({
          name: data.customer_name,
          phone: data.customer_phone,
        })
      }

      // Criar agendamento
      return schedulingService.createAppointment(
        customer.id,
        data.service_id,
        data.professional_id,
        data.time_slot
      )
    },
    onSuccess: () => {
      onSuccess()
      form.reset()
    },
  })

  const onSubmit = (data: FormData) => {
    createAppointment.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customer_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Cliente</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services?.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="professional_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissional</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {professionals?.map(professional => (
                    <SelectItem key={professional.id} value={professional.id}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date)
                    setSelectedDate(date)
                  }}
                  locale={ptBR}
                  className="rounded-md border"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time_slot"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!timeSlots?.length}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeSlots?.map(slot => (
                    <SelectItem key={slot.start} value={slot.start}>
                      {format(new Date(slot.start), 'HH:mm')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={createAppointment.isPending}
        >
          {createAppointment.isPending ? 'Agendando...' : 'Agendar'}
        </Button>
      </form>
    </Form>
  )
}
