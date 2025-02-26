import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addMinutes, parse, isAfter, isBefore, isEqual } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Calendar, Clock, User, Scissors, FileText, Plus, ChevronLeft, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

// Schema para novo cliente
const novoClienteSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .transform(name => name.trim())
    .refine(name => /^[a-zA-ZÀ-ÿ\s]*$/.test(name), 'Nome deve conter apenas letras'),
  email: z.string()
    .email('Email inválido')
    .transform(email => email.toLowerCase().trim()),
  phone: z.string()
    .min(11, 'Telefone inválido')
    .max(11, 'Telefone inválido')
    .transform(phone => phone.replace(/\D/g, ''))
    .refine(phone => /^[0-9]{11}$/.test(phone), 'Telefone deve conter 11 dígitos'),
})

// Schema para agendamento
const agendamentoSchema = z.object({
  client_id: z.string().min(1, 'Selecione um cliente'),
  professional_id: z.string().min(1, 'Selecione um profissional'),
  service_id: z.string().min(1, 'Selecione um serviço'),
  start_time: z.string().min(1, 'Selecione um horário'),
  notes: z.string().optional(),
})

type NovoClienteForm = z.infer<typeof novoClienteSchema>
type AgendamentoForm = z.infer<typeof agendamentoSchema>

interface AgendamentoModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  agendamento?: AgendamentoCompleto | null
}

export const AgendamentoModal = ({
  isOpen,
  onClose,
  selectedDate,
  agendamento,
}: AgendamentoModalProps) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showNovoCliente, setShowNovoCliente] = useState(false)

  // Form para novo cliente
  const novoClienteForm = useForm<NovoClienteForm>({
    resolver: zodResolver(novoClienteSchema),
  })

  // Form principal
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<AgendamentoForm>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: agendamento
      ? {
          client_id: agendamento.client_id,
          professional_id: agendamento.professional_id,
          service_id: agendamento.service_id,
          start_time: format(new Date(agendamento.start_time), 'HH:mm'),
          notes: agendamento.notes || '',
        }
      : undefined,
  })

  // Queries
  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('business_id', user?.business_id)
        .order('name')

      if (error) throw error
      return data
    },
  })

  const { data: profissionais } = useQuery({
    queryKey: ['profissionais'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('business_id', user?.business_id)
        .eq('active', true)
        .order('name')

      if (error) throw error
      return data
    },
  })

  const { data: servicos } = useQuery({
    queryKey: ['servicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', user?.business_id)
        .order('name')

      if (error) throw error
      return data
    },
  })

  // Verificar disponibilidade do horário
  const checkAvailability = async (
    professionalId: string,
    startTime: string,
    duration: number,
    excludeAppointmentId?: string
  ) => {
    setIsCheckingAvailability(true)
    try {
      const horarioInicio = parse(startTime, 'HH:mm', selectedDate)
      const horarioFim = addMinutes(horarioInicio, duration)

      const { data: conflitos, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('business_id', user?.business_id)
        .neq('id', excludeAppointmentId || '')
        .or(
          `start_time.lte.${horarioFim.toISOString()},end_time.gte.${horarioInicio.toISOString()}`
        )

      if (error) throw error

      return conflitos.length === 0
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error)
      return false
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  // Watch para valores do formulário
  const watchProfessionalId = watch('professional_id')
  const watchStartTime = watch('start_time')
  const watchServiceId = watch('service_id')

  // Efeito para verificar disponibilidade quando mudar profissional/horário/serviço
  useEffect(() => {
    const verificarDisponibilidade = async () => {
      if (watchProfessionalId && watchStartTime && selectedService) {
        const disponivel = await checkAvailability(
          watchProfessionalId,
          watchStartTime,
          selectedService.duration,
          agendamento?.id
        )
        if (!disponivel) {
          toast.error('Horário indisponível para este profissional')
        }
      }
    }
    verificarDisponibilidade()
  }, [watchProfessionalId, watchStartTime, selectedService])

  // Efeito para atualizar serviço selecionado
  useEffect(() => {
    if (watchServiceId && servicos) {
      const servico = servicos.find(s => s.id === watchServiceId)
      setSelectedService(servico || null)
    }
  }, [watchServiceId, servicos])

  // Mutation para criar/editar agendamento
  const mutateAgendamento = useMutation({
    mutationFn: async (data: AgendamentoForm) => {
      if (!selectedService) throw new Error('Serviço não encontrado')

      const horarioInicio = parse(data.start_time, 'HH:mm', selectedDate)
      const horarioFim = addMinutes(horarioInicio, selectedService.duration)

      // Verificar disponibilidade antes de salvar
      const disponivel = await checkAvailability(
        data.professional_id,
        data.start_time,
        selectedService.duration,
        agendamento?.id
      )

      if (!disponivel) {
        throw new Error('Horário indisponível')
      }

      if (agendamento) {
        const { error } = await supabase
          .from('appointments')
          .update({
            ...data,
            start_time: horarioInicio.toISOString(),
            end_time: horarioFim.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', agendamento.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert({
            ...data,
            business_id: user?.business_id,
            start_time: horarioInicio.toISOString(),
            end_time: horarioFim.toISOString(),
            status: 'scheduled',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
      toast.success(
        agendamento
          ? 'Agendamento atualizado com sucesso!'
          : 'Agendamento criado com sucesso!'
      )
      handleClose()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : agendamento
          ? 'Erro ao atualizar agendamento'
          : 'Erro ao criar agendamento'
      )
    },
  })

  // Mutation para criar novo cliente
  const createCliente = useMutation({
    mutationFn: async (data: NovoClienteForm) => {
      if (!user?.business_id) {
        throw new Error('ID do negócio não encontrado')
      }

      // 1. Verifica se já existe um cliente com este email ou telefone
      const { data: existingClient, error: searchError } = await supabase
        .from('clients')
        .select('id, email, phone')
        .eq('business_id', user.business_id)
        .or(`email.eq.${data.email},phone.eq.${data.phone}`)
        .maybeSingle()

      if (searchError) {
        console.error('Erro ao verificar cliente existente:', searchError)
        throw new Error('Erro ao verificar cliente existente')
      }

      if (existingClient) {
        if (existingClient.email === data.email) {
          throw new Error('Já existe um cliente cadastrado com este email')
        }
        if (existingClient.phone === data.phone) {
          throw new Error('Já existe um cliente cadastrado com este telefone')
        }
      }

      // 2. Prepara os dados do cliente
      const newClient = {
        business_id: user.business_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        birth_date: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // 3. Insere o novo cliente
      const { data: insertedClient, error: insertError } = await supabase
        .from('clients')
        .insert([newClient])
        .select('id, name, email, phone')
        .single()

      if (insertError) {
        console.error('Erro ao inserir cliente:', insertError)
        throw new Error('Erro ao cadastrar cliente. Por favor, tente novamente.')
      }

      if (!insertedClient) {
        throw new Error('Erro ao cadastrar cliente: nenhum dado retornado')
      }

      return insertedClient
    },
    onMutate: () => {
      // Desabilita o formulário durante a mutação
      novoClienteForm.reset({}, { keepValues: true })
    },
    onSuccess: (newClient) => {
      // 1. Atualiza o cache do React Query
      queryClient.setQueryData(['clientes'], (oldData: any) => {
        if (!oldData) return [newClient]
        return [...oldData, newClient]
      })
      
      // 2. Seleciona o novo cliente no formulário de agendamento
      setValue('client_id', newClient.id)
      
      // 3. Limpa e fecha o formulário
      novoClienteForm.reset()
      setShowNovoCliente(false)
      
      // 4. Notifica o usuário
      toast.success('Cliente cadastrado com sucesso!')
    },
    onError: (error: Error) => {
      console.error('Erro ao cadastrar cliente:', error)
      toast.error(error.message || 'Erro ao cadastrar cliente')
      
      // Reabilita o formulário em caso de erro
      novoClienteForm.reset({}, { keepValues: true })
    }
  })

  const handleClose = () => {
    reset()
    novoClienteForm.reset()
    setSelectedService(null)
    setShowNovoCliente(false)
    onClose()
  }

  const handleCancelNovoCliente = () => {
    novoClienteForm.reset()
    setShowNovoCliente(false)
  }

  const onSubmit = async (data: AgendamentoForm) => {
    mutateAgendamento.mutate(data)
  }

  // Gerar horários disponíveis (8h às 20h, intervalos de 30min)
  const horarios = Array.from({ length: 25 }, (_, i) => {
    const hora = Math.floor(i / 2) + 8
    const minutos = i % 2 === 0 ? '00' : '30'
    return `${String(hora).padStart(2, '0')}:${minutos}`
  })

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background/95 backdrop-blur-sm rounded-lg shadow-xl border border-border/50 p-6 space-y-6 animate-fade-in max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm pb-4 border-b border-border/50">
            <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
              {showNovoCliente && (
                <button
                  onClick={() => setShowNovoCliente(false)}
                  className="hover:text-primary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {showNovoCliente
                ? 'Novo Cliente'
                : agendamento
                ? 'Editar Agendamento'
                : 'Novo Agendamento'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="py-2">
            {showNovoCliente ? (
              // Formulário de novo cliente
              <form
                onSubmit={novoClienteForm.handleSubmit((data) => {
                  createCliente.mutate(data)
                })}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nome
                    </label>
                    <Input
                      {...novoClienteForm.register('name')}
                      placeholder="Nome completo"
                      className={cn(
                        "w-full bg-background/50",
                        novoClienteForm.formState.errors.name && "border-destructive"
                      )}
                      autoFocus
                      disabled={novoClienteForm.formState.isSubmitting}
                      onChange={(e) => {
                        // Permite apenas letras e espaços
                        e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
                      }}
                    />
                    {novoClienteForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {novoClienteForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <Input
                      {...novoClienteForm.register('email')}
                      type="email"
                      placeholder="email@exemplo.com"
                      className={cn(
                        "w-full bg-background/50",
                        novoClienteForm.formState.errors.email && "border-destructive"
                      )}
                      disabled={novoClienteForm.formState.isSubmitting}
                    />
                    {novoClienteForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {novoClienteForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefone
                    </label>
                    <Input
                      {...novoClienteForm.register('phone')}
                      placeholder="(00) 00000-0000"
                      className={cn(
                        "w-full bg-background/50",
                        novoClienteForm.formState.errors.phone && "border-destructive"
                      )}
                      disabled={novoClienteForm.formState.isSubmitting}
                      maxLength={15}
                      onChange={(e) => {
                        // Aplica máscara de telefone
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length > 0) {
                          value = `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7,11)}`
                        }
                        e.target.value = value
                      }}
                    />
                    {novoClienteForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {novoClienteForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelNovoCliente}
                    disabled={novoClienteForm.formState.isSubmitting}
                    className="bg-background/50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={novoClienteForm.formState.isSubmitting}
                    className={cn(
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      novoClienteForm.formState.isSubmitting && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {novoClienteForm.formState.isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </span>
                    ) : (
                      'Salvar Cliente'
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              // Formulário de agendamento
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Cliente */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Cliente
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNovoCliente(true)}
                      className="h-8 px-2 text-xs hover:bg-primary/10 hover:text-primary"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Novo Cliente
                    </Button>
                  </div>
                  <Controller
                    name="client_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full bg-background/50">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes?.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              <div className="flex items-center gap-2">
                                <span>{cliente.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {cliente.phone}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.client_id && (
                    <p className="text-sm text-destructive">{errors.client_id.message}</p>
                  )}
                </div>

                {/* Profissional */}
                <div className="space-y-4">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profissional
                  </label>
                  <Controller
                    name="professional_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full bg-background/50">
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                        <SelectContent>
                          {profissionais?.map((profissional) => (
                            <SelectItem key={profissional.id} value={profissional.id}>
                              {profissional.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.professional_id && (
                    <p className="text-sm text-destructive">{errors.professional_id.message}</p>
                  )}
                </div>

                {/* Serviço */}
                <div className="space-y-4">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Serviço
                  </label>
                  <Controller
                    name="service_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          const servico = servicos?.find(s => s.id === value)
                          setSelectedService(servico || null)
                        }}
                      >
                        <SelectTrigger className="w-full bg-background/50">
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {servicos?.map((servico) => (
                            <SelectItem key={servico.id} value={servico.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{servico.name}</span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{servico.duration}min</span>
                                  <span>R$ {servico.price.toFixed(2)}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.service_id && (
                    <p className="text-sm text-destructive">{errors.service_id.message}</p>
                  )}
                  {selectedService && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Duração: {selectedService.duration} minutos</p>
                      <p>Valor: R$ {selectedService.price.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {/* Horário */}
                <div className="space-y-4">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário
                  </label>
                  <Controller
                    name="start_time"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full bg-background/50">
                          <SelectValue placeholder="Selecione um horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {horarios.map((horario) => (
                            <SelectItem key={horario} value={horario}>
                              {horario}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.start_time && (
                    <p className="text-sm text-destructive">{errors.start_time.message}</p>
                  )}
                  {selectedService && watchStartTime && (
                    <p className="text-sm text-muted-foreground">
                      Término previsto: {format(
                        addMinutes(
                          parse(watchStartTime, 'HH:mm', selectedDate),
                          selectedService.duration
                        ),
                        'HH:mm'
                      )}
                    </p>
                  )}
                </div>

                {/* Observações */}
                <div className="space-y-4">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Observações
                  </label>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Observações sobre o agendamento"
                        className="min-h-[100px] bg-background/50"
                      />
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="bg-background/50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isCheckingAvailability}
                    className={cn(
                      "relative bg-primary text-primary-foreground hover:bg-primary/90",
                      (isSubmitting || isCheckingAvailability) && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </span>
                    ) : isCheckingAvailability ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Verificando...
                      </span>
                    ) : agendamento ? (
                      'Atualizar'
                    ) : (
                      'Agendar'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
