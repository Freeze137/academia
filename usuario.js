// LÓGICA DE USUÁRIO, AUTENTICAÇÃO E PERFIL

function login() {
    const savedUsers = localStorage.getItem('academiaUsers');
    if (savedUsers) {
        toggleModal('loginModal', true);
    } else {
        showModal('⚠️ Por favor, crie uma conta primeiro!');
    }
}

function logout() {
    if (loggedInUser) {
        const userName = loggedInUser.name;
        loggedInUser = null;
        localStorage.removeItem('currentAcademiaUser');
        updateHeaderWithUser();
        renderPersonalizedPlan();
        showModal('Sessão encerrada. Volte em breve, ' + userName + '!');
    } else {
        showModal('Você não está conectado.');
    }
}

// === FLUXO DE CADASTRO ===
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Previne o recarregamento da página

    const name = document.getElementById('regName').value;
    const birth = document.getElementById('regBirth').value;
    const height = document.getElementById('regHeight').value;
    const weight = document.getElementById('regWeight').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (name && birth && height && weight && email && password) {
        
        // TODO: Adicionar validação de e-mail duplicado antes de cadastrar
        const newUser = {
            name: name,
            birth: birth,
            height: height,
            weight: weight,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };

        const users = getDB('academiaUsers');
        users.push(newUser);
        saveDB('academiaUsers', users);

        // Autentica o usuário automaticamente após o registro
        loggedInUser = newUser;
        saveDB('currentAcademiaUser', newUser);
        updateHeaderWithUser();

        showModal('✅ Conta criada com sucesso! Bem-vindo, ' + name + '!');
        toggleModal('registerModal', false);
        this.reset();
    } else {
        showModal('Por favor, preencha todos os campos.');
    }
});

// === ATUALIZA AVATAR NO LOGIN DINAMICAMENTE ===
document.getElementById('loginEmail').addEventListener('input', function() {
    const email = this.value.trim();
    const avatarContainer = document.getElementById('loginAvatarIcon');
    
    const savedUsers = localStorage.getItem('academiaUsers');
    if (savedUsers && email.includes('@')) {
        const users = JSON.parse(savedUsers);
        const user = users.find(u => u.email === email);
        
        if (user) {
            // Se tiver foto, usa a foto. Se não, gera as iniciais em laranja (ff4500)
            const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ff4500&color=ffffff&size=120&font-size=0.4`;
            avatarContainer.innerHTML = `<img src="${avatarUrl}" alt="Foto de ${user.name}">`;
            return;
        }
    }
    
    // Se não encontrou o usuário ou o campo foi apagado, restaura o ícone padrão
    avatarContainer.innerHTML = '<img src="img/meu-icone.png" alt="Ícone de Login">';
});

// === FLUXO DE LOGIN ===
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const savedUsers = localStorage.getItem('academiaUsers');
    if (savedUsers) {
        const users = JSON.parse(savedUsers);
        // Procura pelo usuário correspondente
        const user = users.find(u => u.email === email);

        if (user && user.password === password) {
            loggedInUser = user;
            saveDB('currentAcademiaUser', user);
            updateHeaderWithUser();
            renderPersonalizedPlan();
            showModal('✅ Bem-vindo de volta, ' + user.name + '!');
            toggleModal('loginModal', false);
            this.reset();
        } else {
            // Não avisa se foi o e-mail ou a senha que deu erro, medida básica de segurança!
            showModal('❌ Email ou senha incorretos.');
        }
    } else {
        showModal('❌ Nenhuma conta encontrada. Crie uma conta primeiro.');
    }
});

// === FLUXO DE RECUPERAÇÃO DE SENHA ===
document.getElementById('recoveryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('recEmail').value;
    const birth = document.getElementById('recBirth').value;
    const newPassword = document.getElementById('recNewPassword').value;

    const savedUsers = localStorage.getItem('academiaUsers');
    if (savedUsers) {
        let users = JSON.parse(savedUsers);
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex !== -1) {
            // Verifica a data de nascimento como segurança antes de permitir a troca
            if (users[userIndex].birth === birth) {
                users[userIndex].password = newPassword;
                saveDB('academiaUsers', users);
                showModal('✅ Senha redefinida com sucesso! Você já pode entrar.');
                toggleModal('recoveryModal', false);
                setTimeout(() => toggleModal('loginModal', true), 300);
                this.reset();
            } else {
                showModal('❌ Erro: A Data de Nascimento informada não corresponde à do cadastro.');
            }
        } else {
            showModal('❌ Nenhum usuário encontrado com este email.');
        }
    } else {
        showModal('❌ Sistema sem usuários cadastrados.');
    }
});

const profileContentHtml = `
<div class="profile-container">
    <div class="profile-header">
        <div class="profile-avatar">
            <img id="profileAvatar" src="img/mans.jpg" alt="User Avatar">
        </div>
        <div class="profile-info">
            <h2 id="profileName">Nome do Aluno</h2>
            <p id="profileEmail">email@aluno.com</p>
            <p id="profileBirth">Data de Nascimento: 01/01/2000</p>
            <button class="btn-secondary" onclick="editProfile()">Editar Perfil</button>
        </div>
    </div>
    <div class="profile-stats">
        <h3>Minhas Estatísticas</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Plano Atual</h4>
                <p id="statsPlan" style="color: var(--color-primary);">Gratuito</p>
            </div>
            <div class="stat-card">
                <h4>Check-ins</h4>
                <p id="statsCheckins">0</p>
            </div>
            <div class="stat-card">
                <h4>🔥 Ofensiva</h4>
                <p id="statsStreak" style="color: var(--color-primary);">0 dias</p>
            </div>
            <div class="stat-card">
                <h4>Treinos Completos</h4>
                <p id="statsWorkouts">0</p>
            </div>
            <div class="stat-card">
                <h4>Membro Desde</h4>
                <p id="statsMemberSince">--</p>
            </div>
        </div>
        
        <!-- Módulo de Benefício Premium (Oculto por padrão) -->
        <div id="premiumBenefits" style="display: none; margin-top: 30px; padding: 20px; background: rgba(255, 183, 3, 0.05); border: 1px solid var(--color-accent); border-radius: 4px;">
            <h3 style="color: var(--color-accent); margin-bottom: 10px;">👑 Benefício Premium / Anual</h3>
            <p style="color: var(--color-text-secondary); margin-bottom: 15px;">Como assinante, você tem direito a levar até 5 amigos por mês para treinar com você gratuitamente!</p>
            <button class="btn-secondary" style="border-color: var(--color-accent); color: var(--color-accent);" onclick="openInviteModal()">🎟️ Solicitar Convite</button>
            <div id="inviteList" style="margin-top: 20px;"></div>
        </div>
    </div>
    <div class="profile-progress">
        <h3>Histórico de Progresso</h3>
        <div id="progressHistoryContent">
            <!-- A tabela de histórico de progresso será renderizada aqui -->
        </div>
    </div>
</div>
`;

function renderProfile() {
    const profileContentDiv = document.getElementById('profile-content');
    if (!profileContentDiv) return;

    if (!loggedInUser) {
        profileContentDiv.innerHTML = `<div style="text-align: center; padding: 40px 0;">
            <p style="margin-bottom: 20px;">Você precisa estar logado para ver seu perfil.</p>
            <button class="btn-primary" onclick="login()" style="width: auto;">Entrar</button>
        </div>`;
        return;
    }

    profileContentDiv.innerHTML = profileContentHtml;

    document.getElementById('profileName').textContent = loggedInUser.name;
    document.getElementById('profileEmail').textContent = loggedInUser.email;
    // Ajusta o fuso horário para evitar exibição do dia anterior
    const birthDate = new Date(loggedInUser.birth);
    const timeZoneOffset = birthDate.getTimezoneOffset() * 60000;
    document.getElementById('profileBirth').textContent = `Data de Nascimento: ${new Date(birthDate.getTime() + timeZoneOffset).toLocaleDateString('pt-BR')}`;

    // Gera um avatar automático com as iniciais do aluno, caso ele não tenha foto
    const avatarUrl = loggedInUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(loggedInUser.name)}&background=38bdf8&color=0f172a&size=120&font-size=0.4`;
    document.getElementById('profileAvatar').src = avatarUrl;

    document.getElementById('statsPlan').textContent = loggedInUser.plan || 'Gratuito';

    const history = getDB('academiaCheckInHistory');
    const userCheckins = history.filter(entry => entry.name === loggedInUser.name).length;
    document.getElementById('statsCheckins').textContent = userCheckins;

    const progressHistory = getDB('academiaProgress');
    const userWorkouts = progressHistory.filter(p => p.userId === loggedInUser.email);
    
    const uniqueWorkoutDays = new Set(userWorkouts.map(p => new Date(p.date).toLocaleDateString('pt-BR')));
    document.getElementById('statsWorkouts').textContent = uniqueWorkoutDays.size;

    // Lógica de Ofensiva (Streaks)
    const uniqueWorkoutDatesObj = [...new Set(userWorkouts.map(p => new Date(p.date).setHours(0,0,0,0)))].sort((a,b) => b - a);
    let streak = 0;
    const today = new Date().setHours(0,0,0,0);
    const yesterday = today - 86400000;
    
    if (uniqueWorkoutDatesObj.length > 0) {
        let lastDate = uniqueWorkoutDatesObj[0];
        if (lastDate === today || lastDate === yesterday) {
            streak = 1; // Começa a ofensiva
            for (let i = 1; i < uniqueWorkoutDatesObj.length; i++) {
                if (uniqueWorkoutDatesObj[i] === lastDate - (86400000 * streak)) {
                    streak++;
                } else {
                    break;
                }
            }
        }
    }
    document.getElementById('statsStreak').textContent = `${streak} dias`;

    const memberSince = new Date(loggedInUser.createdAt).toLocaleDateString('pt-BR');
    document.getElementById('statsMemberSince').textContent = memberSince;

    // Lógica do Convite (Benefício Premium/Anual)
    const premiumSection = document.getElementById('premiumBenefits');
    if (premiumSection) {
        if (loggedInUser.plan === 'Premium' || loggedInUser.plan === 'Anual') {
            premiumSection.style.display = 'block';
            renderInvitations();
        } else {
            premiumSection.style.display = 'none';
        }
    }

    renderProgressHistory();
}

function renderProgressHistory() {
    const historyContent = document.getElementById('progressHistoryContent');
    const progress = getDB('academiaProgress');
    const userProgress = progress.filter(p => loggedInUser && p.userId === loggedInUser.email);

    if (userProgress.length === 0) {
        historyContent.innerHTML = `<p class="no-history-message">Nenhum progresso registrado ainda.</p>`;
        return;
    }

    // Limita o histórico a 10 registros para o gráfico
    const reversedHistory = userProgress.slice().reverse().slice(0, 10);
    const maxLoad = Math.max(...userProgress.map(p => p.load || 0));

    historyContent.innerHTML = `
        <div class="progress-chart">
            ${reversedHistory.map(p => {
                const load = p.load || 0;
                // A barra nunca fica menor que 10% pra garantir que o texto de "kg" sempre caiba dentro dela
                const percentage = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
                return `
                    <div class="chart-row">
                        <div class="chart-label">
                            <span><strong>${p.exerciseName}</strong> (${p.sets}x${p.reps})</span>
                            <div style="display: flex; align-items: center;">
                                <span>${new Date(p.date).toLocaleDateString('pt-BR')}</span>
                                <div class="chart-actions">
                                    <button class="action-btn" onclick="editProgress('${p.date}')" title="Editar">✏️</button>
                                    <button class="action-btn" onclick="deleteProgress('${p.date}')" title="Excluir">🗑️</button>
                                </div>
                            </div>
                        </div>
                        <div class="chart-bar-container">
                            <div class="chart-bar" style="width: ${Math.max(percentage, 10)}%">${load} kg</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function createEditProfileModal() {
    // Se o modal já existir no HTML, não recria
    if (document.getElementById('editProfileModal')) return;
    
    const modalHtml = `
        <div id="editProfileModal" class="modal" style="align-items: center; padding-top: 0;">
            <div class="modal-content" style="background: var(--color-surface); text-align: left; width: 100%; max-width: 750px;">
                <span class="modal-close" onclick="toggleModal('editProfileModal', false)">&times;</span>
                <h3 style="color: var(--color-primary); margin-bottom: 20px; text-align: center;">Editar Perfil</h3>
                
                <div style="display: flex; flex-wrap: wrap; gap: 40px; align-items: center; justify-content: center;">
                    <!-- PREVIEW DA FOTO -->
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                        <img id="editAvatarPreview" src="" alt="Sua Foto" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid var(--color-primary); box-shadow: 0 0 20px rgba(255,69,0,0.2);">
                        <span style="color: var(--color-text-secondary); font-size: 0.85em; text-transform: uppercase; font-weight: 600;">Nova Foto</span>
                    </div>

                    <!-- FORMULÁRIO -->
                    <form id="editProfileForm" style="flex: 1; min-width: 300px;">
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: var(--color-text); font-weight: 600;">Nome Completo</label>
                            <input type="text" id="editName" style="width: 100%; padding: 12px; background: var(--color-bg); border: 1px solid var(--color-border-strong); color: var(--color-text); border-radius: 6px;" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: var(--color-text); font-weight: 600;">Data de Nascimento</label>
                            <input type="date" id="editBirth" style="width: 100%; padding: 12px; background: var(--color-bg); border: 1px solid var(--color-border-strong); color: var(--color-text); border-radius: 6px;" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: var(--color-text); font-weight: 600;">URL da Foto (Opcional)</label>
                            <input type="url" id="editAvatar" placeholder="https://exemplo.com/sua-foto.jpg" style="width: 100%; padding: 12px; background: var(--color-bg); border: 1px solid var(--color-border-strong); color: var(--color-text); border-radius: 6px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 25px;">
                            <label style="display: block; margin-bottom: 5px; color: var(--color-text); font-weight: 600;">Nova Senha (opcional)</label>
                            <input type="password" id="editPassword" autocomplete="new-password" placeholder="Deixe em branco para manter a atual" style="width: 100%; padding: 12px; background: var(--color-bg); border: 1px solid var(--color-border-strong); color: var(--color-text); border-radius: 6px;">
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%;">Salvar Alterações</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Sincroniza a pré-visualização da foto com a URL digitada
    const updatePreview = () => {
        const preview = document.getElementById('editAvatarPreview');
        const url = document.getElementById('editAvatar').value;
        const name = document.getElementById('editName').value || 'Usuário';
        preview.src = url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=38bdf8&color=0f172a&size=150&font-size=0.4`;
    };

    document.getElementById('editAvatar').addEventListener('input', updatePreview);
    document.getElementById('editName').addEventListener('input', updatePreview);

    document.getElementById('editProfileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfileChanges();
    });

    // Permite fechar clicando no fundo escuro
    document.getElementById('editProfileModal').addEventListener('click', function(e) {
        if (e.target === this) toggleModal('editProfileModal', false);
    });
}

function editProfile() {
    createEditProfileModal(); 
    document.getElementById('editName').value = loggedInUser.name || '';
    if (loggedInUser.birth) document.getElementById('editBirth').value = loggedInUser.birth;
    document.getElementById('editAvatar').value = loggedInUser.avatar || '';
    document.getElementById('editPassword').value = ''; // Sempre vazio por segurança
    
    const previewImg = document.getElementById('editAvatarPreview');
    if (previewImg) {
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(loggedInUser.name)}&background=38bdf8&color=0f172a&size=150&font-size=0.4`;
        previewImg.src = loggedInUser.avatar || defaultAvatar;
    }
    toggleModal('editProfileModal', true);
}

function saveProfileChanges() {
    loggedInUser.name = document.getElementById('editName').value;
    loggedInUser.birth = document.getElementById('editBirth').value;
    loggedInUser.avatar = document.getElementById('editAvatar').value;
    
    const newPassword = document.getElementById('editPassword').value;
    if (newPassword) loggedInUser.password = newPassword;

    syncCurrentUser();
    showModal('✅ Perfil atualizado com sucesso!');
    toggleModal('editProfileModal', false);
    updateHeaderWithUser();
    renderProfile();
}

let currentExerciseLogging = null; 
let currentEditProgressId = null; 

function logExerciseProgress(exerciseName) {
    if (!loggedInUser) {
        showModal('Por favor, faça login para registrar seu progresso.');
        return;
    }
    currentEditProgressId = null; 
    currentExerciseLogging = exerciseName;
    document.getElementById('progressModalTitle').textContent = `Registrar Progresso para ${exerciseName}`;
    
    document.getElementById('progressSets').value = '';
    document.getElementById('progressReps').value = '';
    document.getElementById('progressLoad').value = '';
    toggleModal('progressModal', true);
}

document.getElementById('progressForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const sets = document.getElementById('progressSets').value;
    const reps = document.getElementById('progressReps').value;
    const load = document.getElementById('progressLoad').value;

    if (!currentExerciseLogging || !loggedInUser) {
        showModal('❌ Erro ao salvar. Tente novamente.');
        return;
    }

    const progressHistory = getDB('academiaProgress');
    
    if (currentEditProgressId) {
        const index = progressHistory.findIndex(p => p.date === currentEditProgressId && p.userId === loggedInUser.email);
        if (index !== -1) {
            progressHistory[index].sets = parseInt(sets);
            progressHistory[index].reps = parseInt(reps);
            progressHistory[index].load = parseFloat(load);
        }
        showModal(`✅ Progresso atualizado!`);
    } else {
        const progressData = {
            userId: loggedInUser.email,
            exerciseName: currentExerciseLogging,
            sets: parseInt(sets),
            reps: parseInt(reps),
            load: parseFloat(load),
            date: new Date().toISOString()
        };
        progressHistory.push(progressData);
        showModal(`✅ Progresso para ${currentExerciseLogging} salvo!`);
    }

    saveDB('academiaProgress', progressHistory);
    toggleModal('progressModal', false);
    this.reset();
    currentExerciseLogging = null;
    currentEditProgressId = null;
    
    if (document.getElementById('profile').classList.contains('active')) renderProfile();
});

function editProgress(dateId) {
    const progressHistory = getDB('academiaProgress');
    const entry = progressHistory.find(p => p.date === dateId && p.userId === loggedInUser.email);
    if (!entry) return;

    currentEditProgressId = entry.date;
    currentExerciseLogging = entry.exerciseName;
    
    document.getElementById('progressModalTitle').textContent = `Editar ${entry.exerciseName}`;
    document.getElementById('progressSets').value = entry.sets;
    document.getElementById('progressReps').value = entry.reps;
    document.getElementById('progressLoad').value = entry.load;

    toggleModal('progressModal', true);
}

function deleteProgress(dateId) {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
        let progressHistory = getDB('academiaProgress');
        progressHistory = progressHistory.filter(p => !(p.date === dateId && p.userId === loggedInUser.email));
        saveDB('academiaProgress', progressHistory);
        renderProfile();
        showModal('🗑️ Registro excluído.');
    }
}

// === LÓGICA DE CONVITES PREMIUM ===
function openInviteModal() {
    const now = new Date();
    const invitesThisMonth = getDB('academiaInvitations').filter(i => {
        if (i.hostEmail !== loggedInUser.email) return false;
        const inviteDate = new Date(i.date);
        return inviteDate.getMonth() === now.getMonth() && inviteDate.getFullYear() === now.getFullYear();
    });

    if (invitesThisMonth.length >= 5) {
        showModal('⚠️ Você já atingiu o limite máximo de 5 convites neste mês!');
        return;
    }

    const form = document.getElementById('inviteForm');
    if (form) form.reset();
    toggleModal('inviteModal', true);
}

const inviteForm = document.getElementById('inviteForm');
if (inviteForm) {
    inviteForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!loggedInUser) return;

        const name = document.getElementById('inviteName').value;
        const birth = document.getElementById('inviteBirth').value;
        const email = document.getElementById('inviteEmail').value;

        const newInvite = {
            hostEmail: loggedInUser.email,
            guestName: name,
            guestBirth: birth,
            guestEmail: email,
            date: new Date().toISOString(),
        };

        const invites = getDB('academiaInvitations');
        invites.push(newInvite);
        saveDB('academiaInvitations', invites);

        showModal(`🎟️ Convite gerado com sucesso para ${name}! O acesso está liberado.`);
        toggleModal('inviteModal', false);
        this.reset();
        renderInvitations();
    });
}

function renderInvitations() {
    const list = document.getElementById('inviteList');
    if (!list || !loggedInUser) return;

    const allUserInvites = getDB('academiaInvitations').filter(i => i.hostEmail === loggedInUser.email);
    
    const now = new Date();
    const invitesThisMonth = allUserInvites.filter(i => {
        const inviteDate = new Date(i.date);
        return inviteDate.getMonth() === now.getMonth() && inviteDate.getFullYear() === now.getFullYear();
    });

    let html = `<div style="margin-bottom: 15px; font-size: 0.9em; color: var(--color-text-secondary);">Convites usados neste mês: <strong style="color: var(--color-accent);">${invitesThisMonth.length} / 5</strong></div>`;

    if (allUserInvites.length === 0) {
        list.innerHTML = html + `<p style="font-size: 0.9em; color: var(--color-text-secondary); font-style: italic;">Nenhum convite emitido recentemente.</p>`;
        return;
    }

    list.innerHTML = html + `<h4 style="margin-bottom: 10px; color: var(--color-text); font-size: 1.1em;">Meus Convites Gerados:</h4>` + allUserInvites.map(i => `
        <div style="background: var(--color-bg); padding: 12px 15px; border-radius: 4px; border: 1px solid var(--color-border-strong); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong style="color: var(--color-primary); font-size: 1.1em;">${i.guestName}</strong><br>
                <span style="font-size: 0.85em; color: var(--color-text-secondary);">📧 ${i.guestEmail} | 🎂 Nasc: ${new Date(i.guestBirth).toLocaleDateString('pt-BR')}</span>
            </div>
            <span style="background: rgba(34, 197, 94, 0.2); color: var(--color-success); padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold;">Ativo</span>
        </div>
    `).join('');
}