/**
 * @fileoverview Landing page principal
 */

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  MessageSquare,
  BarChart,
  Users,
  Shield,
  Zap,
} from 'lucide-react'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }, [user, navigate])

  return null
}

export function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Calendar,
      title: 'Agendamento Inteligente',
      description: 'Sistema de agendamento automatizado com IA para otimizar sua agenda',
    },
    {
      icon: MessageSquare,
      title: 'Chatbot Avançado',
      description: 'Atendimento 24/7 com chatbot inteligente integrado ao WhatsApp',
    },
    {
      icon: BarChart,
      title: 'Análises Detalhadas',
      description: 'Relatórios e métricas para tomar as melhores decisões',
    },
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'CRM completo para gerenciar relacionamentos e fidelizar clientes',
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados protegidos com as mais avançadas tecnologias',
    },
    {
      icon: Zap,
      title: 'Alta Performance',
      description: 'Sistema rápido e responsivo para melhor experiência',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      {/* Header */}
      <header className="container mx-auto py-6">
        <nav className="flex items-center justify-between">
          <Logo size="md" />
          <div className="space-x-4">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white"
              onClick={() => navigate('/login')}
            >
              Entrar
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => navigate('/register')}
            >
              Começar Agora
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto py-20 text-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Transforme seu Negócio com Agendamento Inteligente
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Sistema completo de agendamento e gestão para profissionais e empresas.
            Automatize processos, aumente sua produtividade e encante seus clientes.
          </p>
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-lg px-8"
            onClick={() => navigate('/register')}
          >
            Comece seu Período Gratuito
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tudo que você precisa em um só lugar
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <feature.icon className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          O que nossos clientes dizem
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Ana Silva',
              role: 'Proprietária de Salão',
              text: 'Aumentei em 40% meus agendamentos após começar a usar o sistema.',
            },
            {
              name: 'Carlos Santos',
              role: 'Clínica de Estética',
              text: 'O chatbot é incrível! Atende meus clientes 24h por dia.',
            },
            {
              name: 'Marina Costa',
              role: 'Personal Trainer',
              text: 'Os relatórios me ajudam a entender melhor meu negócio.',
            },
          ].map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="p-6 rounded-xl bg-white/5"
            >
              <p className="text-lg mb-4">"{testimonial.text}"</p>
              <p className="font-semibold">{testimonial.name}</p>
              <p className="text-sm text-gray-400">{testimonial.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Comece agora com 7 dias grátis. Sem compromisso.
          </p>
          <div className="space-x-4">
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => navigate('/register')}
            >
              Começar Gratuitamente
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => navigate('/plans')}
            >
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto py-12 border-t border-gray-800">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Logo size="sm" />
            <p className="mt-4 text-gray-400">
              Sistema completo de agendamento e gestão para seu negócio.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Recursos</li>
              <li>Preços</li>
              <li>Integrações</li>
              <li>Atualizações</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Sobre</li>
              <li>Blog</li>
              <li>Carreiras</li>
              <li>Contato</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Privacidade</li>
              <li>Termos</li>
              <li>Segurança</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 CEO Express. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
