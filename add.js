const fs = require('fs');
const axios = require('axios');
const cliProgress = require('cli-progress'); // Para barra de progresso no console

// Função para ler o arquivo e cadastrar as contas
const processAccountsFromFile = async () => {
  // Inicializando os contadores
  let totalLido = 0;
  let adicionados = 0;
  let atualizados = 0;
  let naoCadastrados = 0;

  // Lê o arquivo lista.txt de forma síncrona
  const data = fs.readFileSync('db.txt', 'utf8');
  
  // Divide as linhas do arquivo
  const lines = data.split('\n');
  
  // Cria a barra de progresso
  const progressBar = new cliProgress.SingleBar({
    format: 'Processando [{bar}] {percentage}% | Total lido: {totalLido} | Adicionados: {adicionados} | Atualizados: {atualizados} | Não cadastrados: {naoCadastrados}',
    stopOnComplete: true
  }, cliProgress.Presets.shades_classic);

  // Inicia a barra de progresso
  progressBar.start(lines.length, 0, {
    totalLido,
    adicionados,
    atualizados,
    naoCadastrados
  });

  // Função para imprimir os dados na mesma linha
  const updateConsole = () => {
    process.stdout.clearLine();  // Limpa a linha atual
    process.stdout.cursorTo(0);  // Volta o cursor para o início
    process.stdout.write(`Processando | Total lido: ${totalLido} | Adicionados: ${adicionados} | Atualizados: ${atualizados} | Não cadastrados: ${naoCadastrados}`); 
  };

  // Função para carregar o p-limit dinamicamente
  const loadPLimit = async () => {
    const pLimit = (await import('p-limit')).default; // Carrega o p-limit dinamicamente
    return pLimit;
  };

  // Definindo o limite de 10 requisições simultâneas
  const limit = await loadPLimit();  // Usando a importação dinâmica

  // Defina o número de concorrências
  const concurrency = 10;
  const limitConcurrency = limit(concurrency);  // Passando o valor da concorrência para o pLimit

  // Função que processa cada linha
  const processLine = async (line) => {
    // Ignora linhas vazias
    if (!line.trim()) return;

    // Separa os dados (url, username, password)
    const [url, username, password] = line.split('|');
    
    // Incrementa o total lido
    totalLido++;

    // Verifica se todos os dados estão presentes
    if (!url || !username || !password) {
      naoCadastrados++; // Conta como não cadastrado
      progressBar.update(totalLido, { totalLido, adicionados, atualizados, naoCadastrados });
      updateConsole();  // Atualiza o console com as novas informações
      return; // Pule para a próxima linha
    }

    // Agora, chamamos a API para cadastrar ou atualizar a conta
    try {
      const response = await axios.post('http://localhost:3000/add', {
        url,
        username,
        password,
      });

      // Exibe a resposta
      const message = response.data.message;
      
      if (message.includes('cadastrada com sucesso')) {
        adicionados++; // Conta como adicionada
      } else if (message.includes('senha já existe')) {
        naoCadastrados++; // Conta como não cadastrada (se já existir a senha)
      } else if (message.includes('Nova senha adicionada')) {
        atualizados++; // Conta como atualizada
      }

      // Atualiza os contadores após cada operação
      progressBar.update(totalLido, { totalLido, adicionados, atualizados, naoCadastrados });
      updateConsole();  // Atualiza o console com as novas informações

    } catch (error) {
      naoCadastrados++; // Conta como não cadastrada se ocorrer um erro
      progressBar.update(totalLido, { totalLido, adicionados, atualizados, naoCadastrados });
      updateConsole();  // Atualiza o console com as novas informações
    }
  };

  // Criando um array de promessas limitadas
  const promises = lines.map(line => limitConcurrency(() => processLine(line)));

  // Aguarda todas as promessas serem resolvidas
  await Promise.all(promises);

  // Finaliza a barra de progresso
  progressBar.stop();

  // Exibe o resumo final com os contadores
  console.log(`\nTotal lido: [${totalLido}] | Adicionados: [${adicionados}] | Atualizados: [${atualizados}] | Não cadastrados: [${naoCadastrados}]`);
};

// Executa o processamento
processAccountsFromFile();
