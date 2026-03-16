# Finance Manager — Frontend

Interface web para gerenciamento de finanças pessoais, desenvolvida com React 18 e Vite.

## Tecnologias

- **React 18** — biblioteca de interface
- **Vite 6** — bundler e servidor de desenvolvimento
- **React Router DOM 6** — navegação entre páginas
- **Tailwind CSS 3** — estilização com classes utilitárias
- **Axios** — requisições HTTP com interceptors
- **React Hook Form** — gerenciamento de formulários
- **Recharts** — gráficos do dashboard
- **Lucide React** — ícones

## Pré-requisitos

- Node.js 18+
- npm 9+
- Backend rodando em `http://localhost:8080`

## Instalação

```bash
# Clone o repositório e entre na pasta do frontend
cd finance-manager-frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Scripts

```bash
npm run dev      # servidor de desenvolvimento com HMR
npm run build    # build otimizado para produção (gera pasta dist/)
npm run preview  # visualiza o build de produção localmente
```

## Configuração

### Proxy da API

Durante o desenvolvimento, o Vite redireciona automaticamente todas as chamadas `/api/*` para o backend em `localhost:8080`. Isso evita problemas de CORS sem precisar alterar nenhuma configuração no backend.

Se o backend estiver em uma porta diferente, edite `vite.config.js`:

```js
proxy: {
  '/api': {
    target: 'http://localhost:8080', // altere aqui
    changeOrigin: true
  }
}
```

### Build de produção

Para apontar para um backend em produção, edite `src/services/api.js`:

```js
const api = axios.create({
  baseURL: 'https://seu-backend.com/api', // altere aqui
})
```

## Estrutura do Projeto

```
src/
├── components/
│   ├── layout/         # Layout, Sidebar, Header
│   └── ui/             # Button, Input, Select, Card, Modal
├── contexts/
│   └── AuthContext.jsx # Estado global de autenticação
├── pages/
│   ├── auth/           # Login, Register
│   ├── dashboard/      # Dashboard com gráfico e resumo
│   ├── transactions/   # Listagem e CRUD de transações
│   ├── accounts/       # Listagem e CRUD de contas
│   ├── categories/     # Listagem e CRUD de categorias
│   └── subscriptions/  # Listagem e CRUD de assinaturas
├── routes/
│   └── PrivateRoute.jsx # Proteção de rotas autenticadas
├── services/
│   ├── api.js              # Instância Axios com interceptors JWT
│   ├── authService.js
│   ├── accountService.js
│   ├── categoryService.js
│   ├── transactionService.js
│   ├── subscriptionService.js
│   └── dashboardService.js
└── utils/
    └── formatters.js   # Formatação de moeda, datas e enums
```

## Funcionalidades

- Registro e login com persistência de sessão via localStorage
- Proteção de rotas — páginas privadas redirecionam para o login se não autenticado
- Token JWT injetado automaticamente em todas as requisições
- Redirecionamento automático para o login quando o token expira

**Dashboard**
- Cards de resumo: receitas, despesas e saldo do período
- Gráfico de pizza com breakdown de despesas por categoria
- Filtro de período com datas customizáveis

**Transações**
- Listagem com filtros por período, tipo (receita/despesa) e conta
- Cards de resumo do período filtrado
- Formulário com seleção de conta e categorias filtradas por tipo

**Contas**
- Cards visuais com cor customizável por conta
- Suporte a conta corrente, poupança, cartão de crédito e débito

**Categorias**
- Abas separando receitas e despesas
- Categorias do sistema protegidas contra edição e exclusão
- Categorias personalizadas por usuário

**Assinaturas**
- Toggle para exibir assinaturas canceladas
- Ações de cancelar e reativar sem excluir o histórico
- Custo mensal total calculado automaticamente

## Autenticação

O fluxo de autenticação funciona da seguinte forma:

```
Login/Register → token salvo no localStorage
     ↓
Axios interceptor injeta "Authorization: Bearer <token>" em toda requisição
     ↓
Se a API retornar 401 → localStorage limpo → redireciona para /login
```

O estado do usuário logado fica disponível em qualquer componente via:

```jsx
import { useAuth } from '../contexts/AuthContext'

const { user, logout, isAuthenticated } = useAuth()
```