const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logs de requisições no console

// Rota de saúde (Health Check)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Rota para o arquivo de configuração que a extensão busca
app.get('/config.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'config.json'));
});

// Exemplo de rota de autenticação
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    // Aqui você implementaria a lógica real de banco de dados
    console.log(`Tentativa de login: ${email}`);
    res.json({
        success: true,
        bearer_token: "token-de-teste-backs-crm",
        user: {
            name: "Usuário Backs",
            email: email
        }
    });
});

// Rota de instalação (chamada no onInstalled)
app.get('/api/urls/install/:id', (req, res) => {
    const extensionId = req.params.id;
    console.log(`Extensão instalada: ${extensionId}`);
    res.json({
        success: true,
        url: "https://backscrm.com.br/welcome"
    });
});

app.listen(PORT, () => {
    console.log(`Servidor Backs CRM rodando na porta ${PORT}`);
    console.log(`Endpoint de config: http://localhost:${PORT}/config.json`);
});
