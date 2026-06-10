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

// Rota raiz
app.get('/', (req, res) => {
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

// Redirecionamentos
app.all('/redirect-plugin-register', (req, res) => res.redirect('https://crm-wave-launch.lovable.app'));
app.all('/redirect-plugin-panel', (req, res) => res.redirect('https://crm-wave-launch.lovable.app/dashboard'));

app.listen(PORT, () => console.log(`Servidor Backs ZapCRM rodando na porta ${PORT}`));
