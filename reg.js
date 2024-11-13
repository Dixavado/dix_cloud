const fs = require('fs');
const axios = require('axios');
const cliProgress = require('cli-progress');
const { Table } = require('console-table-printer'); // Para tabela de status no console

const processAccountsFromFile = async () => {
  let totalLido = 0;
  let adicionados = 0;
  let atualizados = 0;
  let naoCadastrados = 0;
  const concurrency = 10;

  const data = fs.readFileSync('lista.txt', 'utf8');
  const lines = data.split('\n');

  const progressBar = new cliProgress.SingleBar({
    format: 'Processando [{bar}] {percentage}% | Progresso: {value}/{total} | Total lido: {totalLido} | Adicionados: {adicionados} | Atualizados: {atualizados} | Não cadastrados: {naoCadastrados}',
    stopOnComplete: true
  }, cliProgress.Presets.shades_classic);

  progressBar.start(lines.length, 0, {
    totalLido,
    adicionados,
    atualizados,
    naoCadastrados
  });

  const table = new Table({
    title: 'Status de Processamento',
    columns: [
      { name: 'TOTAL', alignment: 'center' },
      { name: 'ATUAL', alignment: 'center' },
      { name: 'THREADS', alignment: 'center' }
    ]
  });

  table.addRow({
    TOTAL: totalLido,
    ATUAL: atualizados,
    THREADS: concurrency
  });

  const updateConsole = () => {
    table.setRow(0, {
      TOTAL: totalLido,
      ATUAL: atualizados,
      THREADS: concurrency
    });

    console.clear();
    table.printTable();
    process.stdout.write(`\n//=============[]===\\\\\n`);
    process.stdout.write(`|| ADICIONADOS || ${adicionados} ||\n`);
    process.stdout.write(`|| ATUALIZADOS || ${atualizados} ||\n`);
    process.stdout.write(`|| DUPLICADOS  || ${naoCadastrados} ||\n`);
    process.stdout.write(`\\\\=============[]===//\n`);
  };

  const loadPLimit = async () => {
    const pLimit = (await import('p-limit')).default;
    return pLimit;
  };

  const limit = await loadPLimit();
  const limitConcurrency = limit(concurrency);

  const processLine = async (line) => {
    if (!line.trim()) return;

    const [url, username, password] = line.split('|');
    totalLido++;

    if (!url || !username || !password) {
      naoCadastrados++;
      progressBar.update(totalLido, { totalLido, adicionados, atualizados, naoCadastrados });
      updateConsole();
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/add', {
        url,
        username,
        password,
      });

      const message = response.data.message;

      if (message.includes('cadastrada com sucesso')) {
        adicionados++;
      } else if (message.includes('senha já existe')) {
        naoCadastrados++;
      } else if (message.includes('Nova senha adicionada')) {
        atualizados++;
      }

      progressBar.update(totalLido, { totalLido, adicionados, atualizados, naoCadastrados });
      updateConsole();

    } catch (error) {
      naoCadastrados++;
      progressBar.update(totalLido, { totalLido, adicionados, atualizados, naoCadastrados });
      updateConsole();
    }
  };

  const promises = lines.map(line => limitConcurrency(() => processLine(line)));

  await Promise.all(promises);

  progressBar.stop();

  console.log(`\nTotal lido: [${totalLido}] | Adicionados: [${adicionados}] | Atualizados: [${atualizados}] | Não cadastrados: [${naoCadastrados}]`);
};

processAccountsFromFile();
