# Gestão de Escalas de Policiais (Police Scales Management)

Este documento descreve as especificações técnicas, regras de negócio e o modelo de dados para o sistema de gestão de escalas de policiais, composto pelos módulos de **Gestão de Viagens** e **Gestão de Sobreaviso**.

---

## 🏗️ Arquitetura e Tecnologias

- **Frontend:** Next.js (Responsivo para Web, Android e iOS).
- **Backend/Database:** Firebase Cloud Firestore (Tempo real).
- **Autenticação:** Firebase Authentication (E-mail/Senha + Integração Corporativa).
- **Notificações:** Firebase Cloud Messaging (FCM) para push notifications.
- **Automações:** Cloud Functions para integrações com APIs externas (Google Calendar/iCal).
- **Auditoria:** Cloud Logging para trilha de alterações administrativa.

---

## 📊 Modelo de Dados (Firestore)

### 1. Coleção `policiais`
Armazena o perfil e o saldo de pontuação para o ranking.
- `id`: string (UID)
- `nome`: string
- `cpf_matricula`: string
- `status`: string (ativo/inativo)
- `pontos_acumulados_viagem`: number (Acumulado para o ranking de viagens)
- `dias_acumulados_sobreaviso`: number (Acumulado para o ranking de sobreaviso)

### 2. Coleção `impedimentos`
Bloqueios temporários que impedem a escala.
- `id_policial`: string (Reference)
- `tipo`: enum (férias, missão, curso, licença)
- `data_inicio`: timestamp
- `data_fim`: timestamp

### 3. Coleção `viagens`
Controle de missões e deslocamentos.
- `destino`: string
- `data_inicio`: timestamp
- `data_fim`: timestamp
- `nivel`: number (1, 2, 3 ou "Longa Duração")
- `policial_designado`: string (Reference)
- `status`: enum (pendente, confirmado)

### 4. Coleção `sobreaviso`
Plantões e disponibilidade imediata.
- `data`: date
- `horario_inicio`: timestamp
- `horario_fim`: timestamp
- `policial_designado`: string (Reference)
- `status`: enum (pendente, confirmado)

---

## 🧠 Regras de Negócio e Lógica de Sugestão

### Módulo de Viagens
O sistema utiliza um ranking de meritocracia/equidade para sugerir o policial mais adequado.

1. **Cálculo de Pontuação:**
   - Nível 1: 1 ponto
   - Nível 2: 2 pontos
   - Nível 3: 3 pontos
   - Duração > 7 dias: 3 pontos (Fixo)
   - *Regra:* Aplica-se sempre o **maior valor** entre as condições acima.

2. **Algoritmo de Sugestão:**
   - **Filtro:** Listar policiais que NÃO possuem impedimentos ativos no intervalo da viagem.
   - **Ordenação:** Sugerir o policial com a **menor pontuação acumulada** (`pontos_acumulados_viagem`).

### Módulo de Sobreaviso
1. **Algoritmo de Sugestão:**
   - **Filtro:** Listar policiais sem impedimentos na data/horário.
   - **Ordenação:** Sugerir o policial com o **menor total de dias acumulados** (`dias_acumulados_sobreaviso`).

---

## 🖥️ Funcionalidades da Interface (UI/UX)

### Painel Administrativo (Chefia)
- **CRUD de Escalas:** Criação e edição de viagens e plantões de sobreaviso.
- **Gestão de Impedimentos:** Interface com calendário para registro de férias/licenças.
- **Ranking View:** Dashboard comparativo da pontuação atual de todo o efetivo.
- **Exportação:** Geração de relatórios em **CSV e PDF** para fins administrativos.

### Interface do Policial
- **App Responsivo:** Acesso via navegador no celular.
- **Centro de Notificações:** Alertas visuais e push para novas designações.
- **Botão "Dar Ciência":** Confirmação obrigatória que oficializa a escala e atualiza a pontuação.

---

## ⚙️ Integrações e Automações

### Sincronização com Agenda (Google Calendar/iCal)
Ao clicar em "Dar Ciência", uma Cloud Function é acionada:
1. Verifica o e-mail do policial.
2. Cria um evento automático na agenda com lembretes configurados (ex: 2h antes).
3. O evento contém os detalhes do destino e horários.

### Trilha de Auditoria (Audit Log)
Todo registro ou alteração feita pela Chefia é logada via Cloud Logging, registrando:
- Quem alterou (ID do Admin).
- O que foi alterado (dados antigos vs novos).
- Timestamp da ação.

---
**Status do Projeto:** Definição/Exploração Técnica.
