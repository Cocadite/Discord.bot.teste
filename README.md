# Anti-Raid Bot (TESTE)

Este projeto é a versão **de teste**: ao detectar gatilhos graves, ele aplica **KICK + LOCKDOWN de 60s** (em vez de BAN).

## Requisitos
- Node.js 18+
- Permissões do bot: View Audit Log, Manage Channels, Kick Members, Moderate Members

## Setup
1. `npm i`
2. Copie `.env.example` para `.env` e preencha.
3. Registre os comandos: `npm run register`
4. Inicie: `npm start`

## Lockdown (TESTE)
Durante o lockdown de 60s, **apenas**:
- `OWNER_ID`
- membros com cargo `STAFF_ROLE_ID`
podem mandar mensagem (em canais de texto).

