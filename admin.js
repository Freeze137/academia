// ==========================================
// LÓGICA DO PAINEL ADMIN
// ==========================================
function renderAdminPanel() {
    const adminContent = document.getElementById('adminDashboardContent');
    if (!loggedInUser || !loggedInUser.isAdmin) {
        adminContent.innerHTML = `<p class="no-history-message">Acesso Negado.</p>`;
        return;
    }

    const users = getDB('academiaUsers');
    // Filtra para não listar o próprio admin se desejar, ou lista todos.
    const regularUsers = users.filter(u => !u.isAdmin);

    // --- CÁLCULO DE INDICADORES (KPIs) ---
    const totalUsers = regularUsers.length;
    const activeSubscribers = regularUsers.filter(u => u.plan && u.plan !== 'Gratuito').length;
    
    let mrr = 0; // Receita Mensal Recorrente
    regularUsers.forEach(u => {
        if (u.plan === 'Basic') mrr += 89;
        if (u.plan === 'Premium') mrr += 119;
        if (u.plan === 'Anual') mrr += Math.round(899 / 12); // Divide o anual por 12 para ter a média mensal
    });

    const todayStr = new Date().toLocaleDateString('pt-BR');
    const checkinsToday = getDB('academiaCheckInHistory').filter(c => c.date === todayStr).length;

    const currentAnnouncement = localStorage.getItem('academiaAnnouncement') || '';

    // --- RENDERIZAÇÃO DO DASHBOARD ---
    let tableHtml = `
        <!-- Painel de Avisos Globais -->
        <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid var(--color-warning); padding: 20px; border-radius: 4px; margin-bottom: 30px;">
            <h3 style="color: var(--color-warning); margin-bottom: 10px;">📣 Quadro de Avisos da Direção</h3>
            <p style="color: var(--color-text-secondary); margin-bottom: 15px;">Escreva uma mensagem que aparecerá em destaque para todos os alunos (ex: funcionamento em feriados, aparelhos em manutenção).</p>
            <textarea id="adminAnnouncementText" rows="2" placeholder="Digite o aviso aqui..." style="width: 100%; padding: 12px; background: var(--color-bg); border: 1px solid var(--color-border-strong); color: var(--color-text); border-radius: 4px; margin-bottom: 15px; font-family: inherit;">${currentAnnouncement}</textarea>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn-primary" style="width: auto; background: var(--color-warning); color: #000; box-shadow: none;" onclick="adminSaveAnnouncement()">Salvar e Publicar</button>
                <button class="btn-secondary" style="width: auto; border-color: var(--color-danger); color: var(--color-danger);" onclick="adminClearAnnouncement()">Remover Aviso</button>
            </div>
        </div>

        <!-- Cards de Analytics -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; margin-top: 20px;">
            <div class="stat-card" style="border-left: 4px solid var(--color-primary);"><h4>👥 Total de Alunos</h4><p style="font-size: 2em;">${totalUsers}</p></div>
            <div class="stat-card" style="border-left: 4px solid var(--color-success);"><h4>💎 Assinantes Pagantes</h4><p style="font-size: 2em;">${activeSubscribers}</p></div>
            <div class="stat-card" style="border-left: 4px solid var(--color-warning);"><h4>💰 Receita (MRR)</h4><p style="font-size: 2em;">R$ ${mrr}</p></div>
            <div class="stat-card" style="border-left: 4px solid var(--color-accent);"><h4>✅ Check-ins Hoje</h4><p style="font-size: 2em;">${checkinsToday}</p></div>
        </div>
        
        <h3 style="color: var(--color-text); margin-bottom: 15px; border-bottom: 1px solid var(--color-border); padding-bottom: 10px;">Gerenciamento de Alunos</h3>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--color-border); color: var(--color-text-secondary);">
                        <th style="padding: 12px;">Aluno</th>
                        <th style="padding: 12px;">Email</th>
                        <th style="padding: 12px;">Plano Atual</th>
                        <th style="padding: 12px;">Cartão Vinculado</th>
                        <th style="padding: 12px;">Status</th>
                        <th style="padding: 12px; text-align: right;">Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (regularUsers.length === 0) {
        tableHtml += `<tr><td colspan="5" style="padding: 20px; text-align: center; color: var(--color-text-secondary);">Nenhum aluno cadastrado.</td></tr>`;
    } else {
        tableHtml += regularUsers.map(u => {
            const planText = u.plan && u.plan !== 'Gratuito' ? `<strong style="color: var(--color-primary);">${u.plan}</strong>` : 'Gratuito';
            let cardText = 'N/A';
            if (u.cardLast4) {
                cardText = `<span style="text-transform: capitalize;">${u.cardBrand || 'Cartão'}</span> final <strong>${u.cardLast4}</strong>`;
            }
            
            // Lógica simples de Status (Ativo se tiver plano pago, Inativo se não tiver)
            const statusBadge = u.plan && u.plan !== 'Gratuito' 
                ? `<span style="background: rgba(34, 197, 94, 0.2); color: var(--color-success); padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold;">Ativo</span>`
                : `<span style="background: rgba(255, 255, 255, 0.1); color: var(--color-text-secondary); padding: 4px 8px; border-radius: 4px; font-size: 0.85em;">Pendente</span>`;

            // Botões de Gerenciamento do Admin
            const actionsHtml = `
                <div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8em; border-color: var(--color-primary); color: var(--color-primary);" onclick="adminViewUser('${u.email}')" title="Ver Perfil do Aluno">👁️ Perfil</button>
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8em; border-color: var(--color-text-secondary); color: var(--color-text);" onclick="adminEditPlan('${u.email}')" title="Alterar Plano Manualmente">✏️ Editar Plano</button>
                    ${u.plan && u.plan !== 'Gratuito' ? `<button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8em; border-color: var(--color-warning); color: var(--color-warning);" onclick="adminCancelPlan('${u.email}')" title="Cancelar Assinatura">🚫 Cancelar Plano</button>` : ''}
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8em; border-color: var(--color-danger); color: var(--color-danger);" onclick="adminDeleteUser('${u.email}')" title="Excluir Aluno">🗑️ Excluir</button>
                </div>
            `;

            return `<tr style="border-bottom: 1px solid var(--color-border-strong);">
                <td style="padding: 12px;">${u.name}</td>
                <td style="padding: 12px;">${u.email}</td>
                <td style="padding: 12px;">${planText}</td>
                <td style="padding: 12px;">${cardText}</td>
                <td style="padding: 12px;">${statusBadge}</td>
                <td style="padding: 12px;">${actionsHtml}</td>
            </tr>`;
        }).join('');
    }
    tableHtml += `</tbody></table></div>`;

    // --- RENDERIZAÇÃO DA TABELA DE CONVITES (BENEFÍCIO PREMIUM) ---
    const invites = getDB('academiaInvitations');
    let invitesHtml = `
        <h3 style="color: var(--color-text); margin-top: 40px; margin-bottom: 15px; border-bottom: 1px solid var(--color-border); padding-bottom: 10px;">🎟️ Convites Gerados (Acompanhantes Premium)</h3>
        <div style="overflow-x: auto; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--color-border); color: var(--color-text-secondary);">
                        <th style="padding: 12px;">Convidado (Visitante)</th>
                        <th style="padding: 12px;">Data de Nasc.</th>
                        <th style="padding: 12px;">Data do Convite</th>
                        <th style="padding: 12px;">Aluno Responsável</th>
                        <th style="padding: 12px; text-align: right;">Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (invites.length === 0) {
        invitesHtml += `<tr><td colspan="5" style="padding: 20px; text-align: center; color: var(--color-text-secondary);">Nenhum convite gerado recentemente.</td></tr>`;
    } else {
        const sortedInvites = invites.slice().reverse(); // Lista os mais recentes no topo
        invitesHtml += sortedInvites.map(inv => {
            const host = users.find(u => u.email === inv.hostEmail);
            const hostName = host ? host.name : 'Desconhecido (Excluído)';
            const hostPlan = host ? host.plan : 'N/A';
            const inviteDateStr = new Date(inv.date).toLocaleDateString('pt-BR');
            const guestBirthStr = new Date(inv.guestBirth).toLocaleDateString('pt-BR');

            return `<tr style="border-bottom: 1px solid var(--color-border-strong);">
                <td style="padding: 12px;">
                    <strong style="color: var(--color-accent);">${inv.guestName}</strong><br>
                    <span style="font-size: 0.85em; color: var(--color-text-secondary);">📧 ${inv.guestEmail}</span>
                </td>
                <td style="padding: 12px;">${guestBirthStr}</td>
                <td style="padding: 12px;">${inviteDateStr}</td>
                <td style="padding: 12px;">
                    <strong>${hostName}</strong><br>
                    <span style="font-size: 0.85em; color: var(--color-text-secondary);">Plano: ${hostPlan} | ${inv.hostEmail}</span>
                </td>
                <td style="padding: 12px; text-align: right;">
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8em; border-color: var(--color-danger); color: var(--color-danger);" onclick="adminDeleteInvite('${inv.hostEmail}', '${inv.date}')" title="Excluir Convite">🗑️ Excluir</button>
                </td>
            </tr>`;
        }).join('');
    }
    invitesHtml += `</tbody></table></div>`;
    
    tableHtml += invitesHtml;

    adminContent.innerHTML = tableHtml;
}

function adminViewUser(email) {
    const users = getDB('academiaUsers');
    const user = users.find(u => u.email === email);
    if (!user) return;
    
    const progress = getDB('academiaProgress').filter(p => p.userId === email);
    const history = getDB('academiaCheckInHistory').filter(c => c.name === user.name);
    
    let details = `👤 Aluno: ${user.name}\n`;
    details += `📧 Email: ${user.email}\n`;
    details += `📅 Nascimento: ${new Date(user.birth).toLocaleDateString('pt-BR')}\n`;
    details += `✅ Total de Check-ins: ${history.length}\n`;
    details += `🏋️ Treinos Registrados: ${progress.length}\n\n`;
    
    if (progress.length > 0) {
        details += `Últimos registros de treino:\n`;
        progress.slice(-5).reverse().forEach(p => {
            details += `- ${p.exerciseName}: ${p.load}kg (${p.sets}x${p.reps})\n`;
        });
    }
    
    alert(details); 
}

function adminCancelPlan(email) {
    if (!confirm(`Tem certeza que deseja cancelar a assinatura do aluno ${email}? Os dados do cartão serão desvinculados.`)) return;
    let users = getDB('academiaUsers');
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
        users[userIndex].plan = 'Gratuito';
        delete users[userIndex].planStartDate;
        delete users[userIndex].cardLast4; // Remove o cartão do sistema
        delete users[userIndex].cardBrand;
        saveDB('academiaUsers', users);
        showModal(`✅ Plano do aluno cancelado com sucesso.`);
        renderAdminPanel(); // Atualiza a tabela dinamicamente
    }
}

function adminDeleteUser(email) {
    if (!confirm(`🚨 ATENÇÃO: Deseja realmente excluir o aluno ${email} do sistema? Essa ação apagará também o progresso dele e não pode ser desfeita.`)) return;
    let users = getDB('academiaUsers');
    users = users.filter(u => u.email !== email);
    saveDB('academiaUsers', users);
    let progress = getDB('academiaProgress');
    saveDB('academiaProgress', progress.filter(p => p.userId !== email));
    showModal(`🗑️ Aluno removido permanentemente do sistema.`);
    renderAdminPanel();
}

function adminEditPlan(email) {
    const users = getDB('academiaUsers');
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) return;
    const currentPlan = users[userIndex].plan || 'Gratuito';
    const newPlan = prompt(`Alterar o plano de ${users[userIndex].name}\n\nDigite exatamente um dos planos abaixo:\n- Gratuito\n- Basic\n- Premium\n- Anual`, currentPlan);
    if (newPlan && ['Gratuito', 'Basic', 'Premium', 'Anual'].includes(newPlan.trim())) {
        users[userIndex].plan = newPlan.trim();
        saveDB('academiaUsers', users);
        showModal(`✅ Plano de ${users[userIndex].name} atualizado para ${newPlan.trim()}!`);
        renderAdminPanel(); // Atualiza a tela para refletir o novo MRR e status
    } else if (newPlan) {
        showModal(`❌ Operação cancelada. Nome do plano inválido.`);
    }
}

function adminDeleteInvite(hostEmail, dateStr) {
    if (!confirm(`Tem certeza que deseja cancelar e excluir o passe deste acompanhante?`)) return;
    let invites = getDB('academiaInvitations');
    invites = invites.filter(i => !(i.hostEmail === hostEmail && i.date === dateStr));
    saveDB('academiaInvitations', invites);
    showModal(`🗑️ Convite removido com sucesso.`);
    renderAdminPanel();
}

// ==========================================
// LÓGICA DO AVISO GLOBAL (BROADCAST)
// ==========================================
function adminSaveAnnouncement() {
    const text = document.getElementById('adminAnnouncementText').value.trim();
    if (text) {
        localStorage.setItem('academiaAnnouncement', text);
        showModal('✅ Aviso global salvo e publicado para todos os alunos!');
        updateAnnouncementUI();
    } else {
        adminClearAnnouncement();
    }
}

function adminClearAnnouncement() {
    localStorage.removeItem('academiaAnnouncement');
    const textarea = document.getElementById('adminAnnouncementText');
    if (textarea) textarea.value = '';
    showModal('🗑️ Aviso global removido com sucesso.');
    updateAnnouncementUI();
}

function updateAnnouncementUI() {
    const announcement = localStorage.getItem('academiaAnnouncement');
    const banner = document.getElementById('globalAnnouncement');
    const bannerText = document.getElementById('globalAnnouncementText');
    if (banner && bannerText) {
        if (announcement) {
            bannerText.textContent = `🚨 AVISO IMPORTANTE: ${announcement}`;
            banner.style.display = 'block';
        } else {
            banner.style.display = 'none';
        }
    }
}