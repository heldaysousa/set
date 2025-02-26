import { create } from 'zustand'
import { Plan, PlanId, plans } from '@/config/plans'

interface PlansStore {
  selectedPlan: PlanId | null
  plans: Plan[]
  isLoading: boolean
  error: string | null
  setSelectedPlan: (planId: PlanId) => void
  setPlanError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  getPlanById: (planId: PlanId) => Plan | undefined
  getSelectedPlan: () => Plan | undefined
  clearSelectedPlan: () => void
}

export const usePlansStore = create<PlansStore>((set, get) => ({
  selectedPlan: null,
  plans: plans,
  isLoading: false,
  error: null,

  setSelectedPlan: (planId) => {
    set({ selectedPlan: planId })
  },

  setPlanError: (error) => {
    set({ error })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  getPlanById: (planId) => {
    return get().plans.find(plan => plan.id === planId)
  },

  getSelectedPlan: () => {
    const { selectedPlan, plans } = get()
    if (!selectedPlan) return undefined
    return plans.find(plan => plan.id === selectedPlan)
  },

  clearSelectedPlan: () => {
    set({ selectedPlan: null })
  }
}))
