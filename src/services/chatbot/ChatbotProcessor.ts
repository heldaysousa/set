/**
 * @fileoverview Processador de mensagens do chatbot com integração OpenAI
 * @status 🚧 Em desenvolvimento
 * 
 * Este processador é responsável por identificar intents, processar mensagens
 * e gerenciar o fluxo de conversação do chatbot.
 * 
 * Para mais informações, consulte a documentação em /docs/CHATBOT.md
 */

import OpenAI from 'openai'
import type {
  Message,
  ChatbotConfig,
  ChatbotIntent,
  ChatbotSession,
  ChatbotResponse,
} from '@/types/chatbot'
import { ChatService } from './ChatService'

export class ChatbotProcessor {
  private openai: OpenAI
  private chatService: ChatService
  private config: ChatbotConfig
  private intents: ChatbotIntent[]

  constructor(
    openai: OpenAI,
    chatService: ChatService,
    config: ChatbotConfig,
    intents: ChatbotIntent[]
  ) {
    this.openai = openai
    this.chatService = chatService
    this.config = config
    this.intents = intents
  }

  async processMessage(message: Message): Promise<ChatbotResponse> {
    try {
      // Buscar ou criar sessão
      let session = await this.chatService.getSession(message.chat_id)
      if (!session) {
        session = await this.chatService.createSession(message.chat_id)
      }

      // Se já existe um intent em andamento, continuar o fluxo
      if (session.current_intent) {
        return this.continueIntent(message, session)
      }

      // Identificar intent da mensagem
      const intent = await this.identifyIntent(message.content)
      if (!intent) {
        return this.handleUnknownIntent(message)
      }

      // Iniciar novo fluxo de intent
      return this.startIntent(message, session, intent)
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
      return {
        type: 'text',
        content: this.config.fallback_message,
      }
    }
  }

  private async identifyIntent(message: string): Promise<ChatbotIntent | null> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.ai_config.model,
        temperature: this.config.ai_config.temperature,
        messages: [
          {
            role: 'system',
            content: this.config.ai_config.system_prompt,
          },
          {
            role: 'user',
            content: `Identifique a intenção da seguinte mensagem: "${message}"
            
            Intents disponíveis:
            ${this.intents
              .map((intent) => `${intent.name}: ${intent.patterns.join(', ')}`)
              .join('\n')}
            
            Responda apenas com o nome da intent ou "unknown" se não identificar nenhuma.`,
          },
        ],
      })

      const intentName = completion.choices[0].message.content?.trim()
      return (
        this.intents.find((intent) => intent.name === intentName) || null
      )
    } catch (error) {
      console.error('Erro ao identificar intent:', error)
      return null
    }
  }

  private async startIntent(
    message: Message,
    session: ChatbotSession,
    intent: ChatbotIntent
  ): Promise<ChatbotResponse> {
    // Atualizar sessão com o novo intent
    await this.chatService.updateSession(session.id, {
      current_intent: intent.name,
      current_stage: 'start',
      collected_data: {},
    })

    // Se o intent não requer dados adicionais, executar ações
    if (!intent.required_data?.length) {
      return this.executeIntentActions(intent, {})
    }

    // Caso contrário, iniciar coleta de dados
    const firstField = intent.required_data[0]
    return {
      type: 'text',
      content: firstField.question,
    }
  }

  private async continueIntent(
    message: Message,
    session: ChatbotSession
  ): Promise<ChatbotResponse> {
    const intent = this.intents.find(
      (intent) => intent.name === session.current_intent
    )
    if (!intent || !intent.required_data) {
      return this.handleUnknownIntent(message)
    }

    // Validar resposta atual
    const currentField = intent.required_data.find(
      (field) => !session.collected_data[field.key]
    )
    if (!currentField) {
      return this.executeIntentActions(intent, session.collected_data)
    }

    // Validar e armazenar resposta
    const isValid = await this.validateResponse(
      message.content,
      currentField.type,
      currentField.validation
    )
    if (!isValid) {
      return {
        type: 'text',
        content: `Resposta inválida. ${currentField.question}`,
      }
    }

    // Atualizar dados coletados
    const updatedData = {
      ...session.collected_data,
      [currentField.key]: message.content,
    }
    await this.chatService.updateSession(session.id, {
      collected_data: updatedData,
    })

    // Verificar se há mais dados para coletar
    const nextField = intent.required_data.find(
      (field) => !updatedData[field.key]
    )
    if (!nextField) {
      return this.executeIntentActions(intent, updatedData)
    }

    // Solicitar próximo dado
    return {
      type: 'text',
      content: nextField.question,
    }
  }

  private async validateResponse(
    response: string,
    type: string,
    validation?: string
  ): Promise<boolean> {
    try {
      switch (type) {
        case 'date':
          return !isNaN(Date.parse(response))
        case 'time':
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(response)
        case 'phone':
          return /^\+?[\d\s-]{10,}$/.test(response)
        case 'email':
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(response)
        default:
          if (validation) {
            return new RegExp(validation).test(response)
          }
          return true
      }
    } catch (error) {
      console.error('Erro na validação:', error)
      return false
    }
  }

  private async executeIntentActions(
    intent: ChatbotIntent,
    data: Record<string, any>
  ): Promise<ChatbotResponse> {
    try {
      if (intent.actions) {
        for (const action of intent.actions) {
          switch (action.type) {
            case 'schedule':
              // Implementar lógica de agendamento
              break
            case 'notify':
              // Implementar lógica de notificação
              break
            case 'update':
              // Implementar lógica de atualização
              break
            case 'api_call':
              // Implementar lógica de chamada de API
              break
          }
        }
      }

      // Retornar resposta padrão do intent
      return intent.responses[
        Math.floor(Math.random() * intent.responses.length)
      ]
    } catch (error) {
      console.error('Erro ao executar ações:', error)
      return {
        type: 'text',
        content: this.config.fallback_message,
      }
    }
  }

  private async handleUnknownIntent(
    message: Message
  ): Promise<ChatbotResponse> {
    try {
      // Gerar resposta com IA para mensagens não reconhecidas
      const completion = await this.openai.chat.completions.create({
        model: this.config.ai_config.model,
        temperature: this.config.ai_config.temperature,
        messages: [
          {
            role: 'system',
            content: `${this.config.ai_config.system_prompt}
            
            Responda de forma amigável e sugira as opções disponíveis:
            ${this.intents.map((intent) => `- ${intent.name}`).join('\n')}`,
          },
          {
            role: 'user',
            content: message.content,
          },
        ],
      })

      return {
        type: 'text',
        content: completion.choices[0].message.content || this.config.fallback_message,
      }
    } catch (error) {
      console.error('Erro ao gerar resposta:', error)
      return {
        type: 'text',
        content: this.config.fallback_message,
      }
    }
  }
}
