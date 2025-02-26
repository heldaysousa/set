/**
 * @fileoverview Serviço de gerenciamento de chat e mensagens
 * @status 🚧 Em desenvolvimento
 * 
 * Este serviço é responsável por gerenciar todas as operações relacionadas
 * a chats, mensagens, sessões e configurações do chatbot.
 * 
 * Para mais informações, consulte a documentação em /docs/CHATBOT.md
 */

import { supabase } from '@/lib/supabase'
import type {
  Message,
  Chat,
  ChatbotConfig,
  ChatbotIntent,
  ChatbotSession,
  ChatbotResponse,
} from '@/types/chatbot'

export class ChatService {
  private business_id: string

  constructor(business_id: string) {
    this.business_id = business_id
  }

  // Gerenciamento de Chats
  async createChat(customer_phone: string, customer_name?: string): Promise<Chat> {
    const { data, error } = await supabase
      .from('chats')
      .insert({
        business_id: this.business_id,
        customer_phone,
        customer_name,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getChat(chat_id: string): Promise<Chat> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chat_id)
      .eq('business_id', this.business_id)
      .single()

    if (error) throw error
    return data
  }

  async updateChatStatus(chat_id: string, status: Chat['status']): Promise<void> {
    const { error } = await supabase
      .from('chats')
      .update({ status })
      .eq('id', chat_id)
      .eq('business_id', this.business_id)

    if (error) throw error
  }

  // Gerenciamento de Mensagens
  async sendMessage(chat_id: string, content: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        business_id: this.business_id,
        chat_id,
        type: 'text',
        direction: 'outgoing',
        status: 'pending',
        content,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getMessages(chat_id: string, limit = 50): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('business_id', this.business_id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  async updateMessageStatus(
    message_id: string,
    status: Message['status']
  ): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', message_id)
      .eq('business_id', this.business_id)

    if (error) throw error
  }

  // Gerenciamento de Sessões
  async createSession(chat_id: string): Promise<ChatbotSession> {
    const { data, error } = await supabase
      .from('chatbot_sessions')
      .insert({
        business_id: this.business_id,
        chat_id,
        collected_data: {},
        context: {},
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getSession(chat_id: string): Promise<ChatbotSession> {
    const { data, error } = await supabase
      .from('chatbot_sessions')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('business_id', this.business_id)
      .single()

    if (error) throw error
    return data
  }

  async updateSession(
    session_id: string,
    updates: Partial<ChatbotSession>
  ): Promise<void> {
    const { error } = await supabase
      .from('chatbot_sessions')
      .update(updates)
      .eq('id', session_id)
      .eq('business_id', this.business_id)

    if (error) throw error
  }

  // Configurações do Chatbot
  async getConfig(): Promise<ChatbotConfig> {
    const { data, error } = await supabase
      .from('chatbot_config')
      .select('*')
      .eq('business_id', this.business_id)
      .single()

    if (error) throw error
    return data
  }

  async updateConfig(updates: Partial<ChatbotConfig>): Promise<void> {
    const { error } = await supabase
      .from('chatbot_config')
      .update(updates)
      .eq('business_id', this.business_id)

    if (error) throw error
  }

  // Gerenciamento de Intents
  async getIntents(): Promise<ChatbotIntent[]> {
    const { data, error } = await supabase
      .from('chatbot_intents')
      .select('*')
      .eq('business_id', this.business_id)

    if (error) throw error
    return data
  }

  async createIntent(intent: Omit<ChatbotIntent, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<ChatbotIntent> {
    const { data, error } = await supabase
      .from('chatbot_intents')
      .insert({
        ...intent,
        business_id: this.business_id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateIntent(
    intent_id: string,
    updates: Partial<ChatbotIntent>
  ): Promise<void> {
    const { error } = await supabase
      .from('chatbot_intents')
      .update(updates)
      .eq('id', intent_id)
      .eq('business_id', this.business_id)

    if (error) throw error
  }

  async deleteIntent(intent_id: string): Promise<void> {
    const { error } = await supabase
      .from('chatbot_intents')
      .delete()
      .eq('id', intent_id)
      .eq('business_id', this.business_id)

    if (error) throw error
  }
}
