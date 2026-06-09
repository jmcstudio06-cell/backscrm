const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7860;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'access-token']
}));

app.use(express.json());
app.use(morgan('dev'));

// Rota raiz - Retorna um script JS válido para não travar a extensão
app.get('/', (req, res) => {
    res.type('application/javascript');
    res.send('console.log("Backs CRM: Remote code loaded (placeholder).");');
});

// Rota de saúde
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Rota para o arquivo de configuração
app.get('/config.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'config.json'));
});

// Mock de rotas de serviço
app.all('/api/services/update', (req, res) => {
    res.json({ success: true, message: "Update service mock active" });
});

app.all('/api/urls/update', (req, res) => {
    res.json({ success: true, message: "URL update mock active" });
});

app.all('/api/auth/validation/*', (req, res) => {
    res.json({ success: true, status: "authorized" });
});

app.all('/api/services/initial-data/*', (req, res) => {
    res.json({ success: true, data: {} });
});

app.all('/api/notify/get/premium/*', (req, res) => {
    res.json({ success: true, notifications: [] });
});

app.all('/api/urls/install/*', (req, res) => {
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Servidor Backs CRM rodando na porta ${PORT}`);
});
