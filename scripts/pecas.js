document.addEventListener("DOMContentLoaded", () => {
    const inputPatrimonio = document.getElementById('patrimonio');
    const inputCodigoPeca = document.getElementById('codigoPeca');
    const inputQuantidade = document.getElementById('quantidade');

    // Função para exibir alertas visuais modernos (Toast)
    function mostrarToast(mensagem, tipo = 'sucesso') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.innerText = mensagem;
        
        // Estilização injetada para garantir funcionamento imediato
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '12px 20px';
        toast.style.background = tipo === 'erro' ? '#ef4444' : '#10b981';
        toast.style.color = '#fff';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.zIndex = '9999';
        toast.style.transition = 'opacity 0.3s ease';

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 3000);
        }, 3000);
    }

    // 1 & 7. Busca em tempo real (input) para Equipamento, Foto, Status e QR Code
    if (inputPatrimonio) {
        inputPatrimonio.addEventListener('input', async () => {
            const patrimonioDigitado = inputPatrimonio.value.trim().toUpperCase();
            if (!patrimonioDigitado) return;

            try {
                const response = await fetch('../dados/equipamentos.json');
                const equipamentos = await response.json();
                const ativo = equipamentos.find(e => e.patrimonio === patrimonioDigitado);
                
                if (ativo) {
                    document.getElementById('equipamento').value = ativo.equipamento || '';
                    document.getElementById('setor').value = ativo.setor || '';
                    document.getElementById('os').value = ativo.osAtual || 'OS-2026-0104';
                    
                    // Atualiza status se o elemento existir
                    const statusEl = document.getElementById('statusEquipamento');
                    if (statusEl) statusEl.innerText = ativo.status || 'Ativo';

                    // Atualiza foto do equipamento com fallback para default
                    const fotoEl = document.getElementById('fotoEquipamento');
                    if (fotoEl) {
                        fotoEl.src = `../imagens/equipamentos/${ativo.patrimonio}.jpg`;
                        fotoEl.onerror = () => { fotoEl.src = '../imagens/equipamentos/default.jpg'; };
                    }

                    // Gera QR Code dinâmico se houver container
                    const qrContainer = document.getElementById('qrcodeContainer');
                    if (qrContainer && typeof QRCode !== 'undefined') {
                        qrContainer.innerHTML = "";
                        new QRCode(qrContainer, {
                            text: `SIGEM:${ativo.patrimonio}`,
                            width: 80,
                            height: 80
                        });
                    }

                    mostrarToast(`✅ ${ativo.equipamento} localizado`);
                }
            } catch (error) {
                console.error("Erro ao buscar dados do equipamento:", error);
            }
        });
    }

    // 1, 5, 6 & 9. Busca em tempo real (input) para Peças, Estoque, Validação e Valor
    let pecaSelecionadaCache = null;

    if (inputCodigoPeca) {
        inputCodigoPeca.addEventListener('input', async () => {
            const codigoPeca = inputCodigoPeca.value.trim().toUpperCase();
            if (!codigoPeca) return;

            try {
                const response = await fetch('../dados/pecas.json');
                const pecas = await response.json();
                const peca = pecas.find(p => p.codigo === codigoPeca);
                
                if (peca) {
                    pecaSelecionadaCache = peca;
                    document.getElementById('descricaoPeca').value = peca.descricao || '';
                    document.getElementById('estoqueAtual').value = peca.estoque || 0;
                    
                    // Exibir valor unitário da peça
                    const valPecaEl = document.getElementById('valorPeca');
                    if (valPecaEl) {
                        valPecaEl.value = `R$ ${(peca.valorUnitario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                    }

                    // Alerta de estoque crítico
                    if (peca.estoque <= (peca.estoqueMinimo || 2)) {
                        mostrarToast(`⚠ Atenção: Estoque abaixo do mínimo (${peca.estoque} un.)`, 'erro');
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar dados da peça:", error);
            }
        });
    }

    // 9. Validação de quantidade em tempo real
    if (inputQuantidade) {
        inputQuantidade.addEventListener('input', () => {
            const qtdInformada = parseInt(inputQuantidade.value) || 0;
            if (pecaSelecionadaCache && qtdInformada > pecaSelecionadaCache.estoque) {
                mostrarToast('❌ Quantidade informada é maior que o estoque atual!', 'erro');
                inputQuantidade.style.borderColor = '#ef4444';
            } else {
                inputQuantidade.style.borderColor = '#334155';
            }
        });
    }
});