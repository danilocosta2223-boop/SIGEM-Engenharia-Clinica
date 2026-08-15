/* ==========================================================================
   SIGEM - Dashboard Script
   ========================================================================== */

async function carregarDadosCompleto() {
    try {
        const resMov = await fetch('../dados/movimentacoes.json');
        
        if (!resMov.ok) {
            throw new Error('Falha ao comunicar com a base de dados de movimentações.');
        }
        
        const movimentacoes = await resMov.json();
        const corpoTabela = document.getElementById('ultimasMovimentacoes');
        
        if (!corpoTabela) return;

        // Limpa o conteúdo atual para evitar duplicações
        corpoTabela.innerHTML = '';

        // Ordena por data (convertendo formato DD/MM/AAAA para ordenação correta) e pega os 5 mais recentes
        const ordenadas = [...movimentacoes].sort((a, b) => {
            const [diaA, mesA, anoA] = a.data.split('/');
            const [diaB, mesB, anoB] = b.data.split('/');
            return new Date(`${anoB}-${mesB}-${diaB}`) - new Date(`${anoA}-${mesA}-${diaA}`);
        });

        const ultimas = ordenadas.slice(0, 5);

        ultimas.forEach(m => {
            const badgeClass = m.tipo === 'SAIDA' ? 'badge-danger' : 'badge-success';
            const iconeTipo = m.tipo === 'SAIDA' ? '⬇' : '⬆';

            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${m.data}</td>
                <td><strong>${m.descricao}</strong></td>
                <td><span class="badge ${badgeClass}">${iconeTipo} ${m.tipo}</span></td>
                <td>${m.quantidade} un</td>
                <td>${m.tecnico}</td>
            `;
            corpoTabela.appendChild(linha);
        });

        mostrarNotificacao("Movimentações atualizadas");

    } catch (erro) {
        console.error('Erro no carregamento do SIGEM:', erro);
    }
}

// Sistema de Notificações Toast
function mostrarNotificacao(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = msg;
    
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Inicializa a carga e configura o modo "Tempo Real" a cada 30 segundos
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosCompleto();
    console.log("SIGEM - Dashboard carregado com sucesso");
    setInterval(carregarDadosCompleto, 30000);
});