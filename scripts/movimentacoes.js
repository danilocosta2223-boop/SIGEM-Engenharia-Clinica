/* ==========================================================================
   SIGEM - Extensão de Indicadores Avançados (MTTR e Custos)
   ========================================================================== */

function calcularIndicadoresAvancados(dados) {
    // 1. Contagem por Criticidade
    const criticas = dados.filter(m => m.criticidade === 'Alta' || m.criticidade === 'Crítica').length;
    const medias = dados.filter(m => m.criticidade === 'Média').length;
    const baixas = dados.filter(m => m.criticidade === 'Baixa').length;

    if(document.getElementById('kpiCritica')) document.getElementById('kpiCritica').innerText = criticas;
    if(document.getElementById('kpiMedia')) document.getElementById('kpiMedia').innerText = medias;
    if(document.getElementById('kpiBaixa')) document.getElementById('kpiBaixa').innerText = baixas;

    // 2. Cálculo do MTTR (Tempo Médio de Reparo em Horas)
    const temposEmMinutos = dados
        .filter(m => m.tempoExecucao)
        .map(m => {
            const [horas, minutos] = m.tempoExecucao.split(':').map(Number);
            return (horas * 60) + minutos;
        });

    if (temposEmMinutos.length > 0) {
        const mediaMinutos = temposEmMinutos.reduce((a, b) => a + b, 0) / temposEmMinutos.length;
        const horasMTTR = Math.floor(mediaMinutos / 60);
        const minsMTTR = Math.round(mediaMinutos % 60);
        
        const mttrFormatado = `${horasMTTR}h ${minsMTTR < 10 ? '0' : ''}${minsMTTR}min`;
        if(document.getElementById('kpiMTTR')) document.getElementById('kpiMTTR').innerText = mttrFormatado;
    }
}