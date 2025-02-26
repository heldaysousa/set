import { supabase } from './supabase'
import { useBusinessStore } from '@/stores/businessStore'

export async function fetchBusiness(businessId: string | undefined) {
  if (!businessId) return null

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (error) throw error

    // Atualiza o estado global
    const { setBusiness } = useBusinessStore.getState()
    setBusiness(data)

    return data
  } catch (error) {
    console.error('Erro ao buscar dados do negócio:', error)
    return null
  }
}

export async function updateBusiness(businessId: string, data: Partial<Business>) {
  try {
    const { error } = await supabase
      .from('businesses')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)

    if (error) throw error

    // Atualiza o estado global
    await fetchBusiness(businessId)

    return true
  } catch (error) {
    console.error('Erro ao atualizar dados do negócio:', error)
    return false
  }
}
