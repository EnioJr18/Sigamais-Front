# 🎓 SIGA+ Frontend

> Frontend do **SIGA+** — Sistema Inteligente de Gestão Acadêmica, uma plataforma web moderna e responsiva voltada para a gestão de alunos, professores, turmas, matrículas, notas, frequência e acompanhamento de risco acadêmico.

---

## 📖 Sobre o SIGA+
O SIGA+ é um sistema acadêmico inspirado em plataformas institucionais de gestão escolar, com um diferencial importante: o **Alerta de Risco Acadêmico**. 

Além de permitir o gerenciamento de dados acadêmicos, o sistema identifica alunos em situação de risco com base em notas e faltas. Isso permite que professores e coordenação atuem antes que o problema evolua para reprovação, evasão ou abandono. O frontend foi construído para consumir uma API REST desenvolvida em Spring Boot.

---

## 🎯 Objetivo do Frontend
Oferecer uma interface clara, moderna e funcional para os três principais perfis do sistema, garantindo que cada usuário tenha acesso apenas às funcionalidades correspondentes à sua permissão:
* Administrador / Secretaria / Coordenação
* Professor
* Aluno

---

## 🚀 Tecnologias Utilizadas
A interface foi construída com as melhores ferramentas do ecossistema front-end atual:
* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **React Router**
* **React Query**
* **React Hook Form**
* **Zod**
* **Axios**
* **Lucide React**

---

## 👥 Perfis e Funcionalidades

### 👑 Perfil Administrador
Possui acesso administrativo e visão global do sistema.
* Dashboard geral institucional.
* Cadastro, edição e exclusão de alunos, professores, disciplinas e turmas.
* Gestão de matrículas de alunos em turmas.
* Lançamento e visualização de notas e frequência.
* Visualização global de alertas de risco.
* Notificação da coordenação em casos de risco alto.
* Tela de acompanhamento e gestão dos alertas da coordenação.
* Atualização de status, observações e consulta do histórico de acompanhamento.

### 👨‍🏫 Perfil Professor
Possui acesso restrito e filtrado às turmas que ministra, evitando acesso a dados de outros professores.
* Dashboard personalizado.
* Acesso às "Minhas turmas".
* Visualização e lançamento de notas.
* Visualização e lançamento de frequência.
* Alerta de risco restrito aos alunos das suas turmas.
* Botão para notificação da coordenação em casos de risco alto.

### 👨‍🎓 Perfil Aluno
Possui acesso exclusivo aos próprios dados acadêmicos, sem painéis administrativos.
* Dashboard do estudante.
* Minhas turmas e disciplinas atuais.
* Minhas notas (com modal para detalhes individuais).
* Minha frequência consolidada.
* Meu risco acadêmico atual.
* Toast persistente de alerta quando em situação de risco.

---

## 🚨 Alerta de Risco Acadêmico (CRM Escolar)
O principal diferencial do SIGA+. O sistema classifica o risco do aluno avaliando fatores como média acadêmica, quantidade de faltas e motivos associados. Os níveis são exibidos visualmente (Badges) para rápida identificação.

### Fluxo de Intervenção
1. O backend calcula o risco e envia ao frontend.
2. Alunos em risco são listados na tela de Alerta.
3. Se o risco for **ALTO**, professores ou administradores podem usar o botão **Notificar coordenação**.
4. A API registra o alerta e envia um e-mail aos coordenadores.
5. O caso passa a ser exibido na tela de Alertas da Coordenação.
6. A coordenação atualiza os status (PENDENTE, EM_ACOMPANHAMENTO, RESOLVIDO).
7. Cada atualização gera uma entrada no **Histórico de Acompanhamento** (Timeline).

### Toast Persistente para o Aluno
Quando o aluno está em situação de risco, um toast de aviso aparece em sua tela.
* É exibido apenas no perfil do aluno.
* Não desaparece automaticamente, exigindo fechamento manual.
* Contém atalho direto para a tela "Meu Risco".

---

## 🔐 Autenticação, Segurança e UX
* **Segurança:** Login via JWT com armazenamento seguro, proteção avançada de rotas, redirecionamento automático, interceptor no Axios para envio de token e logout por expiração de sessão.
* **Perfil do Usuário:** Visualização de dados e alteração de senha segura (exige validação da senha atual).
* **Interface (UI/UX):** Layout responsivo adaptado para mobile (cards) e desktop (tabelas). Identidade visual com cores branca, azul e laranja. Suporte completo a **Modo Claro** e **Modo Escuro**.
* **Tratamento de Erros:** Feedbacks visuais (sucesso/erro), loading states, empty states amigáveis e bloqueio imediato para acessos não autorizados (`/acesso-negado`).

---

## 🏗️ Arquitetura e Rotas

O projeto utiliza uma estrutura modular para facilitar a manutenção:

```text
src/
├── components/ (header, footer, layout, ui)
├── pages/      (alerts, auth, dashboard, profile, risk, student)
├── services/   (api.ts, authService.ts, alertaRiscoService.ts, etc.)
├── hooks/
├── routes/
├── utils/
├── assets/
├── index.css
└── main.tsx
```

### Mapa de Rotas
| Acesso | Rotas |
|---|---|
| Gerais | `/login, /dashboard, /perfil, /acesso-negado` |
| Administrativas | `/alunos, /professores, /disciplinas, /turmas, /matriculas, /notas, /frequencia, /risco, /alertas` |
| Alunos | `/minhas-turmas, /minhas-notas, /minha-frequencia, /meu-risco` |

---

## 💻 Como Executar o Projeto Localmente
1. Clone o repositório
```bash
git clone <url-do-repositorio>
```
2. Acesse a pasta do projeto
```bash
cd Sigamais-frontend
```
3. Instale as dependências
```bash
npm install
```
4. Configure as variáveis de ambiente
Crie um arquivo .env na raiz do projeto (nunca comite este arquivo) e aponte para a URL da sua API:
```bash
VITE_API_URL=http://localhost:8080
```
5. Inicie o servidor local
```bash
npm run dev
```
O frontend estará acessível em http://localhost:5173.

---

## 📜 Scripts do NPM

| Comando | Ação |
|---|---|
| `npm run dev` | Inicia o ambiente de desenvolvimento local. |
| `npm run build` | Gera o pacote otimizado para produção. |
| `npm run lint` | Analisa o código buscando erros de padronização. |
| `npm run preview` | Serve os arquivos gerados pelo build localmente. |

---
## 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

---

## 👨‍💻 Autores

* **Enio Junior**
* **David Gabriel**
* **Jean Marcos**
* **Yury Galvão**

**Desenvolvido para fins de estudo, portfólio e Trabalho na matéria de Programação Orientada à Objetos 💻**

**O SIGA+ é um projeto full-stack. As regras de segurança, cálculo matemático de risco e controle de banco de dados são processadas pela nossa API em Spring Boot.**