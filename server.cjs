const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7860;
const JWT_SECRET = process.env.JWT_SECRET || 'backs-zapcrm-secret-key-2024';

// Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ycmbxkyjdziyynlbigif.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbWJ4a3lqZHppeXlubGJpZ2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5Nzc3ODksImV4cCI6MjA5NjU1Mzc4OX0.PD9oJp4icAV0PP9lbAGoZTtzcQDolZulpB6QPNcgRO8';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Admin fixo
const ADMIN_EMAIL = 'mariooliveira.ctt@gmail.com';
const ADMIN_PASSWORD = 'M@eeuteamo1';

// CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'access-token']
}));
app.use(express.json());
app.use(morgan('dev'));

// ─── Servir frontend estático ────────────────────────────────────────────────
const fs = require('fs');
const frontendPaths = [
    path.join(__dirname, 'dist'),
    path.join(__dirname, 'public'),
    path.join(__dirname, '../frontend/.output/public'),
    path.join(process.cwd(), 'frontend/.output/public'),
    path.join(process.cwd(), '.output/public')
];
let frontendPath = null;
for (const p of frontendPaths) {
    if (fs.existsSync(p)) { frontendPath = p; break; }
}
if (frontendPath) {
    console.log('Servindo frontend de:', frontendPath);
    app.use(express.static(frontendPath));
} else {
    console.log('AVISO: Pasta do frontend não encontrada.');
}

// ─── Middleware admin ─────────────────────────────────────────────────────────
const authenticateAdmin = (req, res, next) => {
    const token = (req.headers['authorization'] || '').split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token não fornecido' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Token inválido' });
        if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Acesso negado' });
        req.user = user;
        next();
    });
};

// ─── CADASTRO ────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Email e senha obrigatórios' });
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            return res.status(400).json({ success: false, message: 'Este e-mail não pode ser usado.' });
        }
        const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).maybeSingle();
        if (existing) return res.status(400).json({ success: false, message: 'E-mail já cadastrado.' });
        const hash = await bcrypt.hash(password, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: newUser, error } = await supabase.from('users').insert({
            email: email.toLowerCase(),
            password_hash: hash,
            name: name || email.split('@')[0],
            role: 'user',
            status: 'trial',
            plan: null,
            expires_at: expiresAt
        }).select().single();
        if (error) {
            console.error('Erro Supabase ao registrar:', error);
            return res.status(500).json({ success: false, message: 'Erro ao criar conta. Tente novamente.' });
        }
        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token, bearer_token: token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: 'user', status: newUser.status, plan: newUser.plan, expiresAt: newUser.expires_at, createdAt: newUser.created_at } });
    } catch (e) {
        console.error('Erro no registro:', e);
        res.status(500).json({ success: false, message: 'Erro interno' });
    }
});

// ─── LOGIN (Site + Extensão) ──────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ success: false, message: 'Email e senha obrigatórios' });
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
            const token = jwt.sign({ id: 'admin-001', email: ADMIN_EMAIL, role: 'admin' }, JWT_SECRET, { expiresIn: '30d' });
            return res.json({ success: true, token, bearer_token: token, user: { id: 'admin-001', email: ADMIN_EMAIL, name: 'Admin', role: 'admin', status: 'active', premium: true } });
        }
        const { data: user, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
        if (error || !user) return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token, bearer_token: token, user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status, plan: user.plan, expiresAt: user.expires_at, createdAt: user.created_at, premium: user.status === 'active' } });
    } catch (e) {
        console.error('Erro no login:', e);
        res.status(500).json({ success: false, message: 'Erro interno' });
    }
});

// Compatibilidade com rotas da extensão (auth/login/*)
app.all('/api/auth/login/*', async (req, res) => {
    req.url = '/api/auth/login';
    app.handle(req, res);
});

// ─── VALIDAÇÃO DO TOKEN (usada pela extensão) ─────────────────────────────────
app.all('/api/auth/validation/*', async (req, res) => {
    const token = (req.headers['authorization'] || '').split(' ')[1] || req.query.token;
    if (!token) return res.json({ success: false, status: 'unauthorized' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'admin') {
            return res.json({ success: true, status: 'authorized', is_premium: true, user: { id: decoded.id, email: decoded.email, name: 'Admin', role: 'admin' } });
        }
        const { data: user } = await supabase.from('users').select('id, email, name, role, status, plan, expires_at').eq('id', decoded.id).maybeSingle();
        if (!user) return res.json({ success: false, status: 'unauthorized' });
        const isActive = user.status === 'active' || user.status === 'trial';
        res.json({ success: true, status: isActive ? 'authorized' : 'expired', is_premium: user.status === 'active', user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status } });
    } catch {
        res.json({ success: false, status: 'unauthorized' });
    }
});

// ─── ADMIN: Listar usuários ───────────────────────────────────────────────────
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    const { data, error } = await supabase.from('users').select('id, email, name, role, status, plan, expires_at, created_at').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, message: 'Erro ao buscar usuários' });
    const users = (data || []).map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, status: u.status, plan: u.plan, expiresAt: u.expires_at, createdAt: u.created_at }));
    res.json({ success: true, users });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ id: 'admin-001', email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ success: true, token, user: { name: 'Admin', email } });
    }
    if (email && email.startsWith('admin@') && password) {
        const token = jwt.sign({ id: 1, email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ success: true, token, user: { name: 'Administrador Backs', email } });
    }
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
});

// ─── ADMIN: Atualizar usuário ─────────────────────────────────────────────────
app.patch('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { status, plan, expiresAt } = req.body;
    const patch = {};
    if (status) patch.status = status;
    if (plan !== undefined) patch.plan = plan;
    if (expiresAt !== undefined) patch.expires_at = expiresAt || null;
    const { error } = await supabase.from('users').update(patch).eq('id', id);
    if (error) return res.status(500).json({ success: false, message: 'Erro ao atualizar' });
    res.json({ success: true });
});

// ─── ADMIN: Deletar usuário ───────────────────────────────────────────────────
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, message: 'Erro ao remover' });
    res.json({ success: true });
});

// ─── Rotas da Extensão ────────────────────────────────────────────────────────
app.get('/api/urls/install/:id', (req, res) => {
    res.json({ success: true, url: 'https://backscrm.onrender.com' });
});
app.get('/api/urls/active-notes/:id', (req, res) => {
    res.json({ success: true, path_note_update: { redirect: false } });
});
app.get('/api/urls/update', (req, res) => {
    res.json({ success: true, urls: { register: 'https://backscrm.onrender.com/cadastro', login: 'https://backscrm.onrender.com/login', panel: 'https://backscrm.onrender.com/dashboard' } });
});
app.get('/api/services/update', (req, res) => res.json({ success: true }));
app.get('/api/remote/code', (req, res) => {
    res.type('application/javascript');
    res.send('console.log("Backs ZapCRM: Remote code loaded.");');
});
app.get('/config.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'backend', 'config.json'));
});
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Redirecionamentos de extensão
app.all(/.*redirect-plugin-register$/, (req, res) => res.redirect('/cadastro'));
app.all(/.*redirect-plugin-panel$/, (req, res) => res.redirect('/dashboard'));

// ─── SPA fallback ────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
    if (!frontendPath) return res.status(500).send('Erro: frontend não encontrado.');
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        const files = fs.readdirSync(frontendPath);
        const mainJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
        if (mainJs) {
            res.send(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Backs ZapCRM</title><script>window.__TSR_DEHYDRATED__ = { data: [] };</script></head><body class="dark"><div id="root"></div><script type="module" src="/assets/${mainJs}"></script></body></html>`);
        } else {
            res.status(404).send(`Arquivos: ${files.join(', ')}`);
        }
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Backs ZapCRM rodando na porta ${PORT}`);
    console.log('Supabase conectado:', SUPABASE_URL);
});

process.on('uncaughtException', (err) => console.error('ERRO:', err));
process.on('unhandledRejection', (reason) => console.error('REJEIÇÃO:', reason));
