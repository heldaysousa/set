import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { formatarMoeda } from '@/utils/formatters'

interface ComissoesProfissionaisProps {
  data: Array<{
    nome: string
    cargo: string
    foto: string
    valorComissao: number
    metaMensal: number
    servicosRealizados: number
  }>
}

export function ComissoesProfissionais({ data }: ComissoesProfissionaisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comissões da Equipe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {data.map((profissional, index) => (
          <div key={index} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profissional.foto} alt={profissional.nome} />
              <AvatarFallback>{profissional.nome.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium leading-none">{profissional.nome}</p>
                  <p className="text-sm text-muted-foreground">{profissional.cargo}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatarMoeda(profissional.valorComissao)}</p>
                  <p className="text-sm text-muted-foreground">{profissional.servicosRealizados} serviços</p>
                </div>
              </div>
              <Progress 
                value={(profissional.valorComissao / profissional.metaMensal) * 100} 
                className="h-2"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
