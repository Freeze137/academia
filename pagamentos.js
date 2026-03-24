// ==========================================
// LÓGICA DE VENDAS E CHECKOUT
// Cuida do fake checkout e da transição de planos
// ==========================================

let currentSelectedPlan = null;

// Tabela de preços base para o cálculo de Upgrade
const PLANS_INFO = {
    'Basic': { price: 89, days: 30 },
    'Premium': { price: 119, days: 30 },
    'Anual': { price: 899, days: 365 }
};

function renderPlans() {
    const plans = ['Basic', 'Premium', 'Anual'];
    
    plans.forEach(plan => {
        const btn = document.getElementById(`btn-plan-${plan}`);
        if (!btn) return;

        // Reseta o botão para o estado padrão de compra
        btn.className = 'btn-primary';
        btn.textContent = `Assinar ${plan}`;
        
        // Se o usuário estiver logado e possuir este plano, altera o visual do botão
        if (loggedInUser && loggedInUser.plan === plan) {
            btn.className = 'btn-primary btn-current-plan';
            btn.innerHTML = '✅ Seu Plano Atual';
        }
    });
}

// Função para detectar a bandeira do cartão
function detectCardBrand(number) {
    // Remove caracteres não numéricos para validação
    const cleanNum = number.replace(/\D/g, '');
    if (/^4/.test(cleanNum)) return { class: 'visa', logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/4/40/Visa_Inc._logo_%281999%E2%80%932005%29.svg" alt="Visa">' };
    if (/^5[1-5]/.test(cleanNum)) return { class: 'mastercard', logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/1280px-MasterCard_Logo.svg.png" alt="Mastercard">' };
    if (/^3[47]/.test(cleanNum)) return { class: 'amex', logo: '<img src="https://www.freevector.com/uploads/vector/preview/17960/FreeVector-American-Express-Vector-Logo.jpg" style="border-radius: 4px;" alt="Amex">' };
    if (/^6/.test(cleanNum)) return { class: 'elo', logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Elo_card_association_logo_-_black_text.svg/1280px-Elo_card_association_logo_-_black_text.svg.png" style="background: white; padding: 2px; border-radius: 4px;" alt="Elo">' };
    return { class: 'default', logo: '💳' };
}

// Sincroniza inputs com o cartão visual
function updateVisualCard(field, defaultText, elementId) {
    const input = document.getElementById(field);
    input.oninput = function() {
        document.getElementById(elementId).textContent = this.value || defaultText;
    };
}

function openPaymentModal(planName, price) {
    if (!loggedInUser) {
        showModal('⚠️ Você precisa criar uma conta ou fazer login para assinar um plano.');
        switchTab('checkin');
        return;
    }

    if (loggedInUser.plan === planName) {
        showModal(`⚠️ Você já é assinante do plano ${planName}!`);
        return;
    }

    currentSelectedPlan = planName;
    let displayPriceText = `por <strong>R$ ${price},00</strong>`;

    // Lógica de cálculo de Upgrade/Downgrade se o usuário já tiver um plano pago
    if (loggedInUser.plan && loggedInUser.plan !== 'Gratuito' && PLANS_INFO[loggedInUser.plan]) {
        const currentPlan = PLANS_INFO[loggedInUser.plan];
        const newPlan = PLANS_INFO[planName];

        // Calcula os dias restantes no ciclo atual (baseado em ciclos de 30 dias)
        const startDate = new Date(loggedInUser.planStartDate || loggedInUser.createdAt);
        const diffDays = Math.floor(Math.abs(new Date() - startDate) / (1000 * 60 * 60 * 24));
        const remainingDays = currentPlan.days - (diffDays % currentPlan.days);

        if (newPlan.price > currentPlan.price) {
            // É UM UPGRADE: Calcula a diferença proporcional dos dias restantes
            const currentDailyRate = currentPlan.price / currentPlan.days;
            let upgradeCost = 0;
            let calcText = '';

            if (planName === 'Anual') {
                const unusedCredit = currentDailyRate * remainingDays;
                upgradeCost = newPlan.price - unusedCredit;
                calcText = `Valor anual com desconto de R$ ${unusedCredit.toFixed(2).replace('.', ',')} pelos dias restantes do seu ciclo mensal.`;
            } else {
                const newDailyRate = newPlan.price / newPlan.days;
                upgradeCost = (newDailyRate - currentDailyRate) * remainingDays;
                calcText = `Restam ${remainingDays} dias no seu ciclo. Pagando apenas a diferença.`;
            }

            displayPriceText = `<br><span style="display: inline-block; margin-top: 15px; font-size: 0.95em; padding: 12px; background: rgba(255,183,3,0.1); border: 1px solid var(--color-accent); border-radius: 4px; color: var(--color-text);">
                🚀 <strong>Upgrade de Plano</strong><br>
                <span style="font-size: 0.85em; color: var(--color-text-secondary);">${calcText}</span><br>
                A pagar hoje: <strong style="color: var(--color-primary); font-size: 1.2em;">R$ ${Math.max(0, upgradeCost).toFixed(2).replace('.', ',')}</strong>
            </span>`;
        } else {
            // É UM DOWNGRADE
            displayPriceText = `<br><span style="display: inline-block; margin-top: 15px; font-size: 0.95em; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text-secondary);">
                ⬇️ <strong>Downgrade programado</strong><br>
                O novo valor será cobrado no próximo ciclo.<br>
                Hoje: <strong>R$ 0,00</strong>
            </span>`;
        }
    }

    document.getElementById('paymentPlanName').innerHTML = `Assinando: <strong>${planName}</strong> ${displayPriceText}`;
    
    const visualCard = document.getElementById('visualCard');
    visualCard.className = 'visual-card'; 
    document.getElementById('cardLogo').innerHTML = '💳'; 
    
    document.getElementById('paymentForm').reset();
    document.getElementById('paymentSubmitBtn').disabled = true;
    document.getElementById('visualCardNumber').textContent = '#### #### #### ####';
    document.getElementById('visualCardName').textContent = 'NOME DO TITULAR';
    document.getElementById('visualCardDate').textContent = 'MM/AA';
    document.getElementById('visualCardCvv').textContent = '***';

    void visualCard.offsetWidth; 
    visualCard.classList.add('spin-in'); 
    
    updateVisualCard('payName', 'NOME DO TITULAR', 'visualCardName');
    updateVisualCard('payDate', 'MM/AA', 'visualCardDate');

    const cvvInput = document.getElementById('payCvv');
    cvvInput.onfocus = () => document.getElementById('visualCardInner').classList.add('flipped');
    cvvInput.onblur = () => document.getElementById('visualCardInner').classList.remove('flipped');
    cvvInput.oninput = function() { document.getElementById('visualCardCvv').textContent = this.value || '***'; };

    const cardInput = document.getElementById('payCard');
    cardInput.oninput = function() {
        // Aplica máscara ao número do cartão (grupos de 4 dígitos)
        this.value = this.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
        document.getElementById('visualCardNumber').textContent = this.value || '#### #### #### ####';
        const brandInfo = detectCardBrand(this.value);
        document.getElementById('cardLogo').innerHTML = brandInfo.logo;
        visualCard.className = `visual-card spin-in ${brandInfo.class}`;
        const cleanDigits = this.value.replace(/\D/g, '');
        
        // Valida o comprimento do número (Amex: 15 dígitos, Outros: 16)
        const minLength = /^3[47]/.test(cleanDigits) ? 15 : 16;
        document.getElementById('paymentSubmitBtn').disabled = cleanDigits.length < minLength;
    };
    
    const dateInput = document.getElementById('payDate');
    dateInput.oninput = function() { this.value = this.value.replace(/\D/g, '').replace(/(\d{2})(\d{1,2})/, '$1/$2').trim(); };

    toggleModal('paymentModal', true);
    setTimeout(() => document.getElementById('payName').focus(), 800);
}

document.getElementById('paymentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    if (!loggedInUser) return;
    const submitBtn = document.getElementById('paymentSubmitBtn') || this.querySelector('button[type="submit"]');
    
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;

    // Simula atraso de processamento da rede
    setTimeout(() => {
        loggedInUser.plan = currentSelectedPlan;
        if (!loggedInUser.planStartDate) loggedInUser.planStartDate = new Date().toISOString(); 
        
        // SALVANDO CARTÃO (SIMULAÇÃO SEGURA):
        // Removemos tudo que não é número, e salvamos apenas os 4 últimos dígitos para o Admin ver.
        const cardNumber = document.getElementById('payCard').value.replace(/\D/g, '');
        loggedInUser.cardLast4 = cardNumber.slice(-4);
        loggedInUser.cardBrand = detectCardBrand(cardNumber).class;

        syncCurrentUser();

        showModal(`🎉 Pagamento Aprovado! Bem-vindo ao plano ${currentSelectedPlan}.`);
        toggleModal('paymentModal', false);
        this.reset();
        
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
        switchTab('profile');
    }, 2000); 
});