const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7860;

// Configuração de CORS mais permissiva para extensões Chrome
app.use(cors({
    origin: '*', // Permite qualquer origem para evitar bloqueios no WhatsApp Web
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(morgan('dev'));

// Rota raiz
app.get('/', (req, res) => {
    res.send('Backs CRM Backend is running!');
});

// Rota de saúde (Health Check)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Rota para o arquivo de configuração
app.get('/config.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'config.json'));
});

// Mock de rotas de serviço para evitar erros 404 no console
app.all('/api/services/update', (req, res) => {
    res.json({ success: true, message: "Update service mock active" });
});

app.all('/api/urls/update', (req, res) => {
    res.json({ success: true, message: "URL update mock active" });
});

app.all('/api/auth/validation/*', (req, res) => {
    res.json({ success: true, status: "authorized" });
});

app.all('/api/urls/install/*', (req, res) => {
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Servidor Backs CRM rodando na porta ${PORT}`);
});
