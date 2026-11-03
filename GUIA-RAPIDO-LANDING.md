# 🚀 GUIA RÁPIDO — Landing Page Backstage Pro

## 📁 Arquivos Criados

```
src/
├── pages/
│   └── LandingNew.tsx          ← Componente React da landing
└── config/
    └── landing-config.ts       ← ARQUIVO PRINCIPAL PARA EDITAR

LANDING-NOVA-CHECKLIST.md       ← Checklist completa (leia primeiro)
GUIA-RAPIDO-LANDING.md         ← Este arquivo
```

---

## ⚡ COMO EDITAR (para não-programadores)

### 1. Abra o arquivo `src/config/landing-config.ts`

Este é o **único** arquivo que você precisa editar. Todos os textos, preços e links estão lá.

### 2. Procure a seção que quer alterar

```typescript
// Exemplo: Mudar o título da página
meta: {
  title: "Backstage Pro — Organize sua carreira musical como um negócio",
  // Edite aqui ↑
}
```

### 3. Edite o texto entre aspas

```typescript
// ANTES
title: "Backstage Pro — Organize sua carreira musical como um negócio",

// DEPOIS
title: "Backstage Pro — A plataforma do artista profissional",
```

### 4. Salve o arquivo (Ctrl+S)

A página será atualizada automaticamente se o servidor estiver rodando.

---

## 📝 PRINCIPAIS EDIÇÕES

### Mudar o texto do botão principal
```typescript
links: {
  ctaUrl: "https://app.backstageproapp.com/cadastro",  // ← LINK DO BOTÃO
}

copy: {
  hero: {
    ctaPrimario: "Quero organizar minha carreira",  // ← TEXTO DO BOTÃO
  }
}
```

### Adicionar WhatsApp flutuante
```typescript
links: {
  whatsappNumber: "5512992423317",  // ← SEU NÚMERO (só números)
  whatsappEnabled: true,            // ← MUDE PARA true
  whatsappMessage: "Oi! Quero saber mais sobre o Backstage Pro",
}
```

### Ativar oferta com countdown
```typescript
oferta: {
  ativa: true,  // ← MUDE PARA true
  texto: "🔥 30% OFF nos primeiros 100 cadastros",
  dataFim: "2024-12-31T23:59:59",  // ← DATA QUE A OFERTA ACABA
}
```

### Alterar preços dos planos
```typescript
planos: [
  {
    nome: "Profissional",
    preco: "R$ 49,90",  // ← PREÇO AQUI
    recursos: [         // ← LISTA DO QUE INCLUI
      "Tudo do Starter",
      "Clientes ilimitados",
      // ...
    ]
  }
]
```

### Mudar texto do hero (título principal)
```typescript
copy: {
  hero: {
    headline: "Sua carreira musical também é um negócio",
    headlineDestaque: "negócio",  // ← palavra que fica em azul
    subtitulo: "Centralize agenda de shows, clientes...",
  }
}
```

---

## 🎨 ASSETS QUE PRECISAM SER ADICIONADOS

### 1. Vídeo Demonstrativo
```typescript
video: {
  url: "https://cdn.seustorage.com/demo-vertical.mp4",  // ← COLOQUE A URL
  poster: "https://cdn.seustorage.com/thumb.jpg",       // ← IMAGEM DE CAPA
}
```

**Especificações do vídeo:**
- Formato: MP4 (H.264)
- Orientação: Vertical (9:16 - formato de celular)
- Duração: 60-120 segundos
- Tamanho: máximo 10MB (comprimir se necessário)

**Onde hospedar:**
- Cloudinary (recomendado)
- AWS S3
- Google Cloud Storage
- Ou qualquer CDN confiável

### 2. Meta Pixel (Facebook Ads)
```typescript
tracking: {
  metaPixelId: "1234567890",  // ← COLE O ID DO PIXEL
  metaPixelEnabled: true,     // ← ATIVE AQUI
}
```

**Como conseguir o Pixel:**
1. Entre no Facebook Business Manager
2. Configurações → Fontes de Dados → Pixels
3. Copie o ID do Pixel (só números)
4. Cole no `metaPixelId`
5. Mude `metaPixelEnabled` para `true`

---

## 🔗 INTEGRAR NO SITE

### Opção 1: Substituir landing atual

Em `src/App.tsx` ou no arquivo de rotas:

```tsx
// Trocar
import Landing from "@/pages/Landing";

// Por
import LandingNew from "@/pages/LandingNew";

// E na rota
<Route path="/landing" element={<LandingNew />} />
```

### Opção 2: Testar em paralelo

```tsx
<Route path="/landing" element={<Landing />} />      {/* atual */}
<Route path="/nova" element={<LandingNew />} />      {/* nova */}
```

Acesse `/nova` para testar. Quando validar, troque a rota principal.

---

## ✅ CHECKLIST ANTES DE PUBLICAR

- [ ] Preenchi o `ctaUrl` com o link correto de cadastro/checkout
- [ ] Adicionei todos os preços e recursos dos planos
- [ ] Revisei todas as respostas do FAQ (removi os `[CONFIRMAR]`)
- [ ] Adicionei o vídeo demonstrativo (URL + thumbnail)
- [ ] Configurei o Meta Pixel (se usar Facebook Ads)
- [ ] Adicionei Instagram e email de contato
- [ ] Testei em celular (360px, 390px)
- [ ] Testei em tablet (768px)
- [ ] Testei em desktop (1920px)
- [ ] Todos os botões levam para o destino correto
- [ ] Vídeo carrega e toca (testar em iOS Safari)
- [ ] Accordion do FAQ abre e fecha
- [ ] Scroll suave funciona ao clicar no menu

---

## 🐛 PROBLEMAS COMUNS

### "O vídeo não carrega"
- Verifique se a URL está correta e acessível
- Teste a URL diretamente no navegador
- Confirme que é formato MP4 (H.264)
- Verifique se o servidor permite CORS

### "O botão não faz nada ao clicar"
- Verifique se `ctaUrl` está preenchido
- Abra o Console do navegador (F12) e veja se há erros
- Confirme que a URL começa com `http://` ou `https://`

### "O countdown não aparece"
- Confirme que `oferta.ativa` está `true`
- Verifique se a `dataFim` está no futuro
- Formato da data deve ser: `"YYYY-MM-DDTHH:mm:ss"`

### "O botão do WhatsApp não aparece"
- Confirme que `whatsappEnabled` está `true`
- Número deve estar no formato: `5511999999999` (sem espaços, hífens ou parênteses)

---

## 📊 PRÓXIMOS PASSOS

1. **Agora**: Preencha `landing-config.ts` com dados reais
2. **Esta semana**: Grave o vídeo demonstrativo vertical
3. **Este mês**: Colete 3-5 depoimentos reais de artistas
4. **Quando tiver tração**: Ative seção de prova social (linha 810 do LandingNew.tsx)

---

## 📞 SUPORTE

**Dúvidas técnicas?**
- Leia primeiro: `LANDING-NOVA-CHECKLIST.md` (completo e detalhado)
- Código comentado: `src/pages/LandingNew.tsx`
- Configuração: `src/config/landing-config.ts`

**Precisa de ajuda?**
- Abra o Console do navegador (F12) para ver erros
- Faça backup antes de editar
- Teste sempre em ambiente local antes de publicar

---

**Criado por Kiro AI**  
28/10/2026
