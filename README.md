# CEO Express

CEO Express é uma aplicação web moderna para gestão de salões de beleza e barbearias, desenvolvida com React, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

- ✨ Interface moderna e responsiva
- 🌓 Tema claro/escuro
- 📱 Design mobile-first
- 📊 Dashboard com métricas importantes
- 📅 Gestão de agendamentos
- 👥 Cadastro de clientes
- 💇‍♂️ Controle de serviços
- 💰 Gestão financeira
- ⚙️ Configurações personalizáveis

## 🛠️ Tecnologias

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Recharts](https://recharts.org/)
- [React Query](https://tanstack.com/query/latest)
- [React Router](https://reactrouter.com/)
- [Lucide Icons](https://lucide.dev/)

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/heldaysousa/celoceo.git

# Entre no diretório
cd celoceo

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🔧 Configuração

1. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

2. Configure o banco de dados Supabase com as seguintes tabelas:
   - users
   - businesses
   - appointments
   - clients
   - services
   - professionals
   - financial_transactions

## 📚 Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── features/      # Funcionalidades específicas
├── hooks/         # Hooks personalizados
├── lib/           # Bibliotecas e utilitários
├── pages/         # Páginas da aplicação
├── services/      # Serviços e APIs
├── stores/        # Gerenciamento de estado
├── styles/        # Estilos globais
└── types/         # Definições de tipos
```

## 🧪 Testes

```bash
# Execute os testes unitários
npm run test

# Execute os testes e2e
npm run test:e2e
```

## 📱 PWA

A aplicação é uma Progressive Web App (PWA) e pode ser instalada em dispositivos móveis e desktop.

## 🔒 Autenticação

- Autenticação via email/senha
- Recuperação de senha
- Proteção de rotas
- Níveis de permissão

## 💼 Funcionalidades do Dashboard

1. **Métricas Principais**
   - Total de clientes
   - Agendamentos do dia
   - Faturamento
   - Serviços ativos

2. **Gráficos**
   - Faturamento mensal
   - Distribuição de serviços

3. **Próximos Agendamentos**
   - Lista de agendamentos do dia
   - Detalhes rápidos

## 🎨 Personalização

O tema pode ser personalizado através do arquivo `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... outras variáveis ... */
}
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request 

## 📞 Suporte

Para suporte, envie um email para suporte@celoexpress.com.br ou abra uma issue no GitHub.
