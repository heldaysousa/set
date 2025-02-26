export type MessageType = 'text' | 'image' | 'location' | 'contact' | 'document'

export type MessageDirection = 'incoming' | 'outgoing'

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface Message {
  id: string
  business_id: string
  chat_id: string
  type: MessageType
  direction: MessageDirection
  status: MessageStatus
  content: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Chat {
  id: string
  business_id: string
  customer_phone: string
  customer_name?: string
  customer_id?: string
  last_message?: string
  last_message_at?: string
  status: 'active' | 'archived' | 'blocked'
  context?: {
    intent?: string
    stage?: string
    data?: Record<string, any>
  }
  created_at: string
  updated_at: string
}

export interface ChatbotConfig {
  id: string
  business_id: string
  name: string
  personality: string
  welcome_message: string
  fallback_message: string
  working_hours_only: boolean
  auto_archive_after: number // dias
  default_responses: {
    greeting?: string
    goodbye?: string
    working_hours?: string
    unavailable?: string
    confirmation?: string
    cancellation?: string
  }
  ai_config: {
    model: string
    temperature: number
    max_tokens: number
    system_prompt: string
  }
  created_at: string
  updated_at: string
}

export interface ChatbotResponse {
  type: 'text' | 'quick_reply' | 'button' | 'template'
  content: string
  metadata?: {
    buttons?: Array<{
      type: 'reply' | 'url'
      title: string
      value: string
    }>
    template?: {
      name: string
      language: string
      components: Array<{
        type: string
        parameters: Array<{
          type: string
          value: string
        }>
      }>
    }
  }
}

export interface ChatbotIntent {
  id: string
  business_id: string
  name: string
  patterns: string[]
  responses: ChatbotResponse[]
  required_data?: Array<{
    key: string
    type: 'text' | 'date' | 'time' | 'phone' | 'email'
    question: string
    validation?: string
  }>
  actions?: Array<{
    type: 'schedule' | 'notify' | 'update' | 'api_call'
    config: Record<string, any>
  }>
  created_at: string
  updated_at: string
}

export interface ChatbotSession {
  id: string
  business_id: string
  chat_id: string
  customer_id?: string
  current_intent?: string
  current_stage?: string
  collected_data: Record<string, any>
  context: Record<string, any>
  last_interaction: string
  created_at: string
  updated_at: string
}

export interface ChatbotAnalytics {
  id: string
  business_id: string
  period: 'daily' | 'weekly' | 'monthly'
  date: string
  metrics: {
    total_conversations: number
    new_conversations: number
    messages_received: number
    messages_sent: number
    intents_matched: number
    intents_failed: number
    appointments_scheduled: number
    appointments_cancelled: number
    average_response_time: number
    satisfaction_rate?: number
  }
  created_at: string
  updated_at: string
}
