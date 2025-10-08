// ============================================================================
// CLIENTE GRAPHQL - Sistema VR de Oftalmologia
// Cliente para comunicação com backend NestJS + GraphQL
// ============================================================================

class GraphQLClient {
    constructor(endpoint = window.BACKEND_GRAPHQL_ENDPOINT = 'https://rv-backend-api.onrender.com/graphql') {
        this.endpoint = endpoint;
        this.token = localStorage.getItem('access_token');
    }

    // Definir ou atualizar token de autenticação
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('access_token', token);
        } else {
            localStorage.removeItem('access_token');
        }
    }

    // Método principal para executar queries/mutations GraphQL
    async request(query, variables = {}) {
        const headers = {
            'Content-Type': 'application/json',
        };

        // Adicionar token de autenticação se disponível
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    query,
                    variables
                })
            });

            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            return result.data;
        } catch (error) {
            console.error('GraphQL Request Error:', error);
            throw error;
        }
    }

    // ========================================================================
    // MUTATIONS DE AUTENTICAÇÃO
    // ========================================================================

    // Login do usuário com tratamento específico de erros
    async login(email, senha) {
        const query = `
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    access_token
                    refresh_token
                    user {
                        id
                        email
                        nomeCompleto
                        tipoUsuario
                        status
                    }
                    email
                    sub
                    role
                    nomeCompleto
                }
            }
        `;

        const variables = {
            input: { email, senha }
        };

        try {
            const data = await this.request(query, variables);
            
            // Salvar tokens no localStorage
            if (data.login.access_token) {
                this.setToken(data.login.access_token);
                localStorage.setItem('refresh_token', data.login.refresh_token);
                localStorage.setItem('user_data', JSON.stringify(data.login.user));
            }

            return data.login;
        } catch (error) {
            // Tratar erros específicos para mensagens customizadas
            if (error.message.includes('User not found') || 
                error.message.includes('Email not found') ||
                error.message.includes('usuário não encontrado')) {
                throw new Error('User not found');
            } else if (error.message.includes('Invalid password') || 
                      error.message.includes('senha incorreta') ||
                      error.message.includes('Unauthorized')) {
                throw new Error('Invalid password');
            } else if (error.message.includes('Failed to fetch') || 
                      error.message.includes('NetworkError')) {
                throw new Error('network error');
            } else {
                throw error;
            }
        }
    }

    // Registro de novo usuário com tratamento específico de erros
    async registrar(userData) {
        const query = `
            mutation Registrar($input: RegistroInput!) {
                registrar(input: $input) {
                    access_token
                    refresh_token
                    user {
                        id
                        email
                        nomeCompleto
                        tipoUsuario
                        status
                    }
                    email
                    sub
                    role
                    nomeCompleto
                }
            }
        `;

        // Mapear tipoUsuario para enum correto
        const tipoUsuarioMap = {
            'comum': 'USUARIO_COMUM',
            'estudante': 'ESTUDANTE', 
            'medico': 'MEDICO'
        };

        const variables = {
            input: {
                nomeCompleto: userData.nomeCompleto,
                email: userData.email,
                senha: userData.senha,
                tipoUsuario: tipoUsuarioMap[userData.tipoUsuario] || 'USUARIO_COMUM',
                telefone: userData.telefone,
                // Campos específicos baseados no tipo
                ...(userData.crm && { crm: userData.crm }),
                ...(userData.ufCrm && { ufCrm: userData.ufCrm }),
                ...(userData.matricula && { matricula: userData.matricula }),
                ...(userData.instituicaoEnsino && { instituicaoEnsino: userData.instituicaoEnsino })
            }
        };

        try {
            const data = await this.request(query, variables);
            
            // Salvar tokens no localStorage
            if (data.registrar.access_token) {
                this.setToken(data.registrar.access_token);
                localStorage.setItem('refresh_token', data.registrar.refresh_token);
                localStorage.setItem('user_data', JSON.stringify(data.registrar.user));
            }

            return data.registrar;
        } catch (error) {
            // Tratar erros específicos para mensagens customizadas
            if (error.message.includes('already exists') || 
                error.message.includes('já existe') ||
                error.message.includes('duplicate') ||
                error.message.includes('UNIQUE constraint')) {
                throw new Error('email already exists');
            } else if (error.message.includes('Failed to fetch') || 
                      error.message.includes('NetworkError')) {
                throw new Error('network error');
            } else {
                throw error;
            }
        }
    }

    // Logout do usuário
    async logout() {
        const query = `
            mutation Logout {
                logout
            }
        `;

        try {
            await this.request(query);
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            // Limpar dados locais independente do resultado
            this.setToken(null);
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
        }
    }

    // Renovar token de acesso
    async renovarToken() {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('Refresh token não encontrado');
        }

        const query = `
            mutation RenovarToken($input: RefreshTokenInput!) {
                renovarToken(input: $input) {
                    access_token
                    refresh_token
                    user {
                        id
                        email
                        nomeCompleto
                        tipoUsuario
                        status
                    }
                }
            }
        `;

        const variables = {
            input: { refreshToken }
        };

        const data = await this.request(query, variables);
        
        // Atualizar tokens
        this.setToken(data.renovarToken.access_token);
        localStorage.setItem('refresh_token', data.renovarToken.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(data.renovarToken.user));

        return data.renovarToken;
    }

    // ========================================================================
    // QUERIES DE USUÁRIO
    // ========================================================================

    // Obter perfil completo do usuário logado
    async obterMeuPerfil() {
        const query = `
            query MeuPerfilCompleto {
                meuPerfilCompleto {
                    id
                    email
                    nomeCompleto
                    tipoUsuario
                    status
                    createdAt
                    updatedAt
                }
            }
        `;

        const data = await this.request(query);
        return data.meuPerfilCompleto;
    }

    // Verificar se o token ainda é válido
    async verificarToken() {
        const query = `
            query TokenValido {
                tokenValido
            }
        `;

        try {
            const data = await this.request(query);
            return data.tokenValido;
        } catch (error) {
            return false;
        }
    }

    // ========================================================================
    // UTILITÁRIOS DE AUTENTICAÇÃO
    // ========================================================================

    // Verificar se usuário está logado
    isAuthenticated() {
        return !!this.token && !!localStorage.getItem('user_data');
    }

    // Obter dados do usuário armazenados localmente
    getUserData() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }

    // Verificar tipo do usuário
    getUserType() {
        const userData = this.getUserData();
        return userData ? userData.tipoUsuario : null;
    }

    // Verificar se usuário tem permissão específica
    hasRole(role) {
        const userType = this.getUserType();
        return userType === role;
    }
}

// ============================================================================
// INSTÂNCIA GLOBAL DO CLIENTE
// ============================================================================

// Criar instância global do cliente GraphQL
window.graphqlClient = new GraphQLClient();

// ============================================================================
// SISTEMA DE NOTIFICAÇÕES PARA ERROS/SUCESSOS
// ============================================================================

window.showAPINotification = function(message, type = 'info') {
    // Criar notificação visual
    const notification = document.createElement('div');
    notification.className = `api-notification api-notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#fee' : type === 'success' ? '#efe' : '#eef'};
        border: 1px solid ${type === 'error' ? '#fcc' : type === 'success' ? '#cfc' : '#ccf'};
        color: ${type === 'error' ? '#c00' : type === 'success' ? '#060' : '#006'};
        border-radius: 8px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

console.log('🚀 GraphQL Client carregado com sucesso!');
console.log('📡 Endpoint:', window.graphqlClient.endpoint);
console.log('🔐 Autenticado:', window.graphqlClient.isAuthenticated()); 