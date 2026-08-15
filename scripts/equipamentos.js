document.addEventListener("DOMContentLoaded", () => {
    // Busca o arquivo JSON com a base de dados dos equipamentos
    fetch('../dados/equipamentos.json')
        .then(response => {
            // Verifica se a requisição foi bem sucedida
            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Seleciona o primeiro ativo da lista (ou você pode mapear usando um seletor no futuro)
            const ativo = data[0];
            
            // Valida se o ativo existe antes de tentar preencher os elementos
            if (!ativo) {
                console.warn("Nenhum ativo encontrado no arquivo JSON.");
                return;
            }

            // Preenche os KPIs principais na interface do dossiê
            document.getElementById('txtMTBF').innerText = ativo.mtbf || '-';
            document.getElementById('txtMTTR').innerText = ativo.mttr || '-';
            document.getElementById('txtDisponibilidade').innerText = ativo.disponibilidade || '-';
            
            // Formata o custo acumulado para o padrão monetário brasileiro (R$) com segurança
            const custoFormatado = typeof ativo.custoAcumulado === 'number' 
                ? ativo.custoAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                : '0,00';
            document.getElementById('txtCustos').innerText = `R$ ${custoFormatado}`;

            // Preenche dados complementares com valores padrão caso venham vazios no JSON
            document.getElementById('txtPecas').innerText = ativo.pecasAplicadas || '23';
            document.getElementById('txtOS').innerText = ativo.osConcluidas || '15';
        })
        .catch(error => {
            // Captura e exibe qualquer erro de rede ou de parsing do JSON no console
            console.error("Falha crítica ao carregar os dados do equipamento:", error);
        });
});