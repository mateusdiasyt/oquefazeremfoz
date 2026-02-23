# Planejador Inteligente de Viagem — Foz do Iguaçu

Funcionalidade integrada ao OQFOZ que permite ao turista montar um roteiro por atrativos e obter custos e dias otimizados.

## Rotas

- **Página pública:** `/planejador-de-viagem`  
  Formulário (dias, pessoas, tipo de viagem, transporte, atrativos) e resultado com roteiro por dia, custos e dicas.

- **Admin:** `/admin/planejador` (requer login ADMIN)  
  - **Aba Atrativos:** CRUD de atrativos (nome, preços, duração, região, transporte, documento, ativo).  
  - **Aba Configurações gerais:** Alimentação (econômica/padrão/conforto), multiplicadores de transporte, horas máximas por dia, moeda.

## Banco de dados

Após adicionar os modelos ao `schema.prisma`, rode:

```bash
npx prisma generate
npx prisma db push
# ou: npx prisma migrate dev --name add-planejador
npm run prisma:seed
```

- **atrativo:** id, nome, precoAdultoCents, precoCriancaCents, duracaoMediaHoras, tempoDeslocamentoMedioHoras, regiao, nivelCansaco, custoTransporteMedioCents, exigeDocumento, ativo, ordem.
- **planejadorconfig:** uma linha (id = 'default') com valores de alimentação e multiplicadores.

O seed cria a config padrão e 12 atrativos iniciais (Cataratas Brasil/Argentina, Parque das Aves, Itaipu, Marco das 3 Fronteiras, Museu de Cera, Vale dos Dinossauros, Bar de Gelo, Compras no Paraguai, City Tour, Passeio de Barco).

## Regras de negócio

- Um dia = até 8 horas úteis (configurável no admin).
- Tempo por atrativo = duração média + tempo de deslocamento.
- Se o tempo total dos atrativos superar a capacidade (dias × 8h), o sistema exibe aviso e sugere “Ajustar para X dias” ou “Continuar mesmo assim”.
- Roteirização agrupa por região e evita Argentina + Paraguai no mesmo dia.
- Custos: ingressos (adulto/criança), transporte (Uber/carro/transfer com multiplicadores), alimentação (por tipo de viagem × dias × pessoas).

## APIs

- `GET /api/planejador/atrativos` — Lista atrativos ativos (público).
- `GET /api/planejador/config` — Configurações públicas (público).
- `POST /api/planejador/calcular` — Body: `{ dias, pessoas, tipoViagem, transporte, atrativosIds }`. Retorna roteiro, custos e aviso de dias.
- `GET/POST /api/admin/planejador/atrativos` — Listar/criar atrativos (admin).
- `GET/PUT/DELETE /api/admin/planejador/atrativos/[id]` — Ver/editar/excluir atrativo (admin).
- `GET/PUT /api/admin/planejador/config` — Ver/editar configurações (admin).

## Rodar localmente

1. Configure `.env` com `DATABASE_URL` (Neon/PostgreSQL).
2. `npm install`
3. `npx prisma generate && npx prisma db push && npm run prisma:seed`
4. `npm run dev`
5. Acesse `http://localhost:3000/planejador-de-viagem` para o planejador e `http://localhost:3000/admin` (com usuário ADMIN) para gerenciar atrativos e configurações.

Nenhum scraping é utilizado; todos os valores vêm do banco, editáveis pelo admin.
