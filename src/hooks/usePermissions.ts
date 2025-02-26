import { useAuthStore } from '@/stores/authStore'

type Permission = 'read' | 'write' | 'delete' | 'admin'
type Resource = 'financeiro' | 'agenda' | 'clientes' | 'servicos' | 'configuracoes'

export function usePermissions() {
  const { user } = useAuthStore()

  const hasPermission = (resource: Resource, permission: Permission): boolean => {
    if (!user) return false

    // Se o usuário for admin, tem todas as permissões
    if (user.role === 'admin') return true

    // Verifica as permissões específicas do usuário
    const userPermissions = user.permissions || {}
    return !!userPermissions[resource]?.includes(permission)
  }

  const checkPermission = (resource: Resource, permission: Permission): void => {
    if (!hasPermission(resource, permission)) {
      throw new Error(`Você não tem permissão para ${permission} em ${resource}`)
    }
  }

  return {
    hasPermission,
    checkPermission,
    isAdmin: user?.role === 'admin',
    role: user?.role
  }
}
