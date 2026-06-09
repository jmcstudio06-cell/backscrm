const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7860;

// Configuração de CORS mais permissiva para extensões Chrome
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'access-token']
}));

app.use(express.json());
app.use(morgan('dev'));

// Rota raiz
app.get('/', (req, res) => {
    res.type('application/javascript');
    res.send('console.log("Backs CRM: Remote code loaded.");');
});

// Rota de saúde
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Rota para o arquivo de configuração
app.get('/config.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'config.json'));
});

// LOGIN LIBERADO (Modo Desenvolvedor)
// Aceita qualquer e-mail e senha, e ignora o ID da extensão no final da URL
app.all('/api/auth/login*', (req, res) => {
    const { email } = req.body || {};
    console.log(`Tentativa de login recebida para: ${email}`);
    
    res.json({
        success: true,
        bearer_token: "token-backs-crm-full-access",
        token: "token-backs-crm-full-access",
        user: {
            id: 1,
            name: "Administrador Backs",
            email: email || "admin@backscrm.com.br",
            role: "admin",
            premium: true,
            status: "active"
        }
    });
});

// Adicionando rota de validação de licença caso a extensão use esse endpoint
app.all('/api/auth/license/*', (req, res) => {
    res.json({ success: true, status: "active", type: "premium" });
});

// Validação de Token (Sempre autoriza)
app.all('/api/auth/validation/*', (req, res) => {
    res.json({ 
        success: true, 
        status: "authorized",
        user: {
            name: "Administrador Backs",
            premium: true
        }
    });
});

// Outras rotas de serviço (Mocks)
app.all('/api/services/initial-data/*', (req, res) => {
    res.json({ 
        success: true, 
        data: {
            tags: [],
            funnels: [],
            custom_fields: []
        } 
    });
});

app.all('/api/notify/get/premium/*', (req, res) => {
    res.json({ success: true, notifications: [] });
});

app.all('/api/services/update', (req, res) => {
    res.json({ success: true, message: "Update service mock active" });
});

// Redirecionamento de Registro/Cadastro
app.all('/redirect-plugin-register', (req, res) => {
    // Aqui você pode colocar o link da sua página de vendas ou checkout
    res.redirect('https://backscrm.com.br/checkout');
});

// Redirecionamento do Painel do Cliente
app.all('/redirect-plugin-panel', (req, res) => {
    // Aqui você pode colocar o link do seu painel administrativo futuro
    res.redirect('https://backscrm.com.br/dashboard');
});

app.all('/api/urls/update', (req, res) => {
    res.json({ success: true });
});

app.all('/api/urls/install/*', (req, res) => {
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Servidor Backs CRM rodando na porta ${PORT}`);
});
