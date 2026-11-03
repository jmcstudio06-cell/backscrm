# 📋 CHECKLIST DE ENTREGA — Landing Page Backstage Pro

## ✅ ARQUIVO CRIADO

`src/pages/LandingNew.tsx` — Landing page de alta conversão pronta para edição

---

## 📝 CAMPOS PARA PREENCHER

### 1. CONFIGURAÇÕES GERAIS (linhas 17-42)

```typescript
const SITE_CONFIG = {
  // Links principais
  ctaUrl: "[PREENCHER: URL checkout/cadastro]",
  whatsappNumber: "[PREENCHER: número WhatsApp com DDD]",
  whatsappEnabled: false, // true para mostrar botão flutuante
  
  // Redes sociais
  instagramUrl: "[PREENCHER: @backstagepro ou URL completo]",
  emailContato: "[PREENCHER: contato@backstageproapp.com]",
  
  // Pixel Meta
  metaPixelId: "[PREENCHER: ID do Pixel]",
  
  // Vídeo demonstrativo
  videoUrl: "[PREENCHER: URL do vídeo MP4]",
  videoPoster: "[PREENCHER: URL thumbnail do vídeo]",
  
  // Countdown oferta
  ofertaAtiva: false, // true para ativar countdown
  ofertaTexto: "[PREENCHER: 30% OFF nos primeiros 100]",
  ofertaDataFim: "2024-12-31T23:59:59",
};
```

**Ações necessárias:**
- [ ] Definir URL de destino do CTA principal (checkout, cadastro ou WhatsApp)
- [ ] Preencher número WhatsApp formatado (ex: 5511999999999)
- [ ] Adicionar Instagram e email de contato
- [ ] Configurar ID do Meta Pixel (quando disponível)
- [ ] Fazer upload do vídeo demonstrativo e pegar URL + thumbnail
- [ ] Decidir se ativa countdown de oferta e definir data fim

---

### 2. PLANOS E PREÇOS (linhas 44-78)

```typescript
const PLANOS = [
  {
    nome: "[PREENCHER: Starter]",
    preco: "[PREENCHER: R$ 29,90]",
    periodo: "/mês",
    destaque: false,
    recursos: [
      "[PREENCHER: Agenda de shows]",
      "[PREENCHER: Controle financeiro básico]",
      "[PREENCHER: 50 clientes]",
    ]
  },
  // ... mais 2 planos
]
```

**Ações necessárias:**
- [ ] Definir nome de cada plano
- [ ] Definir preço exato de cada plano
- [ ] Listar recursos/funcionalidades incluídos em cada plano
- [ ] Marcar qual plano é o destaque (mais popular)

---

### 3. FAQ — CONFIRMAR RESPOSTAS (linhas 80-124)

As perguntas já estão escritas, mas 5 respostas dependem de regras do negócio:

#### Pergunta 3: "Preciso instalar algum aplicativo?"
```
Resposta atual: "Não. O Backstage Pro funciona direto no navegador..."
[CONFIRMAR: disponibilidade de app nativo iOS/Android]
```

#### Pergunta 4: "Como funciona o pagamento?"
```
[CONFIRMAR: 
- Aceita cartão de crédito? PIX? Boleto?
- É recorrente automático?
- Qual processadora (Stripe, PagSeguro, etc)?
- Quando é cobrado (no ato, todo dia X)?
- Como alterar plano?]
```

#### Pergunta 5: "Posso cancelar quando quiser?"
```
[CONFIRMAR:
- Cancelamento é imediato ou no fim do período?
- Tem fidelidade mínima?
- Há reembolso proporcional?
- Como o artista cancela (self-service ou precisa pedir)?]
```

#### Pergunta 6: "Meus dados ficam seguros?"
```
[CONFIRMAR:
- Tem certificação SSL/HTTPS?
- Onde os dados são hospedados (AWS, Google Cloud, Brasil)?
- Tem compliance com LGPD?
- Tem backup automático?]
```

#### Pergunta 7: "Tem suporte se eu precisar de ajuda?"
```
[CONFIRMAR:
- Canais disponíveis (WhatsApp, email, chat no app)?
- Horário de atendimento
- Tempo médio de resposta
- Suporte diferenciado por plano?]
```

#### Pergunta 8: "Posso testar antes de assinar?"
```
[CONFIRMAR:
- Existe período de trial gratuito?
- Quantos dias?
- Precisa cadastrar cartão de crédito?
- Trial tem funcionalidades limitadas?]
```

---

### 4. META PIXEL (linha 275 do componente)

Localizar este trecho no código:

```html
{/* Meta Pixel placeholder */}
{/* [PREENCHER: Colar código completo do Meta Pixel aqui] */}
```

**Ações necessárias:**
- [ ] Acessar Facebook Business Manager
- [ ] Criar Pixel de conversão (se não tiver)
- [ ] Copiar código completo fornecido pelo Meta
- [ ] Colar dentro do `<Helmet>` substituindo o comentário
- [ ] Configurar evento "Lead" no botão CTA (já preparado no código linha 256)

---

### 5. ASSETS VISUAIS

#### Logo (já integrado)
- ✅ Usando `brandIcon` do projeto (`@/assets/ba-icon.png`)

#### Vídeo Demonstrativo
- [ ] Gravar vídeo vertical (9:16) mostrando a plataforma em uso
- [ ] Duração ideal: 60-120 segundos
- [ ] Formato: MP4, comprimido (max 10MB)
- [ ] Fazer upload em CDN ou hosting confiável
- [ ] Gerar thumbnail estático (frame do vídeo)
- [ ] Atualizar URLs em `SITE_CONFIG.videoUrl` e `.videoPoster`

#### Screenshots Reais (seção Funcionalidades — linha 697)
Atualmente há um placeholder:

```html
<div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
  <p className="text-sm text-gray-700">
    <strong>🖼️ Screenshots reais:</strong> 
    [PREENCHER: Adicionar capturas de tela reais da plataforma...]
  </p>
</div>
```

**Ações necessárias:**
- [ ] Capturar telas reais de: Agenda, Clientes, Financeiro, Contratos
- [ ] Otimizar imagens (PNG ou WebP, max 500KB cada)
- [ ] Fazer upload
- [ ] Criar componente visual alternando esquerda/direita (ou contratar dev)

---

### 6. PROVA SOCIAL (seção escondida — linha 810)

A seção existe no código mas está `hidden` aguardando conteúdo real:

```html
<section className="py-20 bg-white hidden" data-placeholder="prova-social">
```

**Ações necessárias quando tiver depoimentos reais:**
- [ ] Coletar 3-6 depoimentos de artistas que usam
- [ ] Conseguir autorização para uso de nome, foto e frase
- [ ] Incluir: foto, nome, instrumento/tipo de artista, frase curta (1-2 linhas)
- [ ] Se possível, coletar logos de artistas/bandas conhecidos (com autorização)
- [ ] Remover classe `hidden` da section
- [ ] Implementar cards de depoimento

---

## 🎨 DESIGN SYSTEM IMPLEMENTADO

### Paleta de Cores
```css
Azul Principal:    #0066CC
Azul Escuro:       #003D7A
Azul Claro:        #E6F2FF
Preto:             #1A1A1A
Cinza Escuro:      #4A4A4A
Cinza Claro:       #F5F7FA
Branco:            #FFFFFF
Verde Sucesso:     #10B981
Vermelho Problema: #EF4444
```

### Tipografia (Inter via Google Fonts)
- Hero H1: 56px desktop / 36px mobile, peso 700
- H2 Seções: 42px desktop / 28px mobile, peso 700
- H3 Cards: 24px, peso 600
- Corpo: 18px desktop / 16px mobile, peso 400
- Botões: 16px, peso 600

### Espaçamento
- Seções: `py-20` (80px mobile) / `lg:py-32` (128px desktop)
- Cards: `p-8` (32px) / `p-6` (24px mobile)
- Gaps: 16px / 24px / 32px / 48px

---

## 🚀 PRÓXIMOS PASSOS

### 1. Imediato (antes de publicar)
- [ ] Preencher todos os `[PREENCHER]` no `SITE_CONFIG`
- [ ] Definir preços e recursos dos planos
- [ ] Confirmar respostas do FAQ marcadas com `[CONFIRMAR]`
- [ ] Fazer upload do vídeo demonstrativo
- [ ] Configurar Meta Pixel

### 2. Após testes internos
- [ ] Capturar screenshots reais da plataforma
- [ ] Adicionar imagens na seção Funcionalidades
- [ ] Testar responsividade em dispositivos reais (360px, 390px, 768px, 1920px)
- [ ] Testar vídeo autoplay em iOS Safari e Chrome Android
- [ ] Validar acessibilidade com leitor de tela

### 3. Quando tiver tração
- [ ] Coletar depoimentos reais de 3-5 artistas
- [ ] Ativar seção de Prova Social
- [ ] Implementar tracking de conversão completo
- [ ] Testar variações de headline (A/B test)

---

## 📱 COMO INTEGRAR NO PROJETO

### Opção 1: Substituir landing atual
```tsx
// Em src/App.tsx ou routes
import LandingNew from "@/pages/LandingNew";

// Trocar rota
<Route path="/landing" element={<LandingNew />} />
```

### Opção 2: Criar rota paralela para testar
```tsx
<Route path="/landing" element={<Landing />} /> {/* atual */}
<Route path="/nova" element={<LandingNew />} /> {/* nova */}
```

Depois de validar, trocar `/landing` pela nova.

---

## 🎯 CONVERSÃO — ELEMENTOS IMPLEMENTADOS

✅ **Header sticky** com CTA sempre visível  
✅ **Hero forte** focado na dor (desorganização custa dinheiro)  
✅ **Problema visual** (4 cards mostrando dores reais)  
✅ **Vídeo demonstrativo** em moldura de celular com controle de play/pause  
✅ **Timeline de 3 passos** com números destacados  
✅ **Grid de 6 funcionalidades** com ícones e descrições curtas  
✅ **Antes x Depois** lado a lado (comparação visual)  
✅ **3 planos** com destaque no recomendado  
✅ **Countdown de oferta** (opcional, desativado por padrão)  
✅ **FAQ accordion** com 8 perguntas  
✅ **CTA final** em fundo azul com botão grande  
✅ **WhatsApp flutuante** (opcional, desativado por padrão)  
✅ **Footer completo** com links e contatos  
✅ **Animações de scroll** suaves com fade-in + translate  
✅ **Mobile-first** testado em 360px  
✅ **SEO básico** (title, meta, Open Graph)  
✅ **Tracking pronto** para Meta Pixel  

---

## 📊 MÉTRICAS PARA ACOMPANHAR

Após publicar, configurar tracking de:

1. **Taxa de clique no CTA** (quantos clicam vs. quantos acessam)
2. **Tempo na página** (meta: +90 segundos)
3. **Scroll depth** (quantos chegam em Planos, FAQ, CTA Final)
4. **Taxa de conversão** (cliques no CTA que viram cadastro/compra)
5. **Origem do tráfego** (Instagram, Facebook, Google, direto)

---

## 🐛 TROUBLESHOOTING

### Vídeo não carrega
- Verificar formato (MP4 H.264)
- Verificar CORS no servidor do vídeo
- Testar URL diretamente no navegador

### Animações não funcionam
- Verificar `IntersectionObserver` no navegador (IE11 não suporta)
- Adicionar polyfill se necessário

### Countdown não aparece
- Verificar `ofertaAtiva: true` no `SITE_CONFIG`
- Verificar data no formato ISO correto

### Botão WhatsApp não aparece
- Verificar `whatsappEnabled: true`
- Verificar formato do número (sem espaços, hífens ou parênteses)

---

## 📞 SUPORTE

Dúvidas sobre implementação? Verifique:
- Código comentado em `LandingNew.tsx`
- Estrutura de `SITE_CONFIG` no topo do arquivo
- Console do navegador para erros

---

**Landing criada por Kiro AI**  
Data: 28/10/2026  
Versão: 1.0  
Status: ✅ Pronta para edição e publicação
