/* ==========================================================================
   SIGEM - Script de Histórico Corporativo com Atualização Automática
   ========================================================================== */

let dadosGlobais = [];
let chartInstance = null;

async function carregarHistorico() {
    try {
        const resposta = await fetch('../dados/movimentacoes.json');
        if (!resposta.ok) throw new Error('Não foi possível carregar o histórico.');
        
        dadosGlobais = await resposta.json();
        
        atualizarKPIs(dadosGlobais);
        renderizarGraficoSetor(dadosGlobais);
        renderizarTopPecas(dadosGlobais);
        renderizarTopTecnicos(dadosGlobais);
        renderizarConsumoPorUnidade(dadosGlobais);
        renderizarTimeline(dadosGlobais);

        // Atualizar relógio de sincronização
        const agora = new Date();
        document.getElementById('relogioAtualizacao').innerText = agora.toLocaleTimeString('pt-BR');
    } catch (erro) {
        console.error('Erro ao processar dados:', erro);
    }
}

function atualizarKPIs(dados) {
    const criticas = dados.filter(m => m.criticidade === 'Crítica' || m.criticidade === 'Alta').length;
    const medias = dados.filter(m => m.criticidade === 'Média').length;
    const baixas = dados.filter(m => m.criticidade === 'Baixa').length;
    
    const custoTotal = dados
        .filter(m => m.tipo === 'SAIDA')
        .reduce((acc, m) => acc + (m.valorTotal || 0), 0);

    document.getElementById('kpiCritica').innerText = criticas;
    document.getElementById('kpiMedia').innerText = medias;
    document.getElementById('kpiBaixa').innerText = baixas;
    document.getElementById('kpiCusto').innerText = custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderizarGraficoSetor(dados) {
    const ctx = document.getElementById('graficoConsumoSetor').getContext('2d');
    
    const consumoPorSetor = {};
    dados.filter(m => m.tipo === 'SAIDA').forEach(m => {
        const setor = m.setor || 'Outros';
        consumoPorSetor[setor] = (consumoPorSetor[setor] || 0) + (m.valorTotal || 0);
    });

    const labels = Object.keys(consumoPorSetor);
    const valores = Object.values(consumoPorSetor);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: '#0ea5e9',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
            }
        }
    });
}

function renderizarTopPecas(dados) {
    const lista = document.getElementById('topPecasLista');
    lista.innerHTML = '';

    const contagem = {};
    dados.filter(m => m.tipo === 'SAIDA').forEach(m => {
        contagem[m.descricao] = (contagem[m.descricao] || 0) + m.quantidade;
    });

    const ordenadas = Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (ordenadas.length === 0) {
        lista.innerHTML = '<li style="color: #94a3b8;">Nenhum registro.</li>';
        return;
    }

    ordenadas.forEach(([peca, qtd], index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}. ${peca}</span> <strong>${qtd} un</strong>`;
        lista.appendChild(li);
    });
}

function renderizarTopTecnicos(dados) {
    const lista = document.getElementById('topTecnicosLista');
    lista.innerHTML = '';

    const contagem = {};
    dados.filter(m => m.tipo === 'SAIDA').forEach(m => {
        const tec = m.tecnico || 'Não especificado';
        contagem[tec] = (contagem[tec] || 0) + 1; // Contagem de OS/atendimentos
    });

    const ordenados = Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (ordenados.length === 0) {
        lista.innerHTML = '<li style="color: #94a3b8;">Nenhum registro.</li>';
        return;
    }

    ordenados.forEach(([tec, qtd], index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}. ${tec}</span> <strong>${qtd} OS</strong>`;
        lista.appendChild(li);
    });
}

function renderizarConsumoPorUnidade(dados) {
    const lista = document.getElementById('consumoUnidadeLista');
    lista.innerHTML = '';

    const unidades = {};
    dados.filter(m => m.tipo === 'SAIDA').forEach(m => {
        const unidade = m.unidade || 'Hospital Alphaville';
        unidades[unidade] = (unidades[unidade] || 0) + (m.valorTotal || 0);
    });

    const ordenadas = Object.entries(unidades).sort((a, b) => b[1] - a[1]);

    if (ordenadas.length === 0) {
        lista.innerHTML = '<li style="color: #94a3b8;">Nenhum registro.</li>';
        return;
    }

    ordenadas.forEach(([unidade, valor]) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>🏥 ${unidade}</span> <strong style="color: #22c55e;">${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>`;
        lista.appendChild(li);
    });
}

function renderizarTimeline(dados) {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = '';

    if (dados.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">Nenhuma movimentação encontrada com os filtros selecionados.</p>';
        return;
    }

    // Ordenação exata por data e hora decrescente
    const ordenadas = [...dados].sort((a, b) => {
        const dataA = new Date(`${a.data.split('/').reverse().join('-')}T${a.hora || '00:00'}`);
        const dataB = new Date(`${b.data.split('/').reverse().join('-')}T${b.hora || '00:00'}`);
        return dataB - dataA;
    });

    ordenadas.forEach(m => {
        const isSaida = m.tipo === 'SAIDA';
        const itemClass = isSaida ? 'timeline-item saida' : 'timeline-item entrada';
        const badgeColor = isSaida ? '#ef4444' : '#22c55e';
        const icone = isSaida ? '⬇ SAÍDA' : '⬆ ENTRADA';
        
        let critColor = '#3b82f6';
        const critTexto = m.criticidade || 'Média';
        if (critTexto === 'Crítica' || critTexto === 'Alta') critColor = '#ef4444';
        else if (critTexto === 'Média') critColor = '#f59e0b';
        else if (critTexto === 'Baixa') critColor = '#22c55e';

        const patrimonioLimpo = (m.patrimonio && m.patrimonio !== 'N/A') ? m.patrimonio : 'default';
        const fotoPatrimonio = `../imagens/equipamentos/${patrimonioLimpo}.jpg`;

        const item = document.createElement('div');
        item.className = itemClass;
        
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div>
                    <span style="background: ${badgeColor}20; color: ${badgeColor}; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;">${icone}</span>
                    <span style="font-size: 0.78rem; background: ${critColor}20; color: ${critColor}; border: 1px solid ${critColor}40; padding: 3px 8px; border-radius: 6px; margin-left: 8px; font-weight: 600;">⚠️ ${critTexto}</span>
                </div>
                <span style="font-size: 0.85rem; color: #94a3b8;">📅 ${m.data} às ${m.hora || '00:00'}</span>
            </div>

            <div class="timeline-content-wrapper">
                <img src="${fotoPatrimonio}" alt="${m.equipamento}" class="equipamento-foto" onerror="this.src='../imagens/equipamentos/default.jpg'">
                <div class="timeline-details">
                    <h4 style="color: #f8fafc; font-size: 1.05rem; margin: 0 0 4px 0;">${m.descricao} <small style="color: #64748b;">(${m.codigoPeca})</small></h4>
                    
                    <div class="timeline-grid">
                        <div><strong>Setor:</strong><br>${m.setor}</div>
                        <div><strong>Equipamento:</strong><br>${m.equipamento} <span style="color: #0ea5e9;">[${m.patrimonio}]</span></div>
                        <div><strong>OS / Motivo:</strong><br>${m.os} - ${m.motivo}</div>
                        <div><strong>Responsável:</strong><br>${m.tecnico}</div>
                        <div><strong>Qtd & Custo:</strong><br>${m.quantidade} un — <span style="color: #22c55e; font-weight: bold;">R$ ${(m.valorTotal || 0).toFixed(2)}</span></div>
                        <div><strong>Unidade:</strong><br>🏥 ${m.unidade || 'Hospital Alphaville'}</div>
                    </div>

                    <!-- Mapa de Rastreabilidade Visual -->
                    <div class="trace-map">
                        <span style="color: #94a3b8; font-weight: 600; margin-right: 4px;">Rastreio:</span>
                        <span class="trace-node">${m.codigoPeca}</span>
                        <span class="trace-arrow">↓</span>
                        <span class="trace-node">${m.os}</span>
                        <span class="trace-arrow">↓</span>
                        <span class="trace-node">${m.patrimonio}</span>
                        <span class="trace-arrow">↓</span>
                        <span class="trace-node">${m.setor}</span>
                        <span class="trace-arrow">↓</span>
                        <span class="trace-node">${m.unidade || 'Hospital Alphaville'}</span>
                    </div>

                    ${m.observacao ? `<div style="margin-top: 10px; font-size: 0.83rem; color: #94a3b8; padding-top: 6px; border-top: 1px solid #334155;"><em>Obs: ${m.observacao}</em></div>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

function filtrarMovimentacoes() {
    const texto = document.getElementById('filtroTexto').value.toLowerCase();
    const patrimonio = document.getElementById('filtroPatrimonio').value.toLowerCase();
    const dataInicio = document.getElementById('filtroDataInicio').value;
    const dataFim = document.getElementById('filtroDataFim').value;
    const setor = document.getElementById('filtroSetor').value;
    const tecnico = document.getElementById('filtroTecnico').value;

    const filtrados = dadosGlobais.filter(m => {
        const matchTexto = m.descricao.toLowerCase().includes(texto) || m.codigoPeca.toLowerCase().includes(texto);
        const matchPatrimonio = patrimonio === "" || m.patrimonio.toLowerCase().includes(patrimonio);
        const matchSetor = setor === "" || m.setor === setor;
        const matchTecnico = tecnico === "" || m.tecnico === tecnico;

        // Filtro por intervalo de datas (DD/MM/AAAA)
        let matchData = true;
        if (dataInicio || dataFim) {
            const [dia, mes, ano] = m.data.split('/');
            const dataItemStr = `${ano}-${mes}-${dia}`;
            if (dataInicio && dataItemStr < dataInicio) matchData = false;
            if (dataFim && dataItemStr > dataFim) matchData = false;
        }

        return matchTexto && matchPatrimonio && matchSetor && matchTecnico && matchData;
    });

    renderizarTimeline(filtrados);
}

function exportarPDF() {
    window.print();
}

// Inicialização e Atualização Automática a cada 30 segundos
document.addEventListener('DOMContentLoaded', () => {
    carregarHistorico();
    setInterval(() => {
        carregarHistorico();
    }, 30000);
});