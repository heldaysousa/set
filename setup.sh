#!/bin/bash

# Remover node_modules e package-lock.json existentes
rm -rf node_modules package-lock.json

# Instalar dependências
npm install

# Criar arquivo .env a partir do exemplo
cp .env.example .env

# Inicializar git (se necessário)
if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "Initial commit"
fi

# Criar diretórios necessários
mkdir -p src/{features/{auth,financeiro,dashboard},services/api,utils/{validators,formatters},components/{ui,layout},hooks,contexts,types,lib/schemas}

# Dar permissão de execução ao script
chmod +x setup.sh

echo "Setup concluído com sucesso!"
