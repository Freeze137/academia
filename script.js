let loggedInUser = null;

// Quando a página terminar de carregar, damos o start na aplicação
window.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initThemeToggle();
});

// --- Utilitários de Banco de Dados (LocalStorage) ---
function getDB(key) { return JSON.parse(localStorage.getItem(key) || '[]'); }
function saveDB(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function syncCurrentUser() {
    const users = getDB('academiaUsers');
    const idx = users.findIndex(u => u.email === loggedInUser.email);
    if (idx !== -1) users[idx] = loggedInUser;
    saveDB('academiaUsers', users);
    saveDB('currentAcademiaUser', loggedInUser);
}

function initializeApp() {
    // Cria usuário admin padrão se não existir no banco
    const users = getDB('academiaUsers');
    if (!users.find(u => u.email === 'admin@academia.com')) {
        users.push({
            name: 'Administrador Master',
            email: 'admin@academia.com',
            password: 'admin',
            isAdmin: true,
            createdAt: new Date().toISOString()
        });
        saveDB('academiaUsers', users);
    }
    // TODO: No futuro, trocar esse localStorage por um banco de dados real (como Firebase ou Node.js)
    // Recupera o usuário logado na sessão local
    const currentUser = localStorage.getItem('currentAcademiaUser');
    if (currentUser) {
        loggedInUser = JSON.parse(currentUser);
        updateHeaderWithUser();
        renderPersonalizedPlan();
    } else {
        // Exibe a tela de login via overlay para usuários não conectados
        setTimeout(() => {
            toggleModal('loginModal', true);
        }, 500);
    }

    // Permite fechar o modal clicando fora do contêiner principal
    ['messageModal', 'loginModal', 'registerModal', 'recoveryModal', 'inviteModal', 'paymentModal', 'progressModal', 'editProfileModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function(event) {
                if (event.target === this) {
                    const timeout = modalId === 'messageModal' ? 300 : 500;
                    toggleModal(modalId, false, timeout);
                }
            });
        }
    });

    // Acessibilidade: Fechar modais com a tecla 'Esc' (A11y)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modals = ['messageModal', 'loginModal', 'registerModal', 'recoveryModal', 'inviteModal', 'paymentModal', 'progressModal', 'editProfileModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal && modal.classList.contains('show')) {
                    toggleModal(modalId, false);
                }
            });
        }
    });

    renderWorkouts();
    // Atualiza a exibição de avisos logo que a página carrega
    updateAnnouncementUI();
}

function initThemeToggle() {
    const headerButtons = document.querySelector('.header-buttons');
    if (headerButtons && !document.getElementById('themeToggleBtn')) {
        const btn = document.createElement('button');
        btn.id = 'themeToggleBtn';
        btn.className = 'header-btn inactive';
        btn.innerHTML = '☀️ Claro';
        btn.onclick = toggleTheme;
        // Insere o botão de tema no cabeçalho
        headerButtons.insertBefore(btn, headerButtons.firstChild);
    }
    
    // Recupera a preferência de tema salva no localStorage
    const savedTheme = localStorage.getItem('academiaTheme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const btn = document.getElementById('themeToggleBtn');
        if(btn) btn.innerHTML = '🌙 Escuro';
    }
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-theme');
    const btn = document.getElementById('themeToggleBtn');
    
    if (body.classList.contains('light-theme')) {
        localStorage.setItem('academiaTheme', 'light');
        btn.innerHTML = '🌙 Escuro';
    } else {
        localStorage.setItem('academiaTheme', 'dark');
        btn.innerHTML = '☀️ Claro';
    }
}

function updateHeaderWithUser() {
    const loginBtn = document.getElementById('headerLoginBtn');
    const logoutBtn = document.getElementById('headerLogoutBtn');
    const motivationText = document.getElementById('headerMotivation');
    const loginBtnCheckin = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const navAdminTab = document.getElementById('navAdminTab');

    const motivationalPhrases = [
        '💪 O corpo é um templo, cuide dele com dedicação!',
        '🔥 Sem dor não há ganho! Vamos treinar?',
        '💯 Somos o que repetidamente fazemos. A excelência não é ato, é hábito!',
        '⚡ A diferença entre impossível e possível é sua vontade!',
        '🏋️ Músculos crescem no repouso, mas a mente cresce no treino!',
        '🎯 Seu limite é apenas o começo. Ultrapasse!',
        '💪 Cada repetição é um passo para sua melhor versão!'
    ];

    if (loggedInUser) {
        loginBtn.textContent = 'Conectado: ' + loggedInUser.name;
        loginBtn.style.display = 'block';
        loginBtn.classList.remove('inactive');
        loginBtn.classList.add('active');
        loginBtn.style.background = 'var(--color-primary)';
        loginBtn.style.color = 'var(--color-bg)';
        
        // Redireciona para o Perfil ao clicar no nome de usuário logado
        loginBtn.onclick = function() {
            switchTab('profile');
            // Atualiza a aba ativa no menu lateral
            document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
            const profileTab = Array.from(document.querySelectorAll('.nav-tab')).find(el => el.getAttribute('onclick') && el.getAttribute('onclick').includes('profile'));
            if (profileTab) profileTab.classList.add('active');
        };

        logoutBtn.style.display = 'block';
        motivationText.style.display = 'none';
        loginBtnCheckin.style.display = 'none';
        registerBtn.style.display = 'none';
        
        // Exibe a aba de admin apenas se o usuário tiver a flag isAdmin
        if (loggedInUser.isAdmin && navAdminTab) {
            navAdminTab.style.display = 'block';
        } else if (navAdminTab) {
            navAdminTab.style.display = 'none';
        }
    } else {
        loginBtn.style.display = 'none';
        loginBtn.onclick = login; // Restaura a função de login caso ele saia
        logoutBtn.style.display = 'none';
        motivationText.style.display = 'block';
        const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
        motivationText.textContent = randomPhrase;
        loginBtnCheckin.style.display = 'block';
        registerBtn.style.display = 'block';
        if (navAdminTab) {
            navAdminTab.style.display = 'none';
        }
    }

    // Atualiza a interface dos botões de planos ao logar/deslogar
    renderPlans();
}

function switchTab(tab, event) {
    document.querySelectorAll('.main-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tab).classList.add('active');
    // Define o botão clicado como ativo (currentTarget previne bugs de clique em filhos)
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }


    if (tab === 'workouts') {
        renderWorkouts();
    } else if (tab === 'history') {
        renderCheckInHistory();
    } else if (tab === 'profile') {
        renderProfile();
    } else if (tab === 'personalized') {
        renderPersonalizedPlan();
    } else if (tab === 'videos') {
        renderVideos();
    } else if (tab === 'plans') {
        renderPlans();
    } else if (tab === 'admin') {
        renderAdminPanel();
    }
}

function checkIn() {
    if (!loggedInUser) {
        showModal('Por favor, crie uma conta primeiro!');
        return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR');
    const dateStr = now.toLocaleDateString('pt-BR');

    const checkInEntry = { name: loggedInUser.name, time: timeStr, date: dateStr };

    // Guarda no histórico global da academia
    const history = getDB('academiaCheckInHistory');
    history.push(checkInEntry);
    saveDB('academiaCheckInHistory', history);

    const result = document.getElementById('checkinResult');
    result.className = 'checkin-result show';
    result.innerHTML = `
        <h3>✅ Check-in Realizado!</h3>
        <p><strong>${loggedInUser.name}</strong></p>
        <p>Data: ${dateStr} | Hora: ${timeStr}</p>
        <p style="margin-top: 10px; font-size: 0.9em;">Bom treino! 🏋️‍♂️</p>
    `;

    setTimeout(() => {
        result.classList.remove('show');
    }, 3000);
}

function renderCheckInHistory() {
    const historyContent = document.getElementById('historyContent');
    const clearButton = document.querySelector('#history .btn-secondary');
    const allHistory = getDB('academiaCheckInHistory');

    // Filtra para mostrar apenas o histórico do aluno logado
    let history = allHistory;
    if (loggedInUser) {
        history = allHistory.filter(entry => entry.name === loggedInUser.name);
    }

    if (history.length === 0) {
        historyContent.innerHTML = `<p class="no-history-message">Nenhum check-in registrado ainda.</p>`;
        if (clearButton) clearButton.style.display = 'none';
        return;
    }

    if (clearButton) clearButton.style.display = 'inline-block';

    // Inverte o array para exibir os itens mais recentes primeiro
    const reversedHistory = history.slice().reverse();

    const historyHtml = `
        <div class="timeline-container">
            ${reversedHistory.map(entry => `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <strong>${entry.name || 'N/A'}</strong> registrou a entrada
                        <div class="timeline-date">📅 ${entry.date || 'N/A'} às ⏰ ${entry.time || 'N/A'}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    historyContent.innerHTML = historyHtml;
}

function clearCheckInHistory() {
    // Sempre pedir confirmação antes de apagar dados sensíveis!
    if (confirm('Tem certeza que deseja limpar todo o histórico de check-in? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('academiaCheckInHistory');
        renderCheckInHistory(); // Re-renderiza a visualização
        showModal('🗑️ Histórico de check-in foi limpo.');
    }
}

/**
 * Função mestre para abrir/fechar modais usando animações CSS suaves.
 */
function toggleModal(modalId, show, closeTimeout = 300) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (show) {
        modal.style.display = 'flex';
        // O requestAnimationFrame garante que o navegador renderizou o 'flex' antes de aplicar a opacidade, evitando que o modal apareça travado
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    } else {
        modal.classList.remove('show');
        // Aguarda a animação de transição terminar para ocultar o elemento
        setTimeout(() => {
            modal.style.display = 'none';
        }, closeTimeout);
    }
}

// --- Funções Auxiliares de Modal ---
function showModal(message) {
    // Redireciona os alertas antigos para o novo sistema elegante de Toast
    showToast(message);
}

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = 'ℹ️';
    // Remove os emojis originais e atribui cores automáticas dependendo da mensagem
    if (message.includes('✅')) { type = 'success'; icon = '✅'; message = message.replace('✅', '').trim(); }
    if (message.includes('❌') || message.includes('⚠️')) { type = 'error'; icon = '⚠️'; message = message.replace(/[❌⚠️]/g, '').trim(); }
    if (message.includes('🗑️')) { type = 'info'; icon = '🗑️'; message = message.replace('🗑️', '').trim(); }
    if (message.includes('🎉') || message.includes('🎟️')) { type = 'success'; icon = '🎉'; message = message.replace(/[🎉🎟️]/g, '').trim(); }

    if (type === 'success') toast.style.borderLeftColor = 'var(--color-success)';
    if (type === 'error') toast.style.borderLeftColor = 'var(--color-danger)';
    if (type === 'warning') toast.style.borderLeftColor = 'var(--color-warning)';
    
    toast.innerHTML = `<span style="font-size: 1.2em;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.add('show'));
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); // Aguarda animação de saída
    }, 3500);
}