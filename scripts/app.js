// ==========================================
// SIGEM - MASTERPIECE LÓGICA DO SISTEMA v1.0.0
// ==========================================

const STORAGE_KEY = "sigem_equipamentos";

// Dados iniciais unificados com padronização de propriedades
const dadosIniciais = [
    {
        id: "PAT-001",
        nome: "Monitor Multiparamétrico",
        fabricante: "Philips",
        modelo: "IntelliVue MX700",
        setor: "UTI Adulto",
        status: "ativo",
        responsavel: "Engenharia Clínica",
        valor: 45000,
        dataAtualizacao: "12/08/2026 08:30:00"
    },
    {
        id: "PAT-002",
        nome: "Bomba de Infusão",
        fabricante: "B. Braun",
        modelo: "Space Infusomat",
        setor: "Centro Cirúrgico",
        status: "manutencao",
        responsavel: "João Silva",
        valor: 12000,
        dataAtualizacao: "12/08/2026 09:15:20"
    },
    {
        id: "PAT-003",
        nome: "Ventilador Mecânico",
        fabricante: "Dräger",
        modelo: "Evita XL",
        setor: "UTI Neonatal",
        status: "baixado",
        responsavel: "Patrimônio",
        valor: 85000,
        dataAtualizacao: "12/08/2026 10:00:45"
    }
];

// Inicializa banco local
function inicializarBanco() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosIniciais));
    }
}

// Buscar todos os equipamentos
function obterEquipamentos() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Salvar equipamentos no LocalStorage
function salvarEquipamentos(equipamentos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(equipamentos));
}

// Salvar único equipamento com validação de duplicidade
function salvarEquipamento(equipamento) {
    const equipamentos = obterEquipamentos();

    const existe = equipamentos.some(function(item) {
        return String(item.id).toLowerCase() === String(equipamento.id).toLowerCase();
    });

    if (existe) {
        alert("Já existe um equipamento com esse número de patrimônio.");
        return false;
    }

    equipamento.dataAtualizacao = new Date().toLocaleString("pt-BR");
    equipamento.valor = Number(equipamento.valor) || 0;

    equipamentos.push(equipamento);
    salvarEquipamentos(equipamentos);
    return true;
}

// Remover equipamento
function removerEquipamento(id) {
    const equipamentos = obterEquipamentos().filter(function(equipamento) {
        return String(equipamento.id) !== String(id);
    });
    salvarEquipamentos(equipamentos);
}

// Limpar todo o sistema (Reset)
window.limparSistema = function() {
    if (confirm("Tem certeza de que deseja apagar todos os dados do sistema? Esta ação não pode ser desfeita.")) {
        localStorage.removeItem(STORAGE_KEY);
        inicializarBanco();
        atualizarDashboard();
        renderizarTabelaCompleta();
        alert("O sistema foi reinicializado com os dados padrão.");
    }
}

// Funções de Cálculo e Estatísticas (KPIs)
function totalEquipamentos() {
    return obterEquipamentos().length;
}

function contarPorStatus(status) {
    return obterEquipamentos().filter(function(equipamento) {
        return equipamento.status === status;
    }).length;
}

function valorTotalParque() {
    return obterEquipamentos().reduce(function(total, item) {
        return total + (Number(item.valor) || 0);
    }, 0);
}

function totalFabricantes() {
    const fabricantes = obterEquipamentos().map(function(eq) {
        return eq.fabricante;
    });
    return new Set(fabricantes).size;
}

function totalSetores() {
    const setores = obterEquipamentos().map(function(eq) {
        return eq.setor;
    });
    return new Set(setores).size;
}

// Atualizar Dashboard e KPIs
function atualizarDashboard() {
    const equipamentos = obterEquipamentos();
    const total = equipamentos.length;

    const elTotal = document.getElementById("kpi-total");
    const elAtivos = document.getElementById("kpi-ativos");
    const elManutencao = document.getElementById("kpi-manutencao");
    const elBaixados = document.getElementById("kpi-baixados");
    const elValorTotal = document.getElementById("kpi-valor-total");
    const elFabricantes = document.getElementById("kpi-fabricantes");
    const elSetores = document.getElementById("kpi-setores");
    const elContador = document.getElementById("contadorEquipamentos");
    const elUltimaAtualizacao = document.getElementById("ultimaAtualizacao");

    if (elTotal) elTotal.textContent = total;
    if (elAtivos) elAtivos.textContent = contarPorStatus("ativo");
    if (elManutencao) elManutencao.textContent = contarPorStatus("manutencao");
    if (elBaixados) elBaixados.textContent = contarPorStatus("baixado");
    if (elFabricantes) elFabricantes.textContent = totalFabricantes();
    if (elSetores) elSetores.textContent = totalSetores();

    if (elValorTotal) {
        elValorTotal.textContent = valorTotalParque().toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    if (elContador) {
        elContador.textContent = `${total} equipamento(s) cadastrados no sistema.`;
    }

    if (elUltimaAtualizacao) {
        elUltimaAtualizacao.textContent = new Date().toLocaleString("pt-BR");
    }
}

// Renderizar Tabela de Equipamentos
function renderizarTabela(equipamentosParaExibir) {
    if (equipamentosParaExibir === undefined) {
        equipamentosParaExibir = obterEquipamentos();
    }
    
    const tbody = document.querySelector("tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    equipamentosParaExibir.sort(function(a, b) {
        return String(a.id).localeCompare(String(b.id));
    });

    if (equipamentosParaExibir.length === 0) {
        tbody.innerHTML = `
        <tr>
        <td colspan="10" style="text-align: center; padding: 25px; color: #666;">
        Nenhum equipamento encontrado.
        </td>
        </tr>
        `;
        return;
    }

    equipamentosParaExibir.forEach(function(eq) {
        let badgeClass = "badge-ativo";
        let statusTexto = "Ativo";

        if (eq.status === "manutencao") {
            badgeClass = "badge-manutencao";
            statusTexto = "Manutenção";
        } else if (eq.status === "baixado") {
            badgeClass = "badge-baixado";
            statusTexto = "Baixado";
        }

        const valorFormatado = Number(eq.valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td><span class="${badgeClass}">${statusTexto}</span></td>
        <td><strong>${eq.id}</strong></td>
        <td>${eq.nome}</td>
        <td>${eq.fabricante}</td>
        <td>${eq.modelo}</td>
        <td>${eq.setor}</td>
        <td>${eq.responsavel}</td>
        <td>${valorFormatado}</td>
        <td>${eq.dataAtualizacao || "-"}</td>
        <td>
        <button
        class="btn-acao"
        onclick="deletarItem('${eq.id}')"
        style="background:#dc3545;padding:6px 12px;font-size:0.85rem;">
        Excluir
        </button>
        </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function renderizarTabelaCompleta() {
    renderizarTabela(obterEquipamentos());
}

window.deletarItem = function(id) {
    if (confirm("Deseja realmente remover o patrimônio " + id + "?")) {
        removerEquipamento(id);
        renderizarTabelaCompleta();
        atualizarDashboard();
    }
}

// Configuração de Filtros e Pesquisa
function configurarFiltros() {
    const inputBusca = document.getElementById("pesquisa-patrimonio");
    const filtroStatus = document.getElementById("filtro-status");
    const filtroSetor = document.getElementById("filtro-setor");

    const executarFiltros = function() {
        const termo = inputBusca ? inputBusca.value.toLowerCase() : "";
        const statusVal = filtroStatus ? filtroStatus.value : "";
        const setorVal = filtroSetor ? filtroSetor.value.toLowerCase() : "";

        let equipamentos = obterEquipamentos();

        if (termo) {
            equipamentos = equipamentos.filter(eq =>
                String(eq.id).toLowerCase().includes(termo) ||
                String(eq.nome).toLowerCase().includes(termo) ||
                String(eq.fabricante).toLowerCase().includes(termo) ||
                String(eq.setor).toLowerCase().includes(termo)
            );
        }

        if (statusVal) {
            equipamentos = equipamentos.filter(eq => eq.status === statusVal);
        }

        if (setorVal) {
            equipamentos = equipamentos.filter(eq =>
                String(eq.setor).toLowerCase().includes(setorVal)
            );
        }

        renderizarTabela(equipamentos);
    };

    if (inputBusca) inputBusca.addEventListener("input", executarFiltros);
    if (filtroStatus) filtroStatus.addEventListener("change", executarFiltros);
    if (filtroSetor) filtroSetor.addEventListener("change", executarFiltros);
}

// Configuração do Formulário de Cadastro
function configurarFormulario() {
    const formEquipamento = document.getElementById("formEquipamento");
    if (!formEquipamento) return;

    formEquipamento.addEventListener("submit", function (event) {
        event.preventDefault();

        const equipamento = {
            id: document.getElementById("patrimonio").value.trim(),
            nome: document.getElementById("equipamento").value.trim(),
            fabricante: document.getElementById("fabricante").value.trim(),
            modelo: document.getElementById("modelo").value.trim(),
            setor: document.getElementById("setor").value.trim(),
            status: document.getElementById("status").value,
            responsavel: document.getElementById("responsavel").value.trim(),
            valor: document.getElementById("valor") ? document.getElementById("valor").value : 0
        };

        const sucesso = salvarEquipamento(equipamento);

        if (sucesso) {
            alert("Equipamento cadastrado com sucesso!");
            formEquipamento.reset();
            window.location.href = "equipamentos.html";
        }
    });
}

// Exportação de Dados (CSV e JSON)
function configurarExportacao() {
    const btnExportarCSV = document.getElementById("exportarCSV");
    const btnExportarJSON = document.getElementById("exportarJSON");

    if (btnExportarCSV) {
        btnExportarCSV.addEventListener("click", function() {
            const equipamentos = obterEquipamentos();
            if (equipamentos.length === 0) {
                alert("Não há dados para exportar.");
                return;
            }

            let csvContent = "Patrimonio,Nome,Fabricante,Modelo,Setor,Status,Responsavel,Valor,DataAtualizacao\n";

            equipamentos.forEach(function(eq) {
                const linha = [
                    eq.id,
                    `"${eq.nome}"`,
                    `"${eq.fabricante}"`,
                    `"${eq.modelo}"`,
                    `"${eq.setor}"`,
                    eq.status,
                    `"${eq.responsavel}"`,
                    eq.valor,
                    `"${eq.dataAtualizacao}"`
                ].join(",");
                csvContent += linha + "\n";
            });

            const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            const dataAtual = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
            link.setAttribute("download", "SIGEM_" + dataAtual + ".csv");

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    if (btnExportarJSON) {
        btnExportarJSON.addEventListener("click", function() {
            const equipamentos = obterEquipamentos();
            const blob = new Blob(
                [JSON.stringify(equipamentos, null, 4)],
                { type: "application/json" }
            );

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "SIGEM_Backup_" + new Date().toLocaleDateString("pt-BR").replace(/\//g, "-") + ".json";
            link.click();
        });
    }
}

// Inicialização Geral do Ciclo de Vida da DOM
document.addEventListener("DOMContentLoaded", function () {
    inicializarBanco();
    atualizarDashboard();
    renderizarTabelaCompleta();
    configurarFormulario();
    configurarFiltros();
    configurarExportacao();
});