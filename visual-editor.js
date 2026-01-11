// Visual Editor - Универсальная админпанель

const DATA_KEY = 'sewingData';
let data = JSON.parse(localStorage.getItem(DATA_KEY) || '{}');
let selectedElement = null;
let currentDevice = 'desktop';
let currentMode = 'layout';

// Порядок элементов для разных устройств
if (!data.elementOrder) {
    data.elementOrder = {
        desktop: {},
        tablet: {},
        mobile: {}
    };
}

// Структура элементов сайта
const siteElements = [
    {
        id: 'logo',
        name: 'Логотип',
        icon: 'fa-image',
        category: 'Заголовок',
        selector: '#site-logo',
        visible: true,
        settings: ['width', 'height', 'margin', 'padding']
    },
    {
        id: 'logo-text',
        name: 'Текст на логотипе',
        icon: 'fa-font',
        category: 'Заголовок',
        selector: '#logo-text-overlay',
        visible: data.logoText?.enabled || false,
        settings: ['fontSize', 'color', 'position']
    },
    {
        id: 'tagline',
        name: 'Tagline',
        icon: 'fa-quote-left',
        category: 'Заголовок',
        selector: '.tagline',
        visible: true,
        settings: ['fontSize', 'color', 'margin']
    },
    {
        id: 'services-section',
        name: 'Раздел услуг',
        icon: 'fa-briefcase',
        category: 'Секции',
        selector: '.services',
        visible: data.settings?.showServices !== false,
        settings: ['width', 'margin', 'padding', 'order']
    },
    {
        id: 'services-title',
        name: 'Заголовок услуг',
        icon: 'fa-heading',
        category: 'Услуги',
        selector: '.services h2',
        visible: true,
        settings: ['fontSize', 'color', 'fontFamily', 'textAlign']
    },
    {
        id: 'contact-section',
        name: 'Раздел контактов',
        icon: 'fa-address-book',
        category: 'Секции',
        selector: '.contact',
        visible: true,
        settings: ['width', 'margin', 'padding', 'order']
    },
    {
        id: 'contact-title',
        name: 'Заголовок контактов',
        icon: 'fa-heading',
        category: 'Контакты',
        selector: '.contact h2',
        visible: true,
        settings: ['fontSize', 'color', 'fontFamily']
    },
    {
        id: 'map-section',
        name: 'Карта',
        icon: 'fa-map',
        category: 'Секции',
        selector: '.map-section',
        visible: true,
        settings: ['width', 'height', 'margin', 'order']
    },
    {
        id: 'map-title',
        name: 'Заголовок карты',
        icon: 'fa-heading',
        category: 'Карта',
        selector: '.map-section h2',
        visible: true,
        settings: ['fontSize', 'color', 'fontFamily']
    },
    {
        id: 'left-panel',
        name: 'Левая панель',
        icon: 'fa-sidebar',
        category: 'Макет',
        selector: '.left-panel',
        visible: true,
        settings: ['width', 'padding', 'background']
    },
    {
        id: 'right-panel',
        name: 'Правая панель',
        icon: 'fa-table-columns',
        category: 'Макет',
        selector: '.right-panel',
        visible: true,
        settings: ['width', 'padding', 'background']
    }
];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadElementsList();
    setupIframeListener();
});

// Настройка слушателя iframe
function setupIframeListener() {
    const iframe = document.getElementById('preview-frame');
    
    iframe.addEventListener('load', () => {
        // Применяем порядок элементов после загрузки
        applyElementOrder();
        
        // Добавляем подсветку элементов при наведении
        const iframeDoc = iframe.contentDocument;
        siteElements.forEach(element => {
            const el = iframeDoc.querySelector(element.selector);
            if (el) {
                el.style.cursor = 'pointer';
                el.style.transition = 'outline 0.2s';
                
                el.addEventListener('mouseover', () => {
                    el.style.outline = '2px solid #007bff';
                });
                
                el.addEventListener('mouseout', () => {
                    el.style.outline = 'none';
                });
                
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    selectElement(element.id);
                });
            }
        });
    });
}

// Загрузка списка элементов
function loadElementsList() {
    const container = document.getElementById('elements-list');
    const categories = [...new Set(siteElements.map(el => el.category))];
    
    container.innerHTML = '';
    
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'element-category';
        
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);
        
        let categoryElements = siteElements.filter(el => el.category === category);
        
        // Сортируем элементы по порядку для текущего устройства
        const order = data.elementOrder[currentDevice] || {};
        categoryElements.sort((a, b) => {
            const orderA = order[a.id] || 0;
            const orderB = order[b.id] || 0;
            return orderA - orderB;
        });
        
        categoryElements.forEach(element => {
            const elementDiv = document.createElement('div');
            elementDiv.className = 'element-item';
            elementDiv.id = `element-${element.id}`;
            elementDiv.draggable = true;
            elementDiv.dataset.elementId = element.id;
            
            const currentOrder = order[element.id] || 0;
            
            elementDiv.innerHTML = `
                <div class="element-header">
                    <div class="element-name">
                        <span class="drag-handle" title="Перетащить">
                            <i class="fas fa-grip-vertical"></i>
                        </span>
                        <i class="fas ${element.icon}"></i>
                        ${element.name}
                        ${currentOrder !== 0 ? `<span class="element-order-badge">${currentOrder}</span>` : ''}
                    </div>
                    <div class="element-controls">
                        <button class="element-btn btn-move-up" onclick="moveElement('${element.id}', 'up')" title="Вверх">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="element-btn btn-move-down" onclick="moveElement('${element.id}', 'down')" title="Вниз">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button class="element-btn ${element.visible ? 'btn-visible' : 'btn-hidden'}" 
                                onclick="toggleVisibility('${element.id}')" 
                                title="${element.visible ? 'Скрыть' : 'Показать'}">
                            <i class="fas ${element.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                        </button>
                        <button class="element-btn btn-edit" onclick="selectElement('${element.id}')" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
                <div class="element-settings" id="settings-${element.id}">
                    ${generateSettings(element)}
                </div>
            `;
            
            // Добавляем обработчики drag and drop
            elementDiv.addEventListener('dragstart', handleDragStart);
            elementDiv.addEventListener('dragover', handleDragOver);
            elementDiv.addEventListener('drop', handleDrop);
            elementDiv.addEventListener('dragend', handleDragEnd);
            
            categoryDiv.appendChild(elementDiv);
        });
        
        container.appendChild(categoryDiv);
    });
}

// Генерация настроек для элемента
function generateSettings(element) {
    let html = '';
    
    if (element.settings.includes('fontSize')) {
        html += `
            <div class="setting-group">
                <label class="setting-label">Размер шрифта (px)</label>
                <input type="range" class="setting-range" min="12" max="72" value="16" 
                       onchange="updateElementStyle('${element.id}', 'fontSize', this.value + 'px')">
            </div>
        `;
    }
    
    if (element.settings.includes('color')) {
        html += `
            <div class="setting-group">
                <label class="setting-label">Цвет</label>
                <input type="color" class="setting-input" value="#000000" 
                       onchange="updateElementStyle('${element.id}', 'color', this.value)">
            </div>
        `;
    }
    
    if (element.settings.includes('width')) {
        html += `
            <div class="setting-group">
                <label class="setting-label">Ширина (%)</label>
                <input type="range" class="setting-range" min="10" max="100" value="100" 
                       onchange="updateElementStyle('${element.id}', 'width', this.value + '%')">
            </div>
        `;
    }
    
    if (element.settings.includes('margin')) {
        html += `
            <div class="setting-group">
                <label class="setting-label">Отступ сверху (px)</label>
                <input type="range" class="setting-range" min="0" max="100" value="0" 
                       onchange="updateElementStyle('${element.id}', 'marginTop', this.value + 'px')">
            </div>
        `;
    }
    
    if (element.settings.includes('padding')) {
        html += `
            <div class="setting-group">
                <label class="setting-label">Внутренний отступ (px)</label>
                <input type="range" class="setting-range" min="0" max="100" value="20" 
                       onchange="updateElementStyle('${element.id}', 'padding', this.value + 'px')">
            </div>
        `;
    }
    
    if (element.settings.includes('order')) {
        html += `
            <div class="setting-group">
                <label class="setting-label">Порядок отображения</label>
                <input type="number" class="setting-input" min="0" max="10" value="0" 
                       onchange="updateElementStyle('${element.id}', 'order', this.value)">
            </div>
        `;
    }
    
    return html;
}

// Переключение видимости элемента
function toggleVisibility(elementId) {
    const element = siteElements.find(el => el.id === elementId);
    if (!element) return;
    
    element.visible = !element.visible;
    
    // Обновляем кнопку
    const btn = document.querySelector(`#element-${elementId} .btn-visible, #element-${elementId} .btn-hidden`);
    btn.className = `element-btn ${element.visible ? 'btn-visible' : 'btn-hidden'}`;
    btn.innerHTML = `<i class="fas ${element.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>`;
    btn.title = element.visible ? 'Скрыть' : 'Показать';
    
    // Применяем к iframe
    const iframe = document.getElementById('preview-iframe');
    if (iframe.contentWindow) {
        const targetElement = iframe.contentWindow.document.querySelector(element.selector);
        if (targetElement) {
            targetElement.style.display = element.visible ? '' : 'none';
        }
    }
}

// Выбор элемента для редактирования
function selectElement(elementId) {
    // Убираем выделение с предыдущего
    document.querySelectorAll('.element-item').forEach(el => el.classList.remove('selected'));
    
    // Выделяем текущий
    const elementDiv = document.getElementById(`element-${elementId}`);
    elementDiv.classList.add('selected');
    
    // Показываем настройки
    document.querySelectorAll('.element-settings').forEach(el => el.classList.remove('active'));
    document.getElementById(`settings-${elementId}`).classList.add('active');
    
    // Показываем правую панель свойств
    const propertiesPanel = document.getElementById('properties-panel');
    propertiesPanel.classList.add('active');
    
    // Обновляем информацию о выбранном элементе
    const element = siteElements.find(el => el.id === elementId);
    document.getElementById('selected-element').textContent = element.name;
    
    selectedElement = elementId;
    loadElementProperties(element);
}

// Загрузка расширенных свойств элемента
function loadElementProperties(element) {
    const content = document.getElementById('properties-content');
    
    content.innerHTML = `
        <div class="property-section">
            <div class="section-title">
                <i class="fas fa-info-circle"></i> Основное
            </div>
            <div class="setting-group">
                <label class="setting-label">Название элемента</label>
                <input type="text" class="setting-input" value="${element.name}" readonly>
            </div>
            <div class="setting-group">
                <label class="setting-label">CSS Селектор</label>
                <input type="text" class="setting-input" value="${element.selector}" readonly style="font-family: monospace;">
            </div>
        </div>
        
        <div class="property-section">
            <div class="section-title">
                <i class="fas fa-ruler"></i> Размеры
            </div>
            <div class="setting-group">
                <label class="setting-label">Ширина</label>
                <select class="setting-input" onchange="updateElementStyle('${element.id}', 'width', this.value)">
                    <option value="auto">Авто</option>
                    <option value="100%">100%</option>
                    <option value="80%">80%</option>
                    <option value="50%">50%</option>
                    <option value="300px">300px</option>
                    <option value="500px">500px</option>
                </select>
            </div>
            <div class="setting-group">
                <label class="setting-label">Высота</label>
                <select class="setting-input" onchange="updateElementStyle('${element.id}', 'height', this.value)">
                    <option value="auto">Авто</option>
                    <option value="100px">100px</option>
                    <option value="200px">200px</option>
                    <option value="300px">300px</option>
                    <option value="400px">400px</option>
                </select>
            </div>
        </div>
        
        <div class="property-section">
            <div class="section-title">
                <i class="fas fa-arrows-alt"></i> Отступы
            </div>
            <div class="setting-group">
                <label class="setting-label">Margin (внешний)</label>
                <input type="number" class="setting-input" placeholder="0" 
                       onchange="updateElementStyle('${element.id}', 'margin', this.value + 'px')">
            </div>
            <div class="setting-group">
                <label class="setting-label">Padding (внутренний)</label>
                <input type="number" class="setting-input" placeholder="0" 
                       onchange="updateElementStyle('${element.id}', 'padding', this.value + 'px')">
            </div>
        </div>
        
        <div class="property-section">
            <div class="section-title">
                <i class="fas fa-layer-group"></i> Позиция
            </div>
            <div class="setting-group">
                <label class="setting-label">Порядок (Z-Index)</label>
                <input type="number" class="setting-input" value="0" 
                       onchange="updateElementStyle('${element.id}', 'zIndex', this.value)">
            </div>
            <div class="setting-group">
                <label class="setting-label">Выравнивание</label>
                <select class="setting-input" onchange="updateElementStyle('${element.id}', 'textAlign', this.value)">
                    <option value="left">Слева</option>
                    <option value="center">По центру</option>
                    <option value="right">Справа</option>
                </select>
            </div>
        </div>
    `;
}

// Обновление стиля элемента
function updateElementStyle(elementId, property, value) {
    const element = siteElements.find(el => el.id === elementId);
    if (!element) return;
    
    const iframe = document.getElementById('preview-iframe');
    if (iframe.contentWindow) {
        const targetElement = iframe.contentWindow.document.querySelector(element.selector);
        if (targetElement) {
            targetElement.style[property] = value;
        }
    }
}

// Переключение устройства
function switchDevice(device) {
    currentDevice = device;
    
    // Обновляем кнопки
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-device="${device}"]`).classList.add('active');
    
    // Изменяем размер превью
    const container = document.getElementById('preview-container');
    container.className = 'preview-container';
    
    let width, height, deviceName;
    switch(device) {
        case 'mobile':
            container.classList.add('mobile');
            width = '375px';
            height = '667px';
            deviceName = 'Mobile';
            break;
        case 'tablet':
            container.classList.add('tablet');
            width = '768px';
            height = '1024px';
            deviceName = 'Tablet';
            break;
        default:
            width = '1400px';
            height = '800px';
            deviceName = 'Desktop';
    }
    
    document.getElementById('preview-size').textContent = `${width} × ${height}`;
    document.getElementById('reorder-mode').textContent = deviceName;
    
    // Перезагружаем список элементов с учетом нового порядка
    loadElementsList();
    
    // Применяем порядок к iframe
    applyElementOrder();
}

// Переключение режима
function switchMode(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Обновляем список элементов в зависимости от режима
    loadElementsList();
}

// Настройка прослушивателя iframe
function setupIframeListener() {
    const iframe = document.getElementById('preview-iframe');
    
    iframe.onload = () => {
        // Добавляем обработчики кликов на элементы в iframe
        const iframeDoc = iframe.contentWindow.document;
        
        siteElements.forEach(element => {
            const el = iframeDoc.querySelector(element.selector);
            if (el) {
                el.style.cursor = 'pointer';
                el.style.transition = 'all 0.3s';
                
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectElement(element.id);
                });
                
                el.addEventListener('mouseenter', () => {
                    el.style.outline = '2px dashed #667eea';
                });
                
                el.addEventListener('mouseleave', () => {
                    el.style.outline = 'none';
                });
            }
        });
    };
}

// Сохранение изменений
function saveChanges() {
    const loader = document.getElementById('loader');
    loader.classList.add('active');
    
    // Собираем все стили элементов
    const styles = {};
    const iframe = document.getElementById('preview-iframe');
    
    siteElements.forEach(element => {
        if (iframe.contentWindow) {
            const targetElement = iframe.contentWindow.document.querySelector(element.selector);
            if (targetElement) {
                styles[element.id] = {
                    visible: element.visible,
                    style: targetElement.style.cssText
                };
            }
        }
    });
    
    // Сохраняем в localStorage
    data.visualEditorStyles = styles;
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    
    setTimeout(() => {
        loader.classList.remove('active');
        alert('✓ Изменения сохранены!');
    }, 1000);
}

// Превью сайта
function previewSite() {
    window.open('index.html', '_blank');
}

// Возврат в админку
function goBack() {
    window.location.href = 'admin.html';
}

// Функция перемещения элемента вверх/вниз
function moveElement(elementId, direction) {
    const order = data.elementOrder[currentDevice];
    const elementIds = siteElements.map(el => el.id);
    
    // Если порядка нет, создаем дефолтный
    if (!order || Object.keys(order).length === 0) {
        elementIds.forEach((id, index) => {
            order[id] = index;
        });
    }
    
    // Сортируем элементы по текущему порядку
    const sortedElements = elementIds.sort((a, b) => 
        (order[a] !== undefined ? order[a] : 999) - (order[b] !== undefined ? order[b] : 999)
    );
    
    const currentIndex = sortedElements.indexOf(elementId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Проверяем границы
    if (newIndex < 0 || newIndex >= sortedElements.length) return;
    
    // Меняем местами
    const temp = sortedElements[currentIndex];
    sortedElements[currentIndex] = sortedElements[newIndex];
    sortedElements[newIndex] = temp;
    
    // Обновляем порядок
    sortedElements.forEach((id, index) => {
        order[id] = index;
    });
    
    data.elementOrder[currentDevice] = order;
    saveSiteData();
    
    // Обновляем UI
    loadElementsList();
    applyElementOrder();
}

// Drag and Drop обработчики
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.target.closest('.element-item');
    draggedElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedElement.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    const target = e.target.closest('.element-item');
    if (target && target !== draggedElement) {
        const list = document.getElementById('elements-list');
        const allItems = Array.from(list.querySelectorAll('.element-item'));
        const draggedIndex = allItems.indexOf(draggedElement);
        const targetIndex = allItems.indexOf(target);
        
        if (draggedIndex < targetIndex) {
            target.parentNode.insertBefore(draggedElement, target.nextSibling);
        } else {
            target.parentNode.insertBefore(draggedElement, target);
        }
    }
    
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    // Получаем новый порядок из DOM
    const list = document.getElementById('elements-list');
    const items = list.querySelectorAll('.element-item');
    const order = data.elementOrder[currentDevice] || {};
    
    items.forEach((item, index) => {
        const elementId = item.dataset.element;
        order[elementId] = index;
    });
    
    data.elementOrder[currentDevice] = order;
    saveSiteData();
    
    // Обновляем UI с новыми номерами
    loadElementsList();
    applyElementOrder();
    
    return false;
}

function handleDragEnd(e) {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
    }
    
    // Убираем все визуальные эффекты
    document.querySelectorAll('.element-item').forEach(item => {
        item.classList.remove('over');
    });
}

// Применение порядка элементов в iframe
function applyElementOrder() {
    const iframe = document.getElementById('preview-frame');
    if (!iframe || !iframe.contentDocument) return;
    
    const order = data.elementOrder[currentDevice] || {};
    
    // Применяем CSS order к элементам
    siteElements.forEach(element => {
        const el = iframe.contentDocument.querySelector(element.selector);
        if (el && order[element.id] !== undefined) {
            el.style.order = order[element.id];
        }
    });
    
    // Делаем контейнер flexbox, если еще не сделали
    const main = iframe.contentDocument.querySelector('main');
    if (main) {
        main.style.display = 'flex';
        main.style.flexDirection = 'column';
    }
}

