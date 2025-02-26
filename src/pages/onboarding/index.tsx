import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { fetchBusiness } from '@/lib/business'

const businessSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  endereco: z.string().min(10, 'Endereço muito curto'),
  business_type: z.string().min(1, 'Selecione o tipo de negócio'),
  business_hours: z.object({
    monday: z.object({ start: z.string(), end: z.string() }),
    tuesday: z.object({ start: z.string(), end: z.string() }),
    wednesday: z.object({ start: z.string(), end: z.string() }),
    thursday: z.object({ start: z.string(), end: z.string() }),
    friday: z.object({ start: z.string(), end: z.string() }),
    saturday: z.object({ start: z.string(), end: z.string() }),
    sunday: z.object({ start: z.string(), end: z.string() })
  })
})

type BusinessForm = z.infer<typeof businessSchema>

const steps = [
  {
    title: 'Informações Básicas',
    description: 'Dados principais do seu negócio'
  },
  {
    title: 'Horário de Funcionamento',
    description: 'Configure os horários de atendimento'
  },
  {
    title: 'Configurações Adicionais',
    description: 'Personalize seu sistema'
  }
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)

  const form = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      nome: '',
      cnpj: '',
      telefone: '',
      email: '',
      endereco: '',
      business_type: '',
      business_hours: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '18:00' },
        saturday: { start: '09:00', end: '18:00' },
        sunday: { start: '', end: '' }
      }
    }
  })

  const onSubmit = async (data: BusinessForm) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .insert([
          {
          ...data,
            user_id: user?.id,
            status: 'active',
            has_completed_onboarding: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .single()

      if (error) throw error

      await fetchBusiness(user?.businessId)

      toast.success('Configuração concluída com sucesso!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Erro ao salvar dados:', error)
      toast.error('Erro ao salvar dados do negócio')
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Configuração Inicial</h1>
          <p className="text-gray-400 mt-2">Configure seu negócio em poucos passos</p>
        </div>

        <div className="flex gap-4 mb-8 justify-center">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${
                index > 0 ? 'ml-4' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-8 ml-2 ${
                    index < currentStep ? 'bg-blue-500' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-none">
          <CardHeader>
            <CardTitle className="text-white">{steps[currentStep].title}</CardTitle>
            <CardDescription className="text-gray-400">
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Nome do Negócio</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-white/5 border-gray-800 text-white"
                                placeholder="Ex: Helday Beauty"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">CNPJ</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-white/5 border-gray-800 text-white"
                                placeholder="00.000.000/0000-00"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="telefone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Telefone</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-white/5 border-gray-800 text-white"
                                  placeholder="(00) 00000-0000"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Email</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  className="bg-white/5 border-gray-800 text-white"
                                  placeholder="contato@exemplo.com"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Endereço</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-white/5 border-gray-800 text-white"
                                placeholder="Rua, número, bairro, cidade - UF"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="business_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Tipo de Negócio</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white/5 border-gray-800 text-white">
                                  <SelectValue placeholder="Selecione o tipo de negócio" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="salon">Salão de Beleza</SelectItem>
                                <SelectItem value="barber">Barbearia</SelectItem>
                                <SelectItem value="clinic">Clínica de Estética</SelectItem>
                                <SelectItem value="spa">SPA</SelectItem>
                                <SelectItem value="other">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <div key={day} className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`business_hours.${day}.start`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">
                                  {day.charAt(0).toUpperCase() + day.slice(1)} - Abertura
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="time"
                                    className="bg-white/5 border-gray-800 text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`business_hours.${day}.end`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Fechamento</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="time"
                                    className="bg-white/5 border-gray-800 text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="challenges"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Principais Dificuldades</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange([...field.value, value])}
                              value={field.value[0]}
                              multiple
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/5 border-gray-800 text-white">
                                  <SelectValue placeholder="Selecione as dificuldades" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="agenda">Gerenciamento de Agenda</SelectItem>
                                <SelectItem value="financeiro">Controle Financeiro</SelectItem>
                                <SelectItem value="marketing">Marketing e Divulgação</SelectItem>
                                <SelectItem value="clientes">Fidelização de Clientes</SelectItem>
                                <SelectItem value="estoque">Controle de Estoque</SelectItem>
                                <SelectItem value="funcionarios">Gestão de Funcionários</SelectItem>
                                <SelectItem value="processos">Padronização de Processos</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="num_employees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Número de Funcionários</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white/5 border-gray-800 text-white">
                                  <SelectValue placeholder="Selecione o número de funcionários" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">Apenas eu</SelectItem>
                                <SelectItem value="2-5">2 a 5 funcionários</SelectItem>
                                <SelectItem value="6-10">6 a 10 funcionários</SelectItem>
                                <SelectItem value="11-20">11 a 20 funcionários</SelectItem>
                                <SelectItem value="20+">Mais de 20 funcionários</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="avg_monthly_revenue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Faturamento Médio Mensal</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white/5 border-gray-800 text-white">
                                  <SelectValue placeholder="Selecione a faixa de faturamento" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ate-5k">Até R$ 5.000</SelectItem>
                                <SelectItem value="5k-10k">R$ 5.000 a R$ 10.000</SelectItem>
                                <SelectItem value="10k-20k">R$ 10.000 a R$ 20.000</SelectItem>
                                <SelectItem value="20k-50k">R$ 20.000 a R$ 50.000</SelectItem>
                                <SelectItem value="50k+">Mais de R$ 50.000</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="target_audience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Público-Alvo Principal</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-white/5 border-gray-800 text-white"
                                placeholder="Descreva seu público-alvo principal"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="bg-white/5 border-gray-800 text-white hover:bg-white/10"
                  >
                    Voltar
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      Concluir
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
