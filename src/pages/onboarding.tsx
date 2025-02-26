/**
 * @fileoverview Página de onboarding após registro
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Logo } from '@/components/Logo'
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
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const schema = z.object({
  business_name: z.string().min(3, 'Nome da empresa deve ter no mínimo 3 caracteres'),
  business_type: z.string().min(1, 'Selecione o tipo de negócio'),
  phone: z.string().min(10, 'Telefone inválido'),
  employees: z.string().min(1, 'Selecione o número de funcionários'),
  goals: z.string().min(10, 'Descreva seus objetivos'),
  challenges: z.string().min(10, 'Descreva seus desafios'),
})

type FormData = z.infer<typeof schema>

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error('Usuário não encontrado')
      return
    }

    try {
      setIsLoading(true)

      // Criar negócio
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: form.getValues('business_name'),
          owner_id: user.id,
          type: form.getValues('business_type'),
          phone: form.getValues('phone'),
          employees: form.getValues('employees'),
          goals: form.getValues('goals'),
          challenges: form.getValues('challenges'),
          settings: {}
        })
        .select()
        .single()

      if (businessError) throw businessError

      // Atualizar usuário com business_id
      const { error: userError } = await supabase
        .from('users')
        .update({ business_id: business.id })
        .eq('id', user.id)

      if (userError) throw userError

      // Atualizar estado local
      setUser({
        ...user,
        business_id: business.id
      })

      toast.success('Negócio criado com sucesso!')
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao criar negócio')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="container mx-auto min-h-screen py-12">
        {/* Logo */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-12"
        >
          <Logo size="lg" />
        </motion.div>

        {/* Formulário */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl"
        >
          <h1 className="text-3xl font-bold text-center mb-8">
            Vamos conhecer melhor seu negócio
          </h1>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white/5 border-gray-800"
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
                    <FormLabel>Tipo de Negócio</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-gray-800">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="salon">Salão de Beleza</SelectItem>
                        <SelectItem value="clinic">Clínica</SelectItem>
                        <SelectItem value="gym">Academia</SelectItem>
                        <SelectItem value="restaurant">Restaurante</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white/5 border-gray-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Funcionários</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-gray-800">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-5">1-5</SelectItem>
                        <SelectItem value="6-10">6-10</SelectItem>
                        <SelectItem value="11-20">11-20</SelectItem>
                        <SelectItem value="21+">21+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quais são seus principais objetivos?</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-white/5 border-gray-800"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="challenges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quais são seus maiores desafios?</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-white/5 border-gray-800"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Continuar para Planos'}
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  )
}
