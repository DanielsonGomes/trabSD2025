const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

let ultimaTemperatura = null;
let clients = [];

// Envia temperatura para todos os clientes conectados via SSE
function sendEventsToAll(temperatura) {
  clients.forEach(res => {
    res.write(`data: ${temperatura}\n\n`);
  });
}

// Rota para receber temperatura via POST
app.post('/temperatura', (req, res) => {
  const { valor } = req.body;
  if (typeof valor !== 'number') {
    return res.status(400).json({ erro: 'Valor de temperatura inválido' });
  }

  if (valor !== ultimaTemperatura) {
    ultimaTemperatura = valor;
    sendEventsToAll(valor);
  }

  const dataHora = new Date().toISOString();
  const log = `${dataHora} - Temperatura: ${valor}°C\n`;

  fs.appendFile('log.txt', log, (err) => {
    if (err) console.error('Erro ao salvar no log:', err);
  });

  console.log(`Temperatura recebida: ${valor}°C`);

  res.status(200).json({ mensagem: 'Temperatura recebida com sucesso!' });
});

// Rota para conexão SSE e envio de temperatura em tempo real
app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  if (ultimaTemperatura !== null) {
    res.write(`data: ${ultimaTemperatura}\n\n`);
  }

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// Página HTML para exibir temperatura em tempo real
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Temperatura em tempo real</title></head>
      <body>
        <h1>Temperatura ambiente:</h1>
        <div id="temp">Carregando...</div>
        <script>
          const evtSource = new EventSource('/events');
          evtSource.onmessage = function(event) {
            document.getElementById('temp').innerText = event.data + '°C';
          };
          evtSource.onerror = function() {
            document.getElementById('temp').innerText = 'Erro na conexão.';
          };
        </script>
      </body>
    </html>
  `);
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
