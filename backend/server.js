const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7860;
const JWT_SECRET = process.env.JWT_SECRET || 'backs-zapcrm-secret-key-2024';

// Configuração de CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'access-token']
}));

app.use(express.json());
app.use(morgan('dev'));

// Servir arquivos estáticos do Frontend
const fs = require('fs');
const paths = [
    path.join(__dirname, 'dist'),           // Localização no Docker (legado)
    path.join(__dirname, 'public'),         // Localização no Docker (Nitro public)
    path.join(__dirname, '../frontend/.output/public'), // Localização no Render Nativo
    path.join(process.cwd(), 'frontend/.output/public'),
    path.join(process.cwd(), '.output/public')
];

let frontendPath = null;
for (const p of paths) {
    if (fs.existsSync(p)) {
        frontendPath = p;
        break;
    }
}

if (frontendPath) {
    console.log('Servindo frontend de:', frontendPath);
    app.use(express.static(frontendPath));
} else {
    console.log('AVISO: Pasta do frontend não encontrada após todas as tentativas.');
}

// Middleware para proteger rotas admin
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "Token não fornecido" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Token inválido ou expirado" });
        if (user.role !== 'admin') return res.status(403).json({ success: false, message: "Acesso negado" });
        req.user = user;
        next();
    });
};

// Rota para o código remoto da extensão
app.get('/api/remote/code', (req, res) => {
    res.type('application/javascript');
    res.send('console.log("Backs ZapCRM: Remote code loaded.");');
});

// Login Admin (Usado pelo Painel do Lovable)
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    
    // Login simplificado para teste (Aceita qualquer admin@...)
    if (email.startsWith('admin@') && password) {
        const token = jwt.sign({ id: 1, email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({
            success: true,
            token: token,
            user: { name: "Administrador Backs", email: email }
        });
    }
    
    res.status(401).json({ success: false, message: "Credenciais inválidas" });
});

// Listagem de Usuários (Protegida)
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
    res.json({
        success: true,
        users: [
            { id: 1, name: "Usuário Teste 1", email: "teste1@gmail.com", status: "active", plan: "Premium" },
            { id: 2, name: "Usuário Teste 2", email: "teste2@gmail.com", status: "expired", plan: "Free" }
        ]
    });
});

// --- ROTAS DA EXTENSÃO ---

// Configurações de URLs para a extensão
app.get('/api/urls/install/:id', (req, res) => {
    res.json({ success: true, url: 'https://backscrm.onrender.com' });
});

app.get('/api/urls/active-notes/:id', (req, res) => {
    res.json({ success: true, path_note_update: { redirect: false } });
});

app.get('/api/urls/update', (req, res) => {
    res.json({
        success: true,
        urls: {
            register: 'https://backscrm.onrender.com',
            login: 'https://backscrm.onrender.com',
            panel: 'https://backscrm.onrender.com/dashboard'
        }
    });
});

app.get('/api/services/update', (req, res) => {
    res.json({ success: true, status: 'updated' });
});

// Login da Extensão (Universal para Dev)
app.all('/api/auth/login*', (req, res) => {
    const { email } = req.body || {};
    res.json({
        success: true,
        token: "token-extensao-dev",
        user: { id: 1, name: "Admin", email: email || "admin@backscrm.com.br", premium: true, status: "active" }
    });
});

app.all('/api/auth/validation/*', (req, res) => {
    res.json({ success: true, status: "authorized" });
});

app.get('/config.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'config.json'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Redirecionamentos (Aceita qualquer caminho que termine com as rotas da extensão)
app.all(/.*redirect-plugin-register$/, (req, res) => res.redirect('/cadastro'));
app.all(/.*redirect-plugin-panel$/, (req, res) => res.redirect('/dashboard'));

// Redirecionar todas as outras rotas para o index.html do frontend (SPA)
app.get('*', (req, res) => {
    if (!frontendPath) {
        return res.status(500).send('Erro: Pasta "dist" do frontend não foi encontrada no servidor.');
    }
    
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`Erro: Arquivo index.html não encontrado em: ${indexPath}`);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Backs ZapCRM rodando na porta ${PORT}`);
    console.log('Ambiente:', process.env.NODE_ENV);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
    console.error('ERRO NÃO CAPTURADO:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('PROMESSA NÃO TRATADA:', reason);
});

