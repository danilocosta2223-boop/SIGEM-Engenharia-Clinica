// scripts/tema.js - Gerenciamento de Tema (Dark / Light)

document.addEventListener("DOMContentLoaded", () => {
    const btnTema = document.getElementById("btnTema");
    const temaSalvo = localStorage.getItem("sigem_tema");

    // Aplica o tema salvo ao iniciar
    if (temaSalvo === "dark") {
        document.body.classList.add("dark");
        if (btnTema) btnTema.innerText = "☀️ Modo Claro";
    }

    // Alterna o tema ao clicar no botão de controle
    if (btnTema) {
        btnTema.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            
            if (document.body.classList.contains("dark")) {
                localStorage.setItem("sigem_tema", "dark");
                btnTema.innerText = "☀️ Modo Claro";
            } else {
                localStorage.setItem("sigem_tema", "light");
                btnTema.innerText = "🌙 Modo Escuro";
            }
        });
    }
});