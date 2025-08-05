const { build } = require('./src/server');

async function testServer() {
  try {
    console.log('🔧 Testando configuração do servidor...');
    
    const app = await build();
    console.log('✅ Servidor configurado com sucesso!');
    
    const port = 3001; // Usar porta diferente para teste
    const host = '127.0.0.1';
    
    await app.listen({ port, host });
    console.log(`🚀 Servidor de teste rodando em http://${host}:${port}`);
    console.log(`📚 Documentação disponível em http://${host}:${port}/docs`);
    
    // Fechar após 3 segundos
    setTimeout(async () => {
      await app.close();
      console.log('✅ Teste concluído com sucesso!');
      process.exit(0);
    }, 3000);
    
  } catch (err) {
    console.error('❌ Erro ao iniciar servidor:', err.message);
    process.exit(1);
  }
}

testServer();
