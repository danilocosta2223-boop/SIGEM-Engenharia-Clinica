import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@+esm'

// Insira suas credenciais reais do projeto Supabase para produção
const SUPABASE_URL = 'https://xxxxx.supabase.co'
const SUPABASE_KEY = 'eyJ...'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Instâncias globais para gráficos
let graficoEstoqueInstance = null
let graficoTecnicosInstance = null

document.addEventListener('DOMContentLoaded', () => {
    inicializarGraficos()
    carregarDadosIniciais()
    ativarRealtimeSupabase()
})

// 1 & 4. Inicialização segura dos Gráficos com Chart.js
function inicializarGraficos() {
    const ctxEstoque = document.getElementById('graficoEstoque')
    if (ctxEstoque) {
        graficoEstoqueInstance = new Chart(ctxEstoque.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Normal', 'Atenção', 'Crítico'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#10b981', '#f59e0b', '#f43f5e']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        })
    }

    const ctxTecnicos = document.getElementById('graficoTecnicos')
    if (ctxTecnicos) {
        graficoTecnicosInstance = new Chart(ctxTecnicos.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Ramiro', 'Samuel', 'Gabriel'],
                datasets: [{
                    label: 'Retiradas',
                    data: [0, 0, 0],
                    backgroundColor: '#3b82f6'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        })
    }
}

// 3. Carregamento de dados (substitua por queries .from() do Supabase em produção)
async function carregarDadosIniciais() {
    try {
        // Exemplo real de busca:
        // const { data: pecas } = await supabase.from('pecas').select('*')

        // Valores de Fallback / Teste
        safeSetText('radar-total-pecas', '1.240')
        safeSetText('radar-entradas-hoje', '18')
        safeSetText('radar-saidas-hoje', '32')
        safeSetText('radar-criticos', '5')
        safeSetText('radar-valor-estoque', 'R$ 348k')

        // Atualização dos Insights Automáticos
        safeSetText('insight-peca', 'Sensor ECG')
        safeSetText('insight-tecnico', 'Ramiro (32 pçs)')
        safeSetText('insight-fornecedor', 'Philips Healthcare')
        safeSetText('insight-alerta', 'Cabo ECG (Abaixo mín.)')

        // Atualização dos gráficos com .update()
        if (graficoEstoqueInstance) {
            graficoEstoqueInstance.data.datasets[0].data = [120, 30, 5]
            graficoEstoqueInstance.update()
        }

        if (graficoTecnicosInstance) {
            graficoTecnicosInstance.data.datasets[0].data = [32, 28, 21]
            graficoTecnicosInstance.update()
        }

    } catch (error) {
        console.error('Erro ao carregar dados do Supabase:', error)
    }
}

// Utilitário de segurança para elementos DOM ausentes
function safeSetText(elementId, text) {
    const el = document.getElementById(elementId)
    if (el) {
        el.innerText = text
    }
}

// 2. Realtime otimizado (INSERT/UPDATE) com feedback de status da conexão
function ativarRealtimeSupabase() {
    const channel = supabase.channel('schema-db-changes')

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'movimentacoes' },
        (payload) => {
          console.log('Nova movimentação inserida:', payload)
          carregarDadosIniciais()
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pecas' },
        (payload) => {
          console.log('Estoque atualizado:', payload)
          carregarDadosIniciais()
        }
      )
      .subscribe((status) => {
          console.log('Status do canal Realtime:', status)
          
          const indicador = document.getElementById('status-indicador')
          if (status === 'SUBSCRIBED') {
              safeSetText('status-conexao', '🟢 ONLINE (Sincronizado)')
              if (indicador) indicador.className = 'inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse'
          } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
              safeSetText('status-conexao', '🔴 OFFLINE / RECONECTANDO')
              if (indicador) indicador.className = 'inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping'
          } else {
              safeSetText('status-conexao', `🟡 ${status}`)
              if (indicador) indicador.className = 'inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse'
          }
      })
}