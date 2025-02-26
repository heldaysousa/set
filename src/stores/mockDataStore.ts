import { create } from 'zustand'
import { mockUserData } from '../mocks/userData'

interface MockDataState {
  user: typeof mockUserData.user
  business: typeof mockUserData.business
  dashboardData: typeof mockUserData.dashboardData
  initialize: () => void
}

export const useMockDataStore = create<MockDataState>((set) => ({
  user: mockUserData.user,
  business: mockUserData.business,
  dashboardData: mockUserData.dashboardData,
  initialize: () => {
    set({
      user: mockUserData.user,
      business: mockUserData.business,
      dashboardData: mockUserData.dashboardData
    })
  }
}))
