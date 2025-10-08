// ============================================================================
// SISTEMA VR DE OFTALMOLOGIA - JavaScript
// Funcionalidades interativas da página
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas as funcionalidades
    initNavigation();
    initScrollEffects();
    initAnimations();
    initFormHandling();
    initVRDemo();
    initAccessibilityFeatures();
    initAuthModals();
});

// ============================================================================
// NAVEGAÇÃO
// ============================================================================
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu mobile (A LÓGICA DO CLIQUE ESTÁ AQUI)
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active'); // Mostra/esconde o menu
            navToggle.classList.toggle('active'); // Anima o ícone do hambúrguer para um "X"
        });
    }

    // Smooth scrolling e fechar o menu ao clicar em um link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            // Verifica se é um link interno (#) ou externo (login.html)
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                // Fecha o menu mobile após o clique em um link interno
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    });

    // Highlighting do menu ativo e header com scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });

    // Header background no scroll
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// ============================================================================
// EFEITOS DE SCROLL
// ============================================================================
function initScrollEffects() {
    // Intersection Observer para animações
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observar elementos animáveis
    const animateElements = document.querySelectorAll([
        '.feature-card',
        '.user-card',
        '.room-card',
        '.stat-card',
        '.tech-item',
        '.contact-item'
    ].join(', '));

    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Parallax no hero
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-visual');
        
        parallaxElements.forEach(el => {
            const speed = 0.5;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// ============================================================================
// ANIMAÇÕES PERSONALIZADAS
// ============================================================================
function initAnimations() {
    // Counter animation para estatísticas
    const counters = document.querySelectorAll('.stat h3, .stat-card h3');
    
    counters.forEach(counter => {
        const target = parseInt(counter.innerText.replace(/\D/g, ''));
        let current = 0;
        const increment = target / 60; // 60 frames = 1 segundo
        
        function updateCounter() {
            if (current < target) {
                current += increment;
                if (counter.innerText.includes('%')) {
                    counter.innerText = Math.ceil(current) + '%';
                } else {
                    counter.innerText = Math.ceil(current);
                }
                requestAnimationFrame(updateCounter);
            } else {
                if (counter.innerText.includes('%')) {
                    counter.innerText = target + '%';
                } else {
                    counter.innerText = target;
                }
            }
        }
        
        // Iniciar animação quando elemento entrar na tela
        const counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    counterObserver.unobserve(entry.target);
                }
            });
        });
        
        counterObserver.observe(counter);
    });

    // Typing effect no hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.innerHTML;
        heroTitle.innerHTML = '';
        heroTitle.style.borderRight = '2px solid var(--primary-blue)';
        
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                heroTitle.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else {
                setTimeout(() => {
                    heroTitle.style.borderRight = 'none';
                }, 1000);
            }
        }
        
        setTimeout(typeWriter, 1000);
    }
}

// ============================================================================
// FORMULÁRIO DE CONTATO
// ============================================================================
function initFormHandling() {
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this);
        });

        // Validação em tempo real
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearError);
        });
    }
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    clearError(e);
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo é obrigatório');
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Digite um email válido');
        return false;
    }
    
    return true;
}

function clearError(e) {
    const field = e.target;
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.classList.remove('error');
}

function showFieldError(field, message) {
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#000'; // cor preta para mensagem de erro
    errorDiv.style.fontSize = '14px';
    errorDiv.style.marginTop = '4px';
    field.parentNode.appendChild(errorDiv);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function handleFormSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validar todos os campos
    let isValid = true;
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    // Simular envio
    showNotification('Enviando mensagem...', 'info');
    
    setTimeout(() => {
        console.log('Dados do formulário:', data);
        showNotification('Mensagem enviada com sucesso! Retornaremos em breve.', 'success');
        form.reset();
    }, 2000);
}

// ============================================================================
// DEMO VR INTERATIVO
// ============================================================================
function initVRDemo() {
    const vrHeadset = document.querySelector('.vr-headset');
    const floatingElements = document.querySelectorAll('.element');
    
    if (vrHeadset) {
        // Efeito de hover no headset VR
        vrHeadset.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.filter = 'drop-shadow(0 10px 20px rgba(30, 136, 229, 0.3))';
            
            floatingElements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.transform = `scale(1.2) rotate(${index * 90}deg)`;
                }, index * 100);
            });
        });
        
        vrHeadset.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.filter = 'none';
            
            floatingElements.forEach(element => {
                element.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    }
    
    // Efeito de clique nos cards de salas
    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach(card => {
        card.addEventListener('click', function() {
            showRoomPreview(this);
        });
    });
}

function showRoomPreview(roomCard) {
    const roomName = roomCard.querySelector('h3').textContent;
    const roomType = roomCard.querySelector('.room-access').textContent;
    
    const modal = createModal(`
        <div class="room-preview">
            <h3>🥽 Prévia da ${roomName}</h3>
            <p><strong>Acesso:</strong> ${roomType}</p>
            <div class="vr-preview-placeholder">
                <div class="vr-scene">
                    <div class="vr-element">📱 Interface VR</div>
                    <div class="vr-element">👥 Usuários Conectados</div>
                    <div class="vr-element">📚 Conteúdo Educacional</div>
                </div>
            </div>
            <p><em>Esta é uma simulação. A experiência VR real oferece imersão completa.</em></p>
            <div class="preview-actions">
                <button class="btn btn-primary" onclick="closeModal()">
                    <i class="fas fa-vr-cardboard"></i>
                    Iniciar Experiência VR
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    Fechar Prévia
                </button>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

// ============================================================================
// SISTEMA DE NOTIFICAÇÕES
// ============================================================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-white);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-xl);
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        transform: translateX(100%);
        transition: var(--transition);
        max-width: 400px;
        border-left: 4px solid var(--${type === 'error' ? 'error-red' : type === 'success' ? 'success-green' : 'primary-blue'});
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ============================================================================
// MODAL SYSTEM
// ============================================================================
function createModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">
                <i class="fas fa-times"></i>
            </button>
            ${content}
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: var(--transition);
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: var(--primary-white);
        border-radius: var(--border-radius-lg);
        padding: 32px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        transform: scale(0.9);
        transition: var(--transition);
    `;
    
    const modalClose = modal.querySelector('.modal-close');
    modalClose.style.cssText = `
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--gray-600);
        transition: var(--transition);
    `;
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Retornamos o modal; classe 'active' será adicionada externamente via classList.add padrão
    
    return modal;
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => modal.remove(), 300);
    }
}

// ============================================================================
// RECURSOS DE ACESSIBILIDADE
// ============================================================================
function initAccessibilityFeatures() {
    // Navegação por teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
        
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Reduzir animações se solicitado pelo usuário
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
    }
    
    // Alto contraste
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
    }
    
    // Skip links
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Pular para conteúdo principal';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-blue);
        color: var(--primary-white);
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        transition: var(--transition);
        z-index: 10000;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

// Debounce function para otimizar performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function para eventos de scroll
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Otimizar eventos de scroll
window.addEventListener('scroll', throttle(updateActiveNavLink, 100));

// Console welcome message
console.log(`
🥽 Sistema VR de Oftalmologia
📋 Frontend carregado com sucesso!
🛠️ Stack: HTML5, CSS3, JavaScript ES6+
🎨 Design: Gradientes Verde, Azul, Branco
🔧 Funcionalidades: Totalmente interativo e acessível
📱 Responsivo: Mobile-first design
🚀 Pronto para integração com backend!
`);

// Service Worker para cacheamento (opcional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('ServiceWorker registrado com sucesso:', registration.scope);
        })
        .catch(error => {
            console.log('Falha ao registrar ServiceWorker:', error);
        });
}

// Google Analytics (placeholder)
function trackEvent(action, category = 'User Interaction') {
    console.log(`Analytics: ${category} - ${action}`);
    // gtag('event', action, { event_category: category });
}

// Adicionar tracking aos botões principais
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
        trackEvent('Button Click', this.textContent.trim());
    });
});

// Performance monitoring
window.addEventListener('load', function() {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`⚡ Página carregada em ${loadTime}ms`);
    
    if (loadTime > 3000) {
        console.warn('⚠️ Tempo de carregamento lento detectado');
    }
}); 

// ============================================================================
// AUTENTICAÇÃO (Login / Cadastro) via Modal
// ============================================================================
function initAuthModals() {
    const loginLink = document.querySelector('.nav-login');
    const cadastroLink = document.querySelector('.nav-cadastro');

    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }

    if (cadastroLink) {
        cadastroLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'register.html';
        });
    }
}

function showLoginModal() {
    const modal = createModal(`
        <h3 style="text-align:center;margin-bottom:24px;">Login</h3>
        <form id="login-form">
            <div class="form-group">
                <label for="modal-login-name">Nome de Usuário</label>
                <input type="text" id="modal-login-name" name="name" required>
            </div>
            <div class="form-group">
                <label for="modal-login-password">Senha</label>
                <input type="password" id="modal-login-password" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary">Entrar</button>
        </form>
    `);

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    // Validação e submissão
    const loginForm = modal.querySelector('#login-form');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission(this);
        closeModal();
    });
}

function showCadastroModal() {
    const modal = createModal(`
        <h3 style="text-align:center;margin-bottom:24px;">Cadastro</h3>
        <form id="cadastro-form">
            <div class="form-group">
                <label for="modal-register-fullname">Nome Completo</label>
                <input type="text" id="modal-register-fullname" name="fullname" required>
            </div>
            <div class="form-group">
                <label for="modal-register-email">Email</label>
                <input type="email" id="modal-register-email" name="email" required>
            </div>
            <div class="form-group">
                <label for="modal-register-password">Senha</label>
                <input type="password" id="modal-register-password" name="password" required>
            </div>
            <div class="form-group">
                <label for="modal-register-confirm">Confirmar Senha</label>
                <input type="password" id="modal-register-confirm" name="confirm" required>
            </div>
            <div class="form-group">
                <label for="modal-register-role">Tipo de Usuário</label>
                <select id="modal-register-role" name="role" required>
                    <option value="">Selecione...</option>
                    <option value="comum">Usuário Comum</option>
                    <option value="estudante">Estudante</option>
                    <option value="medico">Médico</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Cadastrar</button>
        </form>
    `);

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    const cadastroForm = modal.querySelector('#cadastro-form');
    cadastroForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = cadastroForm.querySelector('#modal-register-password').value;
        const confirm = cadastroForm.querySelector('#modal-register-confirm').value;
        if (password !== confirm) {
            showNotification('As senhas não coincidem', 'error');
            return;
        }
        handleFormSubmission(this);
        closeModal();
    });
} 

/* =================================================================== */
/* FUNCIONALIDADE DE MODAL E PRÉVIA DAS SALAS VR                  */
/* =================================================================== */

// Função genérica para criar um modal (janela de sobreposição)
function createModal(content) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = content;
    
    modalOverlay.appendChild(modalContent);
    
    // Fechar o modal ao clicar fora dele
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    return modalOverlay;
}

// Função para fechar qualquer modal ativo
function closeModal() {
    const activeModal = document.querySelector('.modal-overlay.active');
    if (activeModal) {
        activeModal.classList.remove('active');
        // Esperar a transição de fade-out terminar para remover o elemento
        setTimeout(() => {
            activeModal.remove();
        }, 300);
    }
}

/* =================================================================== */
/* FUNCIONALIDADE DE MODAL E PRÉVIA DAS SALAS VR (VERSÃO CORRETA) */
/* =================================================================== */

// Função genérica para criar o overlay e o contêiner do modal
function createModal(content) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = content;

    modalOverlay.appendChild(modalContent);

    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    return modalOverlay;
}

// Função para fechar qualquer modal ativo
function closeModal() {
    const activeModal = document.querySelector('.modal-overlay.active');
    if (activeModal) {
        activeModal.classList.remove('active');
        setTimeout(() => {
            if(activeModal) activeModal.remove();
        }, 300);
    }
}

// Função para mostrar a prévia da sala VR com o novo design
function showRoomPreview(roomCard) {
    const roomName = roomCard.querySelector('h3').textContent;
    const roomType = roomCard.querySelector('.room-access').textContent;
    const featuresList = roomCard.querySelector('.room-features ul');
    const featuresHTML = featuresList ? featuresList.innerHTML : '<li>Recursos não disponíveis.</li>';

    const modalHTML = `
        <div class="room-preview-grid">
            <div class="preview-media">
                <div class="play-button"><i class="fas fa-play"></i></div>
            </div>
            <div class="preview-details">
                <button class="modal-close-btn" onclick="closeModal()">&times;</button>
                <h3 class="gradient-text">${roomName}</h3>
                <p class="access-info">${roomType}</p>
                <h4>Funcionalidades Incluídas:</h4>
                <ul class="preview-feature-list">
                    ${featuresHTML.replace(/<li>/g, '<li><i class="fas fa-check-circle"></i> ')}
                </ul>
                <div class="preview-actions">
                    <button class="btn btn-primary" onclick="closeModal()">
                        <i class="fas fa-vr-cardboard"></i>
                        Entrar na Sala
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                </div>
            </div>
        </div>
    `;

    const modal = createModal(modalHTML);
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}