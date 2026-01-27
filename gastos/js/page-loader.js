/* ====================================================
   PAGE LOADER MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: gastos/js/page-loader.js
   Módulo reutilizable para mostrar/ocultar loader de inicialización
   ==================================================== */

/**
 * Mostrar loader de inicialización (reutilizable en todas las páginas)
 * @param {string} message - Mensaje a mostrar (por defecto: "Iniciando sistema...")
 */
function showPageLoader(message = 'Iniciando sistema...') {
    // Remover loader anterior si existe
    const existingLoader = document.getElementById('pageInitLoader');
    if (existingLoader) {
        existingLoader.remove();
    }

    const loader = document.createElement('div');
    loader.id = 'pageInitLoader';
    loader.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    loader.style.cssText = `
        background: rgba(25, 28, 36, 0.95);
        z-index: 9999;
        backdrop-filter: blur(10px);
    `;
    
    loader.innerHTML = `
        <div class="text-center text-white">
            <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <h5 class="mb-2">
                <i class="fas fa-chart-line me-2"></i>
                Symbiot Financial Manager
            </h5>
            <p class="text-muted mb-0" id="pageLoadStatus">${message}</p>
            <div class="progress mt-3" style="width: 300px;">
                <div id="pageLoadProgress" class="progress-bar bg-primary" style="width: 0%"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(loader);
    console.log('📡 Loader mostrado con mensaje:', message);
}

/**
 * Ocultar loader de inicialización
 * @param {number} delay - Delay en ms antes de ocultar (por defecto: 0)
 */
function hidePageLoader(delay = 0) {
    setTimeout(() => {
        const loader = document.getElementById('pageInitLoader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
                console.log('✅ Loader oculto');
            }, 500);
        }
    }, delay);
}

/**
 * Actualizar mensaje del loader
 * @param {string} message - Nuevo mensaje a mostrar
 */
function updatePageLoaderStatus(message) {
    const statusElement = document.getElementById('pageLoadStatus');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

/**
 * Actualizar barra de progreso del loader
 * @param {number} percentage - Porcentaje (0-100)
 */
function updatePageLoaderProgress(percentage) {
    const progressBar = document.getElementById('pageLoadProgress');
    if (progressBar) {
        progressBar.style.width = Math.min(Math.max(percentage, 0), 100) + '%';
    }
}

// Exponer funciones globalmente
window.showPageLoader = showPageLoader;
window.hidePageLoader = hidePageLoader;
window.updatePageLoaderStatus = updatePageLoaderStatus;
window.updatePageLoaderProgress = updatePageLoaderProgress;

console.log('✅ Page Loader Module cargado');
