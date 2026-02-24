// ==========================================
// UTILIDADES GENERALES
// ==========================================

// Notificaciones
const showNotification = (message, type = 'success', duration = 3000) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.body;
    container.appendChild(alertDiv);

    if (duration) {
        setTimeout(() => {
            alertDiv.remove();
        }, duration);
    }

    return alertDiv;
};

// Hacer peticiones a la API
const apiCall = async (url, options = {}) => {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('Error en API call:', error);
        throw error;
    }
};

// Formatear fecha
const formatDate = (date, format = 'DD/MM/YYYY HH:mm') => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year)
        .replace('HH', hours)
        .replace('mm', minutes);
};

// Validar email
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Obtener usuario actual
const getCurrentUser = async () => {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.success) {
            return data.usuario;
        }
        return null;
    } catch (error) {
        console.error('Error obtener usuario:', error);
        return null;
    }
};

// ==========================================
// FORMULARIOS
// ==========================================

// Validar formulario
const validateForm = (formId) => {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    const errors = {};

    inputs.forEach(input => {
        if (!input.value.trim()) {
            errors[input.name] = 'Este campo es requerido';
        }
    });

    return Object.keys(errors).length === 0 ? true : errors;
};

// Mostrar errores en formulario
const showFormErrors = (formId, errors) => {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        const errorDiv = input.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
            errorDiv.remove();
        }

        if (errors[input.name]) {
            input.classList.add('is-invalid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback d-block';
            errorDiv.textContent = errors[input.name];
            input.parentNode.appendChild(errorDiv);
        } else {
            input.classList.remove('is-invalid');
        }
    });
};

// Limpiar errores
const clearFormErrors = (formId) => {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        input.classList.remove('is-invalid');
        const errorDiv = input.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
            errorDiv.remove();
        }
    });
};

// ==========================================
// TABLAS
// ==========================================

// Crear tabla dinámicamente
const createTable = (containerId, data, columns) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `
        <table class="table table-hover">
            <thead>
                <tr>
                    ${columns.map(col => `<th>${col.label}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        ${columns.map(col => `<td>${row[col.key] || '-'}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
};

// ==========================================
// MODAL
// ==========================================

// Abrir modal
const openModal = (modalId) => {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
};

// Cerrar modal
const closeModal = (modalId) => {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) modal.hide();
};

// ==========================================
// LOGOUT
// ==========================================

const logout = async () => {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            window.location.href = '/login';
        } else {
            const data = await response.json();
            showNotification(data.message || 'Error al cerrar sesión', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cerrar sesión', 'danger');
    }
};

// ==========================================
// EVENT LISTENERS
// ==========================================

// Logout en todos los botones
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtns = document.querySelectorAll('[data-action="logout"], #logoutBtn, #logoutLink');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });

    // Cerrar alertas automáticamente
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        const closeBtn = alert.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                alert.remove();
            });
        }
    });
});

// ==========================================
// EXPORTAR
// ==========================================

export {
    showNotification,
    apiCall,
    formatDate,
    isValidEmail,
    getCurrentUser,
    validateForm,
    showFormErrors,
    clearFormErrors,
    createTable,
    openModal,
    closeModal,
    logout,
};
