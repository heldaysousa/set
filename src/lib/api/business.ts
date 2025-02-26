import { supabase } from '@/lib/supabase'
import type { Business, BusinessSettings } from '@/lib/types/supabase'

export class BusinessAPI {
  /**
   * Busca um negócio pelo ID
   */
  static async getById(id: string): Promise<Business | null> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar negócio:', error)
      throw error
    }

    return data
  }

  /**
   * Cria um novo negócio
   */
  static async create(data: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<Business> {
    const { data: business, error } = await supabase
      .from('businesses')
      .insert([data])
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('Erro ao criar negócio:', error)
      throw error
    }

    if (!business) {
      throw new Error('Negócio não foi criado')
    }

    return business
  }

  /**
   * Atualiza um negócio existente
   */
  static async update(id: string, data: Partial<Business>): Promise<Business> {
    const { data: business, error } = await supabase
      .from('businesses')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('Erro ao atualizar negócio:', error)
      throw error
    }

    if (!business) {
      throw new Error('Negócio não encontrado')
    }

    return business
  }

  /**
   * Atualiza as configurações de um negócio
   */
  static async updateSettings(id: string, settings: BusinessSettings): Promise<Business> {
    const { data: business, error } = await supabase
      .from('businesses')
      .update({
        settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('Erro ao atualizar configurações:', error)
      throw error
    }

    if (!business) {
      throw new Error('Negócio não encontrado')
    }

    return business
  }

  /**
   * Verifica se um negócio tem todas as configurações necessárias
   */
  static async checkSetup(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('businesses')
      .select('has_completed_setup')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Erro ao verificar configuração:', error)
      throw error
    }

    return data?.has_completed_setup || false
  }

  /**
   * Marca um negócio como configurado
   */
  static async completeSetup(id: string): Promise<void> {
    const { error } = await supabase
      .from('businesses')
      .update({
        has_completed_setup: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Erro ao concluir configuração:', error)
      throw error
    }
  }
}
