// НОВАЯ ВЕРСИЯ АДМИНКИ - ЧИСТАЯ ЛОГИКА

const DATA_KEY = 'sewingData';
const ADMIN_KEY = 'admin_auth';

// Проверка авторизации
function checkAuth() {
    const auth = sessionStorage.getItem(ADMIN_KEY);
    if (!auth) {
        const password = prompt('Пароль админа:');
        if (password === 'admin123') {
            sessionStorage.setItem(ADMIN_KEY, 'true');
        } else {
            alert('Неверный пароль!');
            window.location.href = 'index.html';
            return false;
        }
    }
    return true;
}

// Загрузка данных
let data = JSON.parse(localStorage.getItem(DATA_KEY) || '{"services":[],"contact":{},"categories":[],"gallery":[],"location":{}}');

// Убедимся что все массивы существуют
if (!data.services) data.services = [];
if (!data.contact) data.contact = {};
if (!data.categories) data.categories = [];
if (!data.gallery) data.gallery = [];
if (!data.location) data.location = { lat: 56.9496, lng: 24.1052 };

console.log('🔧 Admin: Загружено услуг:', data.services.length);

// Сохранение данных
function saveData() {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(DATA_KEY, jsonData);
    console.log('💾 СОХРАНЕНИЕ В localStorage:');
    console.log('   Ключ:', DATA_KEY);
    console.log('   Услуг:', data.services?.length || 0);
    console.log('   Размер данных:', jsonData.length, 'символов');
}

// Перезагрузка данных из localStorage
function reloadDataFromStorage() {
    let stored = localStorage.getItem(DATA_KEY);
    
    // Если sewingData не существует, попробуем мигрировать из старых ключей
    if (!stored) {
        console.log('⚠️ sewingData не найден, миграция из старых ключей...');
        const oldData = {
            services: JSON.parse(localStorage.getItem('services') || '[]'),
            contact: JSON.parse(localStorage.getItem('contact') || '{}'),
            categories: JSON.parse(localStorage.getItem('categories') || '[]'),
            gallery: JSON.parse(localStorage.getItem('gallery') || '[]'),
            location: JSON.parse(localStorage.getItem('location') || '{"lat":56.9496,"lng":24.1052}')
        };
        
        // Сохраняем в новый формат
        localStorage.setItem(DATA_KEY, JSON.stringify(oldData));
        stored = JSON.stringify(oldData);
        
        alert(`✓ Миграция выполнена!\n\nПеренесено из старого формата:\nУслуг: ${oldData.services.length}\nКатегорий: ${oldData.categories.length}\nФото: ${oldData.gallery.length}`);
    }
    
    if (stored) {
        data = JSON.parse(stored);
        console.log('✓ Данные перезагружены:', data.services?.length || 0, 'услуг');
        alert(`✓ Данные загружены!\n\nУслуг: ${data.services?.length || 0}\nКатегорий: ${data.categories?.length || 0}`);
        loadServices();
    } else {
        alert('❌ Нет данных для загрузки!');
    }
}

// Вкладки
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'services') loadServices();
    if (tabName === 'contact') loadContactForm();
    if (tabName === 'categories') loadCategories();
    if (tabName === 'gallery') loadGallery();
    if (tabName === 'location') loadLocationForm();
    if (tabName === 'settings') loadSettings();
}

// УСЛУГИ
function loadServices() {
    const list = document.getElementById('services-list');
    list.innerHTML = '';
    
    // Debug информация
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = 'background: #f0f0f0; padding: 15px; margin-bottom: 15px; border-radius: 8px;';
    debugDiv.innerHTML = `
        <strong>DEBUG INFO:</strong><br>
        Услуг в переменной data.services: ${data.services ? data.services.length : 'undefined'}<br>
        localStorage sewingData существует: ${localStorage.getItem(DATA_KEY) ? 'ДА' : 'НЕТ'}<br>
        <button onclick="reloadDataFromStorage()" style="margin-top:10px;padding:8px 15px;background:#27ae60;color:white;border:none;border-radius:5px;cursor:pointer;">🔄 Перезагрузить из localStorage</button>
        <button onclick="location.reload()" style="margin-top:10px;margin-left:10px;padding:8px 15px;">Обновить страницу</button>
    `;
    list.appendChild(debugDiv);
    
    if (!data.services || data.services.length === 0) {
        list.innerHTML += '<p style="text-align:center;color:#666;padding:20px;">Нет услуг в базе данных</p>';
        return;
    }
    
    data.services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-content">
                <h3>
                    <span class="item-language">LV</span> ${service.title.lv}<br>
                    <span class="item-language">RU</span> ${service.title.ru}
                </h3>
                <p><strong>LV:</strong> ${service.description.lv}</p>
                <p><strong>RU:</strong> ${service.description.ru}</p>
                <div class="item-price">
                    <span class="item-language">LV</span> ${service.price.lv}
                    <span class="item-language">RU</span> ${service.price.ru}
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editService(${service.id})">Изменить</button>
                <button class="btn-delete" onclick="deleteService(${service.id})">Удалить</button>
            </div>
        `;
        list.appendChild(card);
    });
}

function showAddServiceForm() {
    document.getElementById('add-service-form').style.display = 'block';
}

function hideAddServiceForm() {
    const form = document.getElementById('add-service-form');
    form.style.display = 'none';
    form.querySelector('form').reset();
    delete form.dataset.editingId;
    form.querySelector('h3').textContent = 'Добавить новую услугу';
    form.querySelector('button[type="submit"]').textContent = 'Добавить';
}

function addService(event) {
    event.preventDefault();
    
    const form = document.getElementById('add-service-form');
    const editingId = form.dataset.editingId;
    
    if (editingId) {
        // Редактирование
        const service = data.services.find(s => s.id == editingId);
        if (service) {
            service.title.lv = document.getElementById('service-title-lv').value;
            service.title.ru = document.getElementById('service-title-ru').value;
            service.description.lv = document.getElementById('service-desc-lv').value;
            service.description.ru = document.getElementById('service-desc-ru').value;
            service.price.lv = document.getElementById('service-price-lv').value;
            service.price.ru = document.getElementById('service-price-ru').value;
            alert('✓ Услуга обновлена!');
        }
    } else {
        // Добавление
        const newService = {
            id: Date.now(),
            title: {
                lv: document.getElementById('service-title-lv').value,
                ru: document.getElementById('service-title-ru').value
            },
            description: {
                lv: document.getElementById('service-desc-lv').value,
                ru: document.getElementById('service-desc-ru').value
            },
            price: {
                lv: document.getElementById('service-price-lv').value,
                ru: document.getElementById('service-price-ru').value
            }
        };
        data.services.push(newService);
        alert('✓ Услуга добавлена!');
    }
    
    saveData();
    hideAddServiceForm();
    loadServices();
}

function editService(id) {
    const service = data.services.find(s => s.id === id);
    if (!service) return;
    
    document.getElementById('service-title-lv').value = service.title.lv;
    document.getElementById('service-title-ru').value = service.title.ru;
    document.getElementById('service-desc-lv').value = service.description.lv;
    document.getElementById('service-desc-ru').value = service.description.ru;
    document.getElementById('service-price-lv').value = service.price.lv;
    document.getElementById('service-price-ru').value = service.price.ru;
    
    const form = document.getElementById('add-service-form');
    form.style.display = 'block';
    form.querySelector('h3').textContent = 'Изменить услугу';
    form.dataset.editingId = id;
    form.querySelector('button[type="submit"]').textContent = 'Сохранить';
}

function deleteService(id) {
    if (confirm('Удалить услугу?')) {
        data.services = data.services.filter(s => s.id !== id);
        saveData();
        loadServices();
        alert('✓ Услуга удалена!');
    }
}

// КОНТАКТЫ
function loadContactForm() {
    if (!data.contact) {
        data.contact = {
            phone: '',
            email: '',
            address: { lv: '', ru: '' },
            hours: { lv: '', ru: '' },
            socials: { facebook: '', instagram: '', whatsapp: '' },
            qrCode: ''
        };
    }
    
    document.getElementById('contact-phone').value = data.contact.phone || '';
    document.getElementById('contact-email').value = data.contact.email || '';
    document.getElementById('contact-address-lv').value = data.contact.address?.lv || '';
    document.getElementById('contact-address-ru').value = data.contact.address?.ru || '';
    document.getElementById('contact-hours-lv').value = data.contact.hours?.lv || '';
    document.getElementById('contact-hours-ru').value = data.contact.hours?.ru || '';
    document.getElementById('contact-facebook').value = data.contact.socials?.facebook || '';
    document.getElementById('contact-instagram').value = data.contact.socials?.instagram || '';
    document.getElementById('contact-whatsapp').value = data.contact.socials?.whatsapp || '';
    document.getElementById('contact-qrcode').value = data.contact.qrCode || '';
}

function updateContact() {
    data.contact = {
        phone: document.getElementById('contact-phone').value,
        email: document.getElementById('contact-email').value,
        address: {
            lv: document.getElementById('contact-address-lv').value,
            ru: document.getElementById('contact-address-ru').value
        },
        hours: {
            lv: document.getElementById('contact-hours-lv').value,
            ru: document.getElementById('contact-hours-ru').value
        },
        socials: {
            facebook: document.getElementById('contact-facebook').value,
            instagram: document.getElementById('contact-instagram').value,
            whatsapp: document.getElementById('contact-whatsapp').value
        },
        qrCode: document.getElementById('contact-qrcode').value
    };
    
    saveData();
    alert('✓ Контакты обновлены!');
}

// КАТЕГОРИИ
function loadCategories() {
    const list = document.getElementById('categories-list');
    list.innerHTML = '';
    
    if (!data.categories || data.categories.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#666;">Нет категорий</p>';
        return;
    }
    
    data.categories.forEach(category => {
        const photosCount = (data.gallery || []).filter(item => item.categoryId === category.id).length;
        
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-content">
                <h3>
                    <span style="font-size:1.5rem;margin-right:10px;">${category.icon}</span>
                    <span class="item-language">LV</span> ${category.name.lv}<br>
                    <span style="margin-left:40px;"></span><span class="item-language">RU</span> ${category.name.ru}
                </h3>
                <p><strong>Фотографий:</strong> ${photosCount}</p>
                <img src="${category.coverImage}" style="width:150px;height:150px;object-fit:cover;border-radius:10px;">
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editCategory(${category.id})">Изменить</button>
                <button class="btn-delete" onclick="deleteCategory(${category.id})">Удалить</button>
            </div>
        `;
        list.appendChild(card);
    });
}

function showAddCategoryForm() {
    document.getElementById('add-category-form').style.display = 'block';
    // Сбрасываем и обновляем превью
    setTimeout(() => {
        document.getElementById('category-font-size').value = '24';
        document.getElementById('category-font-weight').value = '700';
        document.getElementById('category-text-color').value = '#ffffff';
        document.getElementById('category-text-shadow').value = 'medium';
        updateCategoryPreview();
    }, 100);
}

function hideAddCategoryForm() {
    const form = document.getElementById('add-category-form');
    form.style.display = 'none';
    form.querySelector('form').reset();
    delete form.dataset.editingId;
    form.querySelector('h3').textContent = 'Добавить категорию';
    form.querySelector('button[type="submit"]').textContent = 'Добавить';
}

function addCategory(event) {
    event.preventDefault();
    
    const form = document.getElementById('add-category-form');
    const editingId = form.dataset.editingId;
    
    const categoryData = {
        name: {
            lv: document.getElementById('category-name-lv').value,
            ru: document.getElementById('category-name-ru').value
        },
        coverImage: document.getElementById('category-cover').value,
        styles: {
            fontSize: document.getElementById('category-font-size').value || '24',
            fontWeight: document.getElementById('category-font-weight').value || '700',
            textColor: document.getElementById('category-text-color').value || '#ffffff',
            textShadow: document.getElementById('category-text-shadow').value || 'medium'
        }
    };
    
    if (editingId) {
        const category = data.categories.find(c => c.id == editingId);
        if (category) {
            Object.assign(category, categoryData);
            alert('✓ Категория обновлена!');
        }
    } else {
        const newCategory = {
            id: Date.now(),
            ...categoryData
        };
        if (!data.categories) data.categories = [];
        data.categories.push(newCategory);
        alert('✓ Категория добавлена!');
    }
    
    saveData();
    hideAddCategoryForm();
    loadCategories();
}

function editCategory(id) {
    const category = data.categories.find(c => c.id === id);
    if (!category) return;
    
    document.getElementById('category-name-lv').value = category.name.lv;
    document.getElementById('category-name-ru').value = category.name.ru;
    document.getElementById('category-cover').value = category.coverImage;
    
    // Загружаем настройки стилей если они есть
    if (category.styles) {
        document.getElementById('category-font-size').value = category.styles.fontSize || '24';
        document.getElementById('category-font-weight').value = category.styles.fontWeight || '700';
        document.getElementById('category-text-color').value = category.styles.textColor || '#ffffff';
        document.getElementById('category-text-shadow').value = category.styles.textShadow || 'medium';
    }
    
    const form = document.getElementById('add-category-form');
    form.style.display = 'block';
    form.querySelector('h3').textContent = 'Изменить категорию';
    form.dataset.editingId = id;
    form.querySelector('button[type="submit"]').textContent = 'Сохранить';
    
    // Обновляем предпросмотр
    updateCategoryPreview();
}

// Live preview для стилей категории
function updateCategoryPreview() {
    const preview = document.getElementById('category-preview');
    if (!preview) return;
    
    const nameLv = document.getElementById('category-name-lv').value || 'Название категории';
    const nameRu = document.getElementById('category-name-ru').value || 'Название категории';
    const fontSize = document.getElementById('category-font-size').value || '24';
    const fontWeight = document.getElementById('category-font-weight').value || '700';
    const textColor = document.getElementById('category-text-color').value || '#ffffff';
    const textShadow = document.getElementById('category-text-shadow').value || 'medium';
    
    // Обновляем значение размера шрифта
    const fontSizeValueSpan = document.getElementById('font-size-value');
    if (fontSizeValueSpan) {
        fontSizeValueSpan.textContent = fontSize;
    }
    
    // Получаем тень
    const shadows = {
        'none': 'none',
        'light': '0 1px 3px rgba(0,0,0,0.3)',
        'medium': '0 2px 8px rgba(0,0,0,0.5)',
        'strong': '0 4px 12px rgba(0,0,0,0.8)'
    };
    
    // Применяем стили к превью
    preview.style.fontSize = fontSize + 'px';
    preview.style.fontWeight = fontWeight;
    preview.style.color = textColor;
    preview.style.textShadow = shadows[textShadow];
    preview.textContent = `${nameLv} / ${nameRu}`;
}

function deleteCategory(id) {
    if (confirm('Удалить категорию?')) {
        data.categories = data.categories.filter(c => c.id !== id);
        saveData();
        loadCategories();
        alert('✓ Категория удалена!');
    }
}

// ГАЛЕРЕЯ
function loadGallery() {
    const list = document.getElementById('gallery-list');
    list.innerHTML = '';
    
    // Заполняем селект категориями
    const categorySelect = document.getElementById('gallery-category');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
        data.categories.forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat.id}">${cat.name.ru} / ${cat.name.lv}</option>`;
        });
    }
    
    if (!data.gallery || data.gallery.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#666;padding:20px;">Нет фото в галерее</p>';
        return;
    }
    
    // Группируем по категориям
    const grouped = {};
    data.gallery.forEach(item => {
        if (!grouped[item.categoryId]) {
            grouped[item.categoryId] = [];
        }
        grouped[item.categoryId].push(item);
    });
    
    // Отображаем по категориям
    Object.keys(grouped).forEach(categoryId => {
        const category = data.categories.find(c => c.id == categoryId);
        const categoryName = category ? `${category.name.ru} / ${category.name.lv}` : 'Без категории';
        
        const categorySection = document.createElement('div');
        categorySection.style.marginBottom = '30px';
        categorySection.innerHTML = `<h3 style="color: var(--primary); margin-bottom: 15px;">${categoryName}</h3>`;
        
        const grid = document.createElement('div');
        grid.className = 'gallery-grid';
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;';
        
        grouped[categoryId].forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.style.padding = '10px';
            card.innerHTML = `
                <img src="${item.url}" alt="${item.title.ru}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                <h4 style="margin: 5px 0; font-size: 14px;">
                    <span class="item-language">LV</span> ${item.title.lv}<br>
                    <span class="item-language">RU</span> ${item.title.ru}
                </h4>
                <p style="font-size: 12px; color: #666; margin: 5px 0;">
                    <strong>LV:</strong> ${item.description.lv}<br>
                    <strong>RU:</strong> ${item.description.ru}
                </p>
                <div class="item-actions" style="margin-top: 10px;">
                    <button class="btn-edit" onclick="editGalleryItem(${item.id})">Изменить</button>
                    <button class="btn-delete" onclick="deleteGalleryItem(${item.id})">Удалить</button>
                </div>
            `;
            grid.appendChild(card);
        });
        
        categorySection.appendChild(grid);
        list.appendChild(categorySection);
    });
}

function showAddGalleryForm() {
    document.getElementById('add-gallery-form').style.display = 'block';
    // Обновляем список категорий
    loadGallery();
}

function hideAddGalleryForm() {
    const form = document.getElementById('add-gallery-form');
    form.style.display = 'none';
    form.querySelector('form').reset();
    delete form.dataset.editingId;
    form.querySelector('h3').textContent = 'Добавить новое фото';
    form.querySelector('button[type="submit"]').textContent = 'Добавить';
}

function addGalleryItem(event) {
    event.preventDefault();
    
    const form = document.getElementById('add-gallery-form');
    const editingId = form.dataset.editingId;
    
    if (editingId) {
        const item = data.gallery.find(g => g.id == editingId);
        if (item) {
            item.categoryId = parseInt(document.getElementById('gallery-category').value);
            item.url = document.getElementById('gallery-url').value;
            item.title.lv = document.getElementById('gallery-title-lv').value;
            item.title.ru = document.getElementById('gallery-title-ru').value;
            item.description.lv = document.getElementById('gallery-desc-lv').value;
            item.description.ru = document.getElementById('gallery-desc-ru').value;
            alert('✓ Фото обновлено!');
        }
    } else {
        const newItem = {
            id: Date.now(),
            categoryId: parseInt(document.getElementById('gallery-category').value),
            url: document.getElementById('gallery-url').value,
            title: {
                lv: document.getElementById('gallery-title-lv').value,
                ru: document.getElementById('gallery-title-ru').value
            },
            description: {
                lv: document.getElementById('gallery-desc-lv').value,
                ru: document.getElementById('gallery-desc-ru').value
            }
        };
        
        if (!data.gallery) data.gallery = [];
        data.gallery.push(newItem);
        alert('✓ Фото добавлено!');
    }
    
    saveData();
    hideAddGalleryForm();
    loadGallery();
}

function editGalleryItem(id) {
    const item = data.gallery.find(g => g.id === id);
    if (!item) return;
    
    document.getElementById('gallery-category').value = item.categoryId;
    document.getElementById('gallery-url').value = item.url;
    document.getElementById('gallery-title-lv').value = item.title.lv;
    document.getElementById('gallery-title-ru').value = item.title.ru;
    document.getElementById('gallery-desc-lv').value = item.description.lv;
    document.getElementById('gallery-desc-ru').value = item.description.ru;
    
    const form = document.getElementById('add-gallery-form');
    form.style.display = 'block';
    form.querySelector('h3').textContent = 'Изменить фото';
    form.dataset.editingId = id;
    form.querySelector('button[type="submit"]').textContent = 'Сохранить';
}

function deleteGalleryItem(id) {
    if (confirm('Удалить фото?')) {
        data.gallery = data.gallery.filter(g => g.id !== id);
        saveData();
        loadGallery();
        alert('✓ Фото удалено!');
    }
}

// ЛОКАЦИЯ
let adminMap = null;
let adminMarker = null;

function loadLocationForm() {
    // Перезагружаем данные из localStorage чтобы получить актуальные координаты
    const stored = localStorage.getItem(DATA_KEY);
    if (stored) {
        const freshData = JSON.parse(stored);
        if (freshData.location) {
            data.location = freshData.location;
        }
    }
    
    if (!data.location) {
        data.location = { lat: 56.9496, lng: 24.1052 };
    }
    
    console.log('📍 Загрузка формы локации:', data.location);
    
    document.getElementById('location-lat').value = data.location.lat;
    document.getElementById('location-lng').value = data.location.lng;
    
    // Инициализация карты
    setTimeout(() => {
        initAdminMap();
    }, 100);
}

function initAdminMap() {
    const mapContainer = document.getElementById('admin-map');
    if (!mapContainer) return;
    
    // Если карта уже создана, удаляем
    if (adminMap) {
        adminMap.remove();
    }
    
    const lat = data.location?.lat || 56.9496;
    const lng = data.location?.lng || 24.1052;
    
    // Создаем карту
    adminMap = L.map('admin-map').setView([lat, lng], 13);
    
    // Добавляем слой карты
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(adminMap);
    
    // Добавляем маркер
    adminMarker = L.marker([lat, lng], { draggable: true }).addTo(adminMap);
    
    // При перетаскивании маркера обновляем координаты
    adminMarker.on('dragend', function(e) {
        const position = adminMarker.getLatLng();
        document.getElementById('location-lat').value = position.lat.toFixed(6);
        document.getElementById('location-lng').value = position.lng.toFixed(6);
    });
    
    // При клике на карту перемещаем маркер
    adminMap.on('click', function(e) {
        const { lat, lng } = e.latlng;
        adminMarker.setLatLng([lat, lng]);
        document.getElementById('location-lat').value = lat.toFixed(6);
        document.getElementById('location-lng').value = lng.toFixed(6);
    });
}

function updateLocation(event) {
    event.preventDefault();
    
    const lat = parseFloat(document.getElementById('location-lat').value);
    const lng = parseFloat(document.getElementById('location-lng').value);
    
    console.log('📍 Сохранение местоположения:', { lat, lng });
    
    data.location = { lat, lng };
    
    saveData();
    
    // Проверяем что сохранилось
    const saved = JSON.parse(localStorage.getItem(DATA_KEY));
    console.log('✓ Проверка после сохранения:', saved.location);
    
    alert(`✓ Местоположение обновлено!\n\nШирота: ${lat}\nДолгота: ${lng}`);
}

// Выход
function logout() {
    if (confirm('Выйти?')) {
        sessionStorage.removeItem(ADMIN_KEY);
        window.location.href = 'index.html';
    }
}

// Просмотр сайта
function previewSite() {
    window.open('index.html', '_blank');
}

// Диагностика
function runDiagnostics() {
    const output = document.getElementById('debug-output');
    const stored = localStorage.getItem(DATA_KEY);
    
    let report = '🔍 ДИАГНОСТИКА СИСТЕМЫ\n';
    report += '='.repeat(50) + '\n\n';
    
    report += '📦 localStorage.sewingData:\n';
    if (stored) {
        const parsed = JSON.parse(stored);
        report += `✓ СУЩЕСТВУЕТ (${stored.length} символов)\n\n`;
        report += `📊 Структура данных:\n`;
        report += `  • Услуги: ${parsed.services?.length || 0} шт.\n`;
        report += `  • Категории: ${parsed.categories?.length || 0} шт.\n`;
        report += `  • Фото: ${parsed.gallery?.length || 0} шт.\n`;
        report += `  • Контакты: ${parsed.contact ? 'ЕСТЬ' : 'НЕТ'}\n`;
        report += `  • Местоположение: ${parsed.location ? 'ЕСТЬ' : 'НЕТ'}\n\n`;
        
        if (parsed.location) {
            report += `📍 Координаты:\n`;
            report += `  • Широта: ${parsed.location.lat}\n`;
            report += `  • Долгота: ${parsed.location.lng}\n\n`;
        }
        
        report += `\n📄 Полные данные:\n`;
        report += JSON.stringify(parsed, null, 2);
    } else {
        report += '❌ НЕТ ДАННЫХ\n';
    }
    
    output.textContent = report;
}

function forceLoadDemo() {
    if (!confirm('Загрузить демо-данные? Текущие данные будут заменены!')) return;
    
    const demoData = {
        services: [
            {
                id: 1,
                title: { lv: "Apģērbu šūšana", ru: "Пошив одежды" },
                description: { lv: "Individuāla apģērbu šūšana", ru: "Индивидуальный пошив одежды" },
                price: { lv: "No 50€", ru: "От 50€" }
            }
        ],
        contact: {
            phone: "+371 12345678",
            email: "info@sewing.lv",
            address: { lv: "Rīga, Latvija", ru: "Рига, Латвия" },
            hours: { lv: "P-Pt: 9:00-18:00", ru: "Пн-Пт: 9:00-18:00" }
        },
        categories: [],
        gallery: [],
        location: { lat: 56.9496, lng: 24.1052 }
    };
    
    localStorage.setItem(DATA_KEY, JSON.stringify(demoData));
    data = demoData;
    alert('✓ Демо-данные загружены!');
    location.reload();
}

function resetData() {
    if (confirm('Сбросить все данные и загрузить демо-версию?')) {
        forceLoadDemo();
    }
}

// ЛОГОТИП
function uploadLogo(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('❌ Пожалуйста, выберите файл изображения');
        return;
    }
    
    // Проверка размера файла (максимум 5MB для исходного)
    if (file.size > 5 * 1024 * 1024) {
        alert('❌ Файл слишком большой. Максимальный размер: 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Оптимальный размер для логотипа - 400px по ширине
            const maxWidth = 400;
            const maxHeight = 300;
            
            let width = img.width;
            let height = img.height;
            
            // Вычисляем новые размеры с сохранением пропорций
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
            
            // Создаем canvas для изменения размера
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Конвертируем в base64 с оптимальным качеством
            const logoData = canvas.toDataURL('image/jpeg', 0.85);
            
            data.logo = logoData;
            saveData();
            
            // Обновляем превью
            const previewImg = document.getElementById('preview-logo');
            const noLogoText = document.getElementById('no-logo-text');
            previewImg.src = logoData;
            previewImg.style.display = 'block';
            noLogoText.style.display = 'none';
            
            const originalSize = (file.size / 1024).toFixed(1);
            const optimizedSize = (logoData.length * 0.75 / 1024).toFixed(1); // примерный размер base64
            
            alert(`✓ Логотип загружен!\n📐 Размер: ${Math.round(width)}×${Math.round(height)}px\n📦 Исходный размер: ${originalSize}KB\n✨ Оптимизировано: ${optimizedSize}KB`);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function removeLogo() {
    if (confirm('Удалить пользовательский логотип и вернуться к дефолтному?')) {
        delete data.logo;
        saveData();
        
        const previewImg = document.getElementById('preview-logo');
        const noLogoText = document.getElementById('no-logo-text');
        
        // Показываем дефолтный логотип
        previewImg.src = 'logo-ulla.jpg';
        previewImg.style.display = 'block';
        noLogoText.textContent = 'Используется дефолтный логотип';
        noLogoText.style.display = 'block';
        noLogoText.style.color = '#3498db';
        
        document.getElementById('logo-input').value = '';
        alert('✓ Пользовательский логотип удален. Восстановлен дефолтный логотип.');
    }
}

function loadSettings() {
    const previewImg = document.getElementById('preview-logo');
    const noLogoText = document.getElementById('no-logo-text');
    
    if (data.logo) {
        // Показываем пользовательский логотип
        previewImg.src = data.logo;
        previewImg.style.display = 'block';
        noLogoText.style.display = 'none';
    } else {
        // Показываем дефолтный логотип
        previewImg.src = 'logo-ulla.jpg';
        previewImg.style.display = 'block';
        noLogoText.textContent = 'Используется дефолтный логотип';
        noLogoText.style.display = 'block';
        noLogoText.style.color = '#3498db';
    }
    
    // Загружаем настройку видимости услуг
    const showServices = data.settings?.showServices !== false; // по умолчанию true
    document.getElementById('show-services').checked = showServices;
    
    // Загружаем настройки текста на логотипе
    loadLogoTextSettings();
    
    // Загружаем стили услуг
    loadServicesStyle();
}

function toggleServicesVisibility() {
    const showServices = document.getElementById('show-services').checked;
    
    if (!data.settings) {
        data.settings = {};
    }
    data.settings.showServices = showServices;
    
    saveData();
    
    const status = showServices ? 'показаны' : 'скрыты';
    alert(`✓ Услуги теперь ${status} для посетителей`);
}

// ТЕКСТ НА ЛОГОТИПЕ
function toggleLogoText() {
    const isEnabled = document.getElementById('show-logo-text').checked;
    const settingsDiv = document.getElementById('logo-text-settings');
    settingsDiv.style.display = isEnabled ? 'block' : 'none';
    
    if (!data.logoText) {
        data.logoText = {
            enabled: isEnabled,
            text: 'ULLA',
            fontSize: 24,
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            align: 'center',
            vertical: 'middle',
            shadow: 'light'
        };
    } else {
        data.logoText.enabled = isEnabled;
    }
    
    saveData();
    updateLogoTextPreview();
}

function loadLogoTextSettings() {
    if (!data.logoText) {
        data.logoText = {
            enabled: false,
            text: 'ULLA',
            fontSize: 24,
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            align: 'center',
            vertical: 'middle',
            shadow: 'light'
        };
    }
    
    const settings = data.logoText;
    
    document.getElementById('show-logo-text').checked = settings.enabled;
    document.getElementById('logo-text-settings').style.display = settings.enabled ? 'block' : 'none';
    document.getElementById('logo-text-content').value = settings.text || '';
    document.getElementById('logo-text-size').value = settings.fontSize || 24;
    document.getElementById('text-size-value').textContent = (settings.fontSize || 24) + 'px';
    document.getElementById('logo-text-color').value = settings.color || '#ffffff';
    document.getElementById('logo-text-color-hex').value = settings.color || '#ffffff';
    document.getElementById('logo-text-font').value = settings.fontFamily || 'Arial, sans-serif';
    document.getElementById('logo-text-weight').value = settings.fontWeight || 'bold';
    document.getElementById('logo-text-align').value = settings.align || 'center';
    document.getElementById('logo-text-vertical').value = settings.vertical || 'middle';
    document.getElementById('logo-text-shadow').value = settings.shadow || 'light';
    
    updateLogoTextPreview();
}

function updateLogoTextPreview() {
    const previewImg = document.getElementById('preview-logo-with-text');
    const previewOverlay = document.getElementById('preview-text-overlay');
    
    // Используем текущий логотип
    const logoSrc = data.logo || 'logo-ulla.jpg';
    previewImg.src = logoSrc;
    
    const text = document.getElementById('logo-text-content').value;
    const fontSize = document.getElementById('logo-text-size').value;
    const color = document.getElementById('logo-text-color').value;
    const fontFamily = document.getElementById('logo-text-font').value;
    const fontWeight = document.getElementById('logo-text-weight').value;
    const align = document.getElementById('logo-text-align').value;
    const vertical = document.getElementById('logo-text-vertical').value;
    const shadow = document.getElementById('logo-text-shadow').value;
    
    // Обновляем hex поле
    document.getElementById('logo-text-color-hex').value = color;
    
    // Настройки тени
    let textShadow = 'none';
    if (shadow === 'light') {
        textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
    } else if (shadow === 'medium') {
        textShadow = '2px 2px 4px rgba(0,0,0,0.7)';
    } else if (shadow === 'strong') {
        textShadow = '3px 3px 6px rgba(0,0,0,0.9)';
    }
    
    // Настройки выравнивания
    let justifyContent = 'center';
    if (align === 'left') justifyContent = 'flex-start';
    else if (align === 'right') justifyContent = 'flex-end';
    
    let alignItems = 'center';
    if (vertical === 'top') alignItems = 'flex-start';
    else if (vertical === 'bottom') alignItems = 'flex-end';
    
    previewOverlay.style.justifyContent = justifyContent;
    previewOverlay.style.alignItems = alignItems;
    previewOverlay.innerHTML = `
        <span style="
            font-size: ${fontSize}px;
            color: ${color};
            font-family: ${fontFamily};
            font-weight: ${fontWeight};
            text-shadow: ${textShadow};
            padding: 10px;
            user-select: none;
        ">${text}</span>
    `;
}

function saveLogoTextSettings() {
    data.logoText = {
        enabled: document.getElementById('show-logo-text').checked,
        text: document.getElementById('logo-text-content').value,
        fontSize: parseInt(document.getElementById('logo-text-size').value),
        color: document.getElementById('logo-text-color').value,
        fontFamily: document.getElementById('logo-text-font').value,
        fontWeight: document.getElementById('logo-text-weight').value,
        align: document.getElementById('logo-text-align').value,
        vertical: document.getElementById('logo-text-vertical').value,
        shadow: document.getElementById('logo-text-shadow').value
    };
    
    saveData();
    alert('✓ Настройки текста на логотипе сохранены!');
}

// СТИЛИЗАЦИЯ УСЛУГ
function loadServicesStyle() {
    if (!data.servicesStyle) {
        data.servicesStyle = {
            titleSize: 28,
            titleFont: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            titleColor: '#2c3e50',
            titleWeight: 'bold',
            serviceTitleSize: 20,
            serviceTitleFont: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            serviceDescSize: 16,
            serviceDescFont: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            servicePriceSize: 18
        };
    }
    
    const style = data.servicesStyle;
    
    document.getElementById('services-title-size').value = style.titleSize || 28;
    document.getElementById('title-size-value').textContent = (style.titleSize || 28) + 'px';
    document.getElementById('services-title-font').value = style.titleFont || "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    document.getElementById('services-title-color').value = style.titleColor || '#2c3e50';
    document.getElementById('services-title-color-hex').value = style.titleColor || '#2c3e50';
    document.getElementById('services-title-weight').value = style.titleWeight || 'bold';
    
    document.getElementById('service-title-size').value = style.serviceTitleSize || 20;
    document.getElementById('service-title-size-value').textContent = (style.serviceTitleSize || 20) + 'px';
    document.getElementById('service-title-font').value = style.serviceTitleFont || "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    
    document.getElementById('service-desc-size').value = style.serviceDescSize || 16;
    document.getElementById('service-desc-size-value').textContent = (style.serviceDescSize || 16) + 'px';
    document.getElementById('service-desc-font').value = style.serviceDescFont || "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    
    document.getElementById('service-price-size').value = style.servicePriceSize || 18;
    document.getElementById('service-price-size-value').textContent = (style.servicePriceSize || 18) + 'px';
}

function updateServicesStylePreview() {
    // Обновляем hex поле для цвета заголовка
    const titleColor = document.getElementById('services-title-color').value;
    document.getElementById('services-title-color-hex').value = titleColor;
}

function saveServicesStyle() {
    data.servicesStyle = {
        titleSize: parseInt(document.getElementById('services-title-size').value),
        titleFont: document.getElementById('services-title-font').value,
        titleColor: document.getElementById('services-title-color').value,
        titleWeight: document.getElementById('services-title-weight').value,
        serviceTitleSize: parseInt(document.getElementById('service-title-size').value),
        serviceTitleFont: document.getElementById('service-title-font').value,
        serviceDescSize: parseInt(document.getElementById('service-desc-size').value),
        serviceDescFont: document.getElementById('service-desc-font').value,
        servicePriceSize: parseInt(document.getElementById('service-price-size').value)
    };
    
    saveData();
    alert('✓ Стили услуг сохранены! Обновите главную страницу, чтобы увидеть изменения.');
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    loadServices();
    loadSettings();
});
