// ==========================================
// RENDERIZAÇÃO DA TELA DE TREINOS E VÍDEOS
// TODO: Se adicionar muitos treinos novos no dados.js, pensar em criar uma paginação aqui.
// ==========================================

function renderWorkouts() {
    const list = document.getElementById('workoutsList');
    const detail = document.getElementById('workoutDetail');
    
    if (list) list.style.display = 'block';
    if (detail) detail.style.display = 'none';

    // Inicia listando todos os treinos
    let workoutsToRender = workouts;

    if (loggedInUser) {
        const savedPlanJson = localStorage.getItem(`userPlan_${loggedInUser.email}`);
        if (savedPlanJson) {
            // Substitui os treinos padrão pelo plano salvo do usuário
            const savedPlan = JSON.parse(savedPlanJson);
            workoutsToRender = savedPlan.workoutSchedule.map(id => workouts.find(w => w.id === id));
            list.innerHTML = '<h2 style="color: var(--color-primary); margin-bottom: 20px;">Seu Plano de Treino</h2>';
        } else {
             list.innerHTML = '<h2 style="color: var(--color-primary); margin-bottom: 20px;">Treinos Padrão</h2>';
        }
    } else {
        list.innerHTML = '<h2 style="color: var(--color-primary); margin-bottom: 20px;">Treinos Padrão</h2>';
    }

    // Renderiza a grade de treinos
    list.innerHTML += '<div class="workout-grid">' + 
        workoutsToRender.map(workout => `
            <div class="workout-card" onclick="selectWorkout('${workout.id}')">
                <h3>${workout.name}</h3>
                <p class="muscle-group">${workout.muscleGroups.join(', ')}</p>
                <p class="exercises-count">${workout.exercises.length} exercícios</p>
                <button>Ver Detalhes</button>
            </div>
        `).join('') + '</div>';
}

function selectWorkout(workoutId) {
    // console.log("Selecionado:", workoutId); // TODO: remover em prod

    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;

    const list = document.getElementById('workoutsList');
    const detail = document.getElementById('workoutDetail');

    list.style.display = 'none';
    detail.style.display = 'block';
    detail.innerHTML = `
        <button class="back-btn" onclick="renderWorkouts(); document.getElementById('workoutsList').style.display='block'; document.getElementById('workoutDetail').style.display='none';">← Voltar</button>
        <div class="workout-detail">
            <h2>${workout.name}</h2>
            <div class="exercise-list">
                ${workout.exercises.map(ex => `
                    <div class="exercise-item">
                        <div class="exercise-details">
                            <h4>${ex.name}</h4>
                            <div class="exercise-info">
                                <span>📊 ${ex.sets} séries</span>
                                <span>🔢 ${ex.reps} repetições</span>
                                <span>💪 ${ex.muscleGroup}</span>
                            </div>
                        </div>
                        <button class="btn-secondary" style="width: auto; align-self: center;" onclick="logExerciseProgress('${ex.name}')">Registrar Progresso</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function playVideo(videoId) {
    const video = videos[videoId];
    if (!video) return;

    const list = document.getElementById('videosList');
    const detail = document.getElementById('videoDetail');
    
    if (list) list.style.display = 'none';
    detail.style.display = 'block';
    detail.innerHTML = `
        <button class="back-btn" onclick="document.getElementById('videosList').style.display='block'; document.getElementById('videoDetail').style.display='none';">← Voltar</button>
        <div class="video-container">
            <h2>${video.title}</h2>
            
            ${video.url ? `
                <div class="video-player" style="padding: 0; overflow: hidden;">
                    <iframe width="100%" height="100%" src="${video.url}" title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="min-height: 400px; border-radius: 4px;"></iframe>
                </div>
            ` : `<div class="video-player">🎬 Vídeo indisponível no momento.</div>`}

            <div class="video-info">
                <div class="video-info-item">
                    <h4>⏱️ Duração</h4>
                    <p>${video.duration}</p>
                </div>
                <div class="video-info-item">
                    <h4>📝 Descrição</h4>
                    <p>${video.description}</p>
                </div>
            </div>
        </div>
    `;
}

function renderVideos() {
    const list = document.getElementById('videosList');
    if (!list) return; 

    const detail = document.getElementById('videoDetail');
    if (list) list.style.display = 'block';
    if (detail) detail.style.display = 'none';

    // Limpa o campo de busca ao abrir a aba para mostrar todos os vídeos do zero
    const searchInput = document.getElementById('videoSearchInput');
    if (searchInput) searchInput.value = '';

    renderVideoGrid();
}

function renderVideoGrid() {
    const grid = document.getElementById('videoGrid');
    if (!grid) return;

    const searchTerm = (document.getElementById('videoSearchInput')?.value || '').toLowerCase();

    // Filtra os vídeos buscando o texto tanto no título quanto na descrição
    const filteredKeys = Object.keys(videos).filter(key => {
        const v = videos[key];
        return v.title.toLowerCase().includes(searchTerm) || v.description.toLowerCase().includes(searchTerm);
    });

    if (filteredKeys.length === 0) {
        grid.innerHTML = '<p class="no-history-message" style="grid-column: 1 / -1;">Nenhum vídeo encontrado. 😢</p>';
        return;
    }

    grid.innerHTML = filteredKeys.map(key => {
            const video = videos[key];
            return `
                <div class="workout-card" onclick="playVideo('${key}')">
                    <h3>${video.title}</h3>
                    <p class="muscle-group">⏱️ ${video.duration}</p>
                    <p class="exercises-count">${video.description}</p>
                    <button>Assistir Aula</button>
                </div>
            `;
    }).join('');
}

const planFormHtml = `
    <div class="plan-form">
        <div class="form-group">
            <label>Nome Completo</label>
            <input type="text" id="planName" placeholder="Seu nome">
        </div>
        <div class="form-group">
            <label>Objetivo Principal</label>
            <select id="planGoal">
                <option>Ganho de Massa Muscular</option>
                <option>Perda de Peso</option>
                <option>Condicionamento Físico</option>
                <option>Força</option>
            </select>
        </div>
        <div class="form-group">
            <label>Nível de Experiência</label>
            <select id="planLevel">
                <option>Iniciante</option>
                <option>Intermediário</option>
                <option>Avançado</option>
            </select>
        </div>
        <div class="form-group">
            <label>Dias Disponíveis por Semana</label>
            <select id="planDays">
                <option>3 dias</option>
                <option>4 dias</option>
                <option>5 dias</option>
                <option>6 dias</option>
            </select>
        </div>
        <div class="form-group">
            <label>Restrições ou Lesões</label>
            <textarea id="planRestrictions" placeholder="Informe se tem alguma lesão ou restrição" rows="3"></textarea>
        </div>
        <div class="form-group">
            <label>Observações Adicionais</label>
            <textarea id="planNotes" placeholder="Observações gerais" rows="3"></textarea>
        </div>
    </div>
    <button class="btn-primary" onclick="generatePlan()">Gerar Meu Plano Personalizado</button>
    <div id="generatedPlan" style="margin-top: 30px; display: none;"></div>
`;

function generatePlan() {
    // Coleta os dados do formulário de perfil
    const name = document.getElementById('planName').value;
    const goal = document.getElementById('planGoal').value;
    const level = document.getElementById('planLevel').value;
    const days = document.getElementById('planDays').value;
    const restrictions = document.getElementById('planRestrictions').value;

    if (!loggedInUser) {
        showModal('Por favor, faça login para criar um plano.');
        return;
    }

    if (!name) {
        document.getElementById('planName').value = loggedInUser.name;
        showModal('Nome preenchido. Por favor, clique em gerar plano novamente.');
        return;
    }

    // Mapeia opções de treino com base na disponibilidade de dias
    const workoutOptions = {
        '3 dias': ['upper', 'lower', 'fullbody'],
        '4 dias': ['upper', 'lower', 'push', 'pull'],
        '5 dias': ['upper', 'lower', 'push', 'pull', 'fullbody'],
        '6 dias': ['upper', 'lower', 'push', 'pull', 'upper', 'lower']
    };

    const recommendedWorkoutIds = workoutOptions[days];
    
    const planData = { name, goal, level, days, restrictions, workoutSchedule: recommendedWorkoutIds };
    renderEditablePlan(planData, document.getElementById('generatedPlan'));
}

function renderEditablePlan(planData, container) {
    container.style.display = 'block';
    container.innerHTML = `
        <div class="editable-plan">
            <h3 style="color: var(--color-primary); margin-bottom: 20px;">Edite seu Plano</h3>
            <div class="plan-schedule">
                ${planData.workoutSchedule.map((workoutId, index) => `
                    <div class="day-workout" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">${['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][index]}:</label>
                        <select id="day-${index}" class="form-group" style="width: 100%; padding: 10px; background: var(--color-bg); border: 1px solid var(--color-border-strong); color: var(--color-text); border-radius: 6px;">
                            ${workouts.map(w => `<option value="${w.id}" ${w.id === workoutId ? 'selected' : ''}>${w.name}</option>`).join('')}
                        </select>
                    </div>
                `).join('')}
            </div>
            <button class="btn-primary" onclick="savePlan()" style="width: 100%; margin-top: 20px;">Salvar Plano</button>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="btn-secondary" onclick="renderPersonalizedPlan()" style="flex: 1;">Cancelar</button>
                <button class="btn-secondary" onclick="deletePlan()" style="flex: 1; border-color: var(--color-danger); color: var(--color-danger);">Refazer Plano</button>
            </div>
        </div>
    `;
}

function savePlan() {
    if (!loggedInUser) return;
    const schedule = [];
    document.querySelectorAll('.day-workout select').forEach(daySelect => schedule.push(daySelect.value));
    const userPlan = { ...getPlanFormParams(), workoutSchedule: schedule };
    localStorage.setItem(`userPlan_${loggedInUser.email}`, JSON.stringify(userPlan));
    showModal('✅ Plano salvo com sucesso!');
    renderPersonalizedPlan(); // Atualiza a visualização do plano
}

function deletePlan() {
    if (confirm('Tem certeza que deseja excluir seu plano atual e voltar ao formulário?')) {
        localStorage.removeItem(`userPlan_${loggedInUser.email}`);
        renderPersonalizedPlan();
        renderWorkouts(); 
        showModal('🗑️ Plano excluído. Crie um novo!');
    }
}

function getPlanFormParams() {
    const container = document.getElementById('plan-content');
    return {
        name: container.querySelector('#planName')?.value || '',
        goal: container.querySelector('#planGoal')?.value || '',
        level: container.querySelector('#planLevel')?.value || '',
        days: container.querySelector('#planDays')?.value || '',
        restrictions: container.querySelector('#planRestrictions')?.value || '',
        notes: container.querySelector('#planNotes')?.value || '',
    };
}

function renderPersonalizedPlan() {
    const planContentDiv = document.getElementById('plan-content');
    if (!planContentDiv) return;
    if (!loggedInUser) {
        planContentDiv.innerHTML = `<div style="text-align: center; padding: 40px 0;"><p style="margin-bottom: 20px;">Você precisa estar logado para criar ou ver seu plano.</p><button class="btn-primary" onclick="login()" style="width: auto;">Entrar</button></div>`;
        return;
    }
    const savedPlanJson = localStorage.getItem(`userPlan_${loggedInUser.email}`);
    if (savedPlanJson) {
        // Exibe o plano salvo ou o formulário de criação
        const savedPlan = JSON.parse(savedPlanJson);
        planContentDiv.innerHTML = ''; 
        renderEditablePlan(savedPlan, planContentDiv);
        const formState = document.createElement('div');
        formState.style.display = 'none';
        formState.innerHTML = `<input id="planName" value="${savedPlan.name}"><select id="planGoal"><option selected>${savedPlan.goal}</option></select><select id="planLevel"><option selected>${savedPlan.level}</option></select><select id="planDays"><option selected>${savedPlan.days}</option></select><textarea id="planRestrictions">${savedPlan.restrictions}</textarea><textarea id="planNotes">${savedPlan.notes || ''}</textarea>`;
        planContentDiv.appendChild(formState);
    } else {
        planContentDiv.innerHTML = planFormHtml;
    }
}