# Webbot com Dashboard

Exemplo didatico para a etapa final da trilha: um bot web com historico, indicadores e uma pequena visao de atendimento.

O projeto nao usa backend. As conversas ficam em `localStorage`, e os graficos sao calculados no navegador para demonstrar como um sistema real poderia organizar dados de atendimento.

## O que o aluno aprende

- Como criar uma interface de chatbot para web.
- Como registrar historico de mensagens.
- Como classificar mensagens por assunto.
- Como transformar conversas em indicadores simples.

## Como rodar

Abra `index.html` no navegador.

Opcionalmente, sirva a pasta com:

```bash
python -m http.server 8003
```

Depois acesse `http://localhost:8003`.

## Proximos passos

- Criar um backend para salvar conversas reais.
- Adicionar login de atendente.
- Fazer deploy em uma plataforma como GitHub Pages, Azure Static Web Apps ou Vercel.
