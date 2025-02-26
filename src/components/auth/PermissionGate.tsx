import { usePermissions } from '@/hooks/usePermissions'
import { toast } from 'sonner'

interface PermissionGateProps {
  resource: 'financeiro' | 'agenda' | 'clientes' | 'servicos' | 'configuracoes'
  permission: 'read' | 'write' | 'delete' | 'admin'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ 
  resource, 
  permission, 
  children, 
  fallback 
}: PermissionGateProps) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(resource, permission)) {
    // Se não tiver permissão, mostra uma mensagem
    toast.error(`Você não tem permissão para ${permission} em ${resource}`)
    
    // Retorna o fallback se fornecido, ou null
    return fallback ? <>{fallback}</> : null
  }

  // Se tiver permissão, renderiza o conteúdo
  return <>{children}</>
}
