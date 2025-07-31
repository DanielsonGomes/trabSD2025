const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios');

// Altere o path conforme  porta serial 
const porta = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });

const parser = porta.pipe(new ReadlineParser({ delimiter: '\r\n' }));

parser.on('data', async (data) => {
  const temperatura = parseFloat(data);
  if (!isNaN(temperatura)) {
    console.log(`Temperatura lida: ${temperatura}°C`);
    try {
      const resposta = await axios.post('http://localhost:3000/temperatura', {
        valor: temperatura,
      });
      console.log('Dados enviados com sucesso:', resposta.data);
    } catch (erro) {
      console.error('Erro ao enviar dados:', erro.message);
    }
  } else {
    console.log('Dado inválido:', data);
  }
});

