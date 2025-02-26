/**
 * @fileoverview Webhook para integração com WhatsApp Business API
 * @status 🚧 Em desenvolvimento
 * 
 * Este endpoint é responsável por receber e processar mensagens do WhatsApp,
 * integrando com o sistema de chatbot.
 * 
 * Para mais informações, consulte a documentação em /docs/CHATBOT.md
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { ChatService } from '@/services/chatbot/ChatService'
import { ChatbotProcessor } from '@/services/chatbot/ChatbotProcessor'

// Inicializar clientes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verificar token de webhook do WhatsApp
    const token = req.query['hub.verify_token']
    if (token) {
      if (token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return res.status(200).send(req.query['hub.challenge'])
      }
      return res.status(403).json({ error: 'Invalid verification token' })
    }

    // Processar mensagem recebida
    const { entry } = req.body
    if (!entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      return res.status(200).end()
    }

    const message = entry[0].changes[0].value.messages[0]
    const businessPhone = entry[0].changes[0].value.metadata.phone_number_id
    const customerPhone = message.from

    // Buscar negócio pelo número do WhatsApp
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('whatsapp_numero', businessPhone)
      .single()

    if (businessError || !business) {
      console.error('Negócio não encontrado:', businessError)
      return res.status(404).json({ error: 'Business not found' })
    }

    // Inicializar serviços
    const chatService = new ChatService(business.id)

    // Buscar configurações do chatbot
    const { data: config, error: configError } = await supabase
      .from('chatbot_config')
      .select('*')
      .eq('business_id', business.id)
      .single()

    if (configError || !config) {
      console.error('Configurações não encontradas:', configError)
      return res.status(404).json({ error: 'Chatbot config not found' })
    }

    // Buscar intents do chatbot
    const { data: intents, error: intentsError } = await supabase
      .from('chatbot_intents')
      .select('*')
      .eq('business_id', business.id)

    if (intentsError) {
      console.error('Erro ao buscar intents:', intentsError)
      return res.status(500).json({ error: 'Failed to fetch intents' })
    }

    // Buscar ou criar chat
    let chat = await chatService.getChat(customerPhone)
    if (!chat) {
      chat = await chatService.createChat(customerPhone)
    }

    // Criar mensagem recebida
    const { data: savedMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        business_id: business.id,
        chat_id: chat.id,
        type: message.type,
        direction: 'incoming',
        status: 'delivered',
        content: message.text?.body || '',
        metadata: message,
      })
      .select()
      .single()

    if (messageError) {
      console.error('Erro ao salvar mensagem:', messageError)
      return res.status(500).json({ error: 'Failed to save message' })
    }

    // Processar mensagem com chatbot
    const chatbotProcessor = new ChatbotProcessor(
      openai,
      chatService,
      config,
      intents
    )

    const response = await chatbotProcessor.processMessage(savedMessage)

    // Enviar resposta via WhatsApp API
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v17.0/${businessPhone}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: customerPhone,
          type: response.type,
          text: { body: response.content },
        }),
      }
    )

    if (!whatsappResponse.ok) {
      throw new Error('Failed to send WhatsApp message')
    }

    // Salvar resposta enviada
    await chatService.sendMessage(chat.id, response.content)

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
