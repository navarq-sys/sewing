// НОВАЯ ВЕРСИЯ - ЧИСТАЯ ЛОГИКА РАБОТЫ С ДАННЫМИ

// Ключ для хранения всех данных
const DATA_KEY = 'sewingData';
let currentLang = localStorage.getItem('language') || 'lv';

// Загрузка данных из localStorage
function loadAllData() {
    let stored = localStorage.getItem(DATA_KEY);
    console.log('🔍 loadAllData: sewingData =', stored ? 'ЕСТЬ' : 'НЕТ');
    
    // Если sewingData не существует, мигрируем из старых ключей
    if (!stored) {
        console.log('⚠️ Миграция из старых ключей в sewingData...');
        const oldData = {
            services: JSON.parse(localStorage.getItem('services') || 'null'),
            contact: JSON.parse(localStorage.getItem('contact') || 'null'),
            categories: JSON.parse(localStorage.getItem('categories') || 'null'),
            gallery: JSON.parse(localStorage.getItem('gallery') || 'null'),
            location: JSON.parse(localStorage.getItem('location') || 'null')
        };
        
        console.log('   Старые данные services:', oldData.services ? oldData.services.length + ' услуг' : 'НЕТ');
        
        // Если есть старые данные, используем их
        if (oldData.services) {
            localStorage.setItem(DATA_KEY, JSON.stringify(oldData));
            stored = JSON.stringify(oldData);
            console.log('✓ Мигрировано услуг:', oldData.services.length);
        }
    } else {
        const parsed = JSON.parse(stored);
        console.log('✓ Загружено из sewingData:', parsed.services ? parsed.services.length + ' услуг' : 'НЕТ услуг');
    }
    
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
        }
    }
    
    // Дефолтные данные только если ничего нет
    return {
        services: [
            {
                id: 1,
                title: { lv: "Apģērbu šūšana", ru: "Пошив одежды" },
                description: { lv: "Individuāla apģērbu šūšana", ru: "Индивидуальный пошив одежды" },
                price: { lv: "No 50€", ru: "От 50€" }
            },
            {
                id: 2,
                title: { lv: "Kāzu kleitu šūšana", ru: "Пошив свадебных платьев" },
                description: { lv: "Ekskluzīvu kāzu kleitu izgatavošana", ru: "Изготовление эксклюзивных свадебных платьев" },
                price: { lv: "No 300€", ru: "От 300€" }
            },
            {
                id: 3,
                title: { lv: "Apģērbu labošana", ru: "Ремонт одежды" },
                description: { lv: "Ātra un kvalitatīva apģērbu labošana", ru: "Быстрый и качественный ремонт одежды" },
                price: { lv: "No 10€", ru: "От 10€" }
            },
            {
                id: 4,
                title: { lv: "Aizkaru šūšana", ru: "Пошив штор" },
                description: { lv: "Aizkaru šūšana jebkuram interjeram", ru: "Пошив штор для любого интерьера" },
                price: { lv: "No 40€", ru: "От 40€" }
            }
        ],
        contact: {
            phone: "+371 12345678",
            email: "info@sewing.lv",
            address: { lv: "Rīga, Latvija", ru: "Рига, Латвия" },
            hours: { lv: "P-Pt: 9:00-18:00", ru: "Пн-Пт: 9:00-18:00" },
            socials: {
                facebook: "https://facebook.com",
                instagram: "https://instagram.com",
                whatsapp: "+37112345678"
            },
            qrCode: ""
        },
        categories: [
            {
                id: 1,
                name: { lv: "Vakara kleitas", ru: "Вечерние платья" },
                icon: "👗",
                coverImage: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400"
            },
            {
                id: 2,
                name: { lv: "Kāzu kleitas", ru: "Свадебные платья" },
                icon: "👰",
                coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400"
            },
            {
                id: 3,
                name: { lv: "Kostīmi", ru: "Костюмы" },
                icon: "🤵",
                coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400"
            },
            {
                id: 4,
                name: { lv: "Aizkari", ru: "Шторы" },
                icon: "🪟",
                coverImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400"
            }
        ],
        gallery: [
            {
                id: 1,
                categoryId: 1,
                url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800",
                title: { lv: "Vakara kleita", ru: "Вечернее платье" },
                description: { lv: "Eleganta vakara kleita", ru: "Элегантное вечернее платье" }
            },
            {
                id: 2,
                categoryId: 2,
                url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
                title: { lv: "Kāzu kleita", ru: "Свадебное платье" },
                description: { lv: "Skaista kāzu kleita", ru: "Красивое свадебное платье" }
            },
            {
                id: 3,
                categoryId: 3,
                url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
                title: { lv: "Vīriešu kostīms", ru: "Мужской костюм" },
                description: { lv: "Elegants vīriešu kostīms", ru: "Элегантный мужской костюм" }
            },
            {
                id: 4,
                categoryId: 4,
                url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
                title: { lv: "Aizkari", ru: "Шторы" },
                description: { lv: "Moderna aizkaru dizaina", ru: "Современный дизайн штор" }
            }
        ],
        location: {
            lat: 56.9496,
            lng: 24.1052
        }
    };
}

// Инициализация
let data = loadAllData();

// Сохранить дефолтные данные при первом запуске
if (!localStorage.getItem(DATA_KEY)) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    console.log('✓ Сохранены дефолтные данные');
}

// Переводы интерфейса
const translations = {
    lv: {
        title: "Šūšanas darbnīca \"Ulla\"",
        header: "Šūšanas darbnīca \"Ulla\"",
        tagline: "Profesionāli šūšanas pakalpojumi",
        servicesTitle: "Mūsu pakalpojumi",
        contactTitle: "Kontakti",
        locationTitle: "Mūsu atrašanās vieta",
        galleryTitle: "Mūsu darbi",
        backToCategories: "← Atpakaļ uz kategorijām",
        phone: "Telefons",
        email: "E-pasts",
        address: "Adrese",
        hours: "Darba laiks"
    },
    ru: {
        title: "Швейная Мастерская \"Ulla\"",
        header: "Швейная Мастерская \"Ulla\"",
        tagline: "Профессиональные швейные услуги",
        servicesTitle: "Наши услуги",
        contactTitle: "Контакты",
        locationTitle: "Наше местоположение",
        galleryTitle: "Наши работы",
        backToCategories: "← Назад к категориям",
        phone: "Телефон",
        email: "Эл. почта",
        address: "Адрес",
        hours: "Часы работы"
    }
};

// Переключение языка
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    document.getElementById('lang-lv').classList.toggle('active', lang === 'lv');
    document.getElementById('lang-ru').classList.toggle('active', lang === 'ru');
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    
    // Обновляем текст кнопок возврата
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(btn => {
        if (btn.style.display !== 'none') {
            btn.textContent = translations[lang].backToCategories;
        }
    });
    
    loadLogo();
    loadServices();
    loadContact();
    loadCategories();
    updateMapAddress();
}

// Загрузка логотипа
function loadLogo() {
    const logoImg = document.getElementById('site-logo');
    if (!logoImg) return;
    
    if (data.logo) {
        logoImg.src = data.logo;
        logoImg.style.display = 'block';
    } else {
        logoImg.style.display = 'none';
    }
}

// Загрузка услуг
function loadServices() {
    const servicesSection = document.querySelector('.services');
    const servicesList = document.getElementById('services-list');
    
    if (!servicesList) {
        console.error('❌ Элемент services-list не найден!');
        return;
    }
    
    // Проверяем настройку видимости
    const showServices = data.settings?.showServices !== false; // по умолчанию true
    
    if (servicesSection) {
        servicesSection.style.display = showServices ? 'block' : 'none';
    }
    
    if (!showServices) {
        console.log('👁️ Услуги скрыты по настройкам');
        return;
    }
    
    console.log('📋 Загрузка услуг:', data.services.length, 'услуг');
    servicesList.innerHTML = '';
    
    if (data.services.length === 0) {
        servicesList.innerHTML += '<p style="color: red; padding: 20px;">Все услуги удалены! Откройте admin.html и добавьте новые.</p>';
        return;
    }
    
    data.services.forEach(service => {
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';
        serviceItem.style.cssText = 'background: white; padding: 15px; margin-bottom: 10px; border-radius: 10px; border-left: 3px solid #667eea;';
        serviceItem.innerHTML = `
            <h3 style="color: #667eea; margin-bottom: 5px;">${service.title[currentLang]}</h3>
            <p style="color: #666; font-size: 0.9rem; margin: 5px 0;">${service.description[currentLang]}</p>
            <div class="service-price" style="color: #764ba2; font-weight: bold; margin-top: 5px;">${service.price[currentLang]}</div>
        `;
        servicesList.appendChild(serviceItem);
    });
    
    console.log('✓ Услуги загружены, HTML длина:', servicesList.innerHTML.length);
}

// Загрузка контактов
function loadContact() {
    const contactInfo = document.getElementById('contact-info');
    contactInfo.innerHTML = `
        <div class="contact-item">
            <strong data-i18n="phone">${translations[currentLang].phone}:</strong> ${data.contact.phone}
        </div>
        <div class="contact-item">
            <strong data-i18n="email">${translations[currentLang].email}:</strong> ${data.contact.email}
        </div>
        <div class="contact-item">
            <strong data-i18n="address">${translations[currentLang].address}:</strong> ${data.contact.address[currentLang]}
        </div>
        <div class="contact-item">
            <strong data-i18n="hours">${translations[currentLang].hours}:</strong> ${data.contact.hours[currentLang]}
        </div>
        <div class="social-links">
            ${data.contact.socials.facebook ? `<a href="${data.contact.socials.facebook}" target="_blank" class="social-link facebook"><i class="fab fa-facebook-f"></i></a>` : ''}
            ${data.contact.socials.instagram ? `<a href="${data.contact.socials.instagram}" target="_blank" class="social-link instagram"><i class="fab fa-instagram"></i></a>` : ''}
            ${data.contact.socials.whatsapp ? `<a href="https://wa.me/${data.contact.socials.whatsapp.replace(/\D/g, '')}" target="_blank" class="social-link whatsapp"><i class="fab fa-whatsapp"></i></a>` : ''}
        </div>
        ${data.contact.qrCode ? `<div class="qr-code"><img src="${data.contact.qrCode}" alt="QR Code"></div>` : ''}
    `;
}

// Загрузка категорий
function loadCategories() {
    const categoriesContainer = document.getElementById('gallery-categories');
    categoriesContainer.innerHTML = '';
    
    data.categories.forEach(category => {
        const photosCount = data.gallery.filter(item => item.categoryId === category.id).length;
        
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.style.backgroundImage = `url(${category.coverImage})`;
        categoryCard.onclick = () => openCategory(category);
        
        // Получаем стили категории
        const styles = category.styles || {};
        const fontSize = styles.fontSize || '24';
        const fontWeight = styles.fontWeight || '700';
        const textColor = styles.textColor || '#ffffff';
        const textShadow = getTextShadow(styles.textShadow || 'medium');
        
        categoryCard.innerHTML = `
            <div class="category-overlay">
                <h3 style="font-size: ${fontSize}px; font-weight: ${fontWeight}; color: ${textColor}; text-shadow: ${textShadow};">${category.name[currentLang]}</h3>
                <p>${photosCount} ${currentLang === 'lv' ? 'foto' : 'фото'}</p>
            </div>
        `;
        
        categoriesContainer.appendChild(categoryCard);
    });
}

// Функция для получения text-shadow
function getTextShadow(level) {
    const shadows = {
        'none': 'none',
        'light': '0 1px 3px rgba(0,0,0,0.3)',
        'medium': '0 2px 8px rgba(0,0,0,0.5)',
        'strong': '0 4px 12px rgba(0,0,0,0.8)'
    };
    return shadows[level] || shadows['medium'];
}

// Открыть категорию
let currentCategory = null;

function openCategory(category) {
    currentCategory = category;
    document.getElementById('gallery-categories').style.display = 'none';
    const photosContainer = document.getElementById('gallery-photos');
    photosContainer.classList.add('active');
    
    // Показываем обе кнопки возврата
    const backBtnTop = document.getElementById('gallery-back-btn-top');
    const backBtnBottom = document.getElementById('gallery-back-btn-bottom');
    backBtnTop.style.display = 'block';
    backBtnBottom.style.display = 'block';
    backBtnTop.textContent = translations[currentLang].backToCategories;
    backBtnBottom.textContent = translations[currentLang].backToCategories;
    
    photosContainer.innerHTML = '';
    
    const photos = data.gallery.filter(item => item.categoryId === category.id);
    
    photos.forEach((photo, index) => {
        const photoCard = document.createElement('div');
        photoCard.className = 'gallery-item';
        photoCard.onclick = () => openLightbox(photos, index);
        photoCard.innerHTML = `
            <img src="${photo.url}" alt="${photo.title[currentLang]}" loading="lazy">
        `;
        photosContainer.appendChild(photoCard);
    });
}

// Lightbox functionality
let currentLightboxPhotos = [];
let currentLightboxIndex = 0;

function openLightbox(photos, index) {
    currentLightboxPhotos = photos;
    currentLightboxIndex = index;
    showLightboxImage();
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function navigateLightbox(direction) {
    currentLightboxIndex += direction;
    
    // Циклическая навигация
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = currentLightboxPhotos.length - 1;
    } else if (currentLightboxIndex >= currentLightboxPhotos.length) {
        currentLightboxIndex = 0;
    }
    
    showLightboxImage();
}

function showLightboxImage() {
    const photo = currentLightboxPhotos[currentLightboxIndex];
    document.getElementById('lightbox-img').src = photo.url;
    document.querySelector('.lightbox-caption').textContent = photo.title[currentLang];
    document.querySelector('.lightbox-counter').textContent = 
        `${currentLightboxIndex + 1} / ${currentLightboxPhotos.length}`;
}

// Клавиатурная навигация
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.classList.contains('active')) {
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
        if (e.key === 'Escape') closeLightbox();
    }
});

function backToCategories() {
    document.getElementById('gallery-categories').style.display = 'grid';
    document.getElementById('gallery-photos').classList.remove('active');
    
    // Скрываем обе кнопки возврата
    document.getElementById('gallery-back-btn-top').style.display = 'none';
    document.getElementById('gallery-back-btn-bottom').style.display = 'none';
    
    currentCategory = null;
}

// Карта
let map = null;
let marker = null;

function initMap() {
    if (map) {
        map.remove();
    }
    
    map = L.map('map').setView([data.location.lat, data.location.lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
    
    marker = L.marker([data.location.lat, data.location.lng]).addTo(map);
}

function updateMapAddress() {
    const addressHeader = document.querySelector('.map-address');
    if (addressHeader) {
        addressHeader.textContent = data.contact.address[currentLang];
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    loadLogo();
    loadServices();
    loadContact();
    loadCategories();
    initMap();
    updateMapAddress();
    
    // Автообновление при изменении localStorage в другой вкладке
    window.addEventListener('storage', (e) => {
        if (e.key === DATA_KEY && e.newValue) {
            console.log('🔄 Storage event: данные изменены в другой вкладке!');
            data = JSON.parse(e.newValue);
            loadLogo();
            loadServices();
            loadContact();
            loadCategories();
            initMap();
            updateMapAddress();
        }
    });
    
    // Дополнительная проверка каждые 2 секунды (для той же вкладки)
    let lastData = localStorage.getItem(DATA_KEY);
    console.log('⏰ Запущена автопроверка изменений каждые 2 секунды');
    setInterval(() => {
        const newDataStr = localStorage.getItem(DATA_KEY);
        console.log('⏱️ Проверка...', newDataStr === lastData ? 'без изменений' : 'ЕСТЬ ИЗМЕНЕНИЯ!');
        if (newDataStr && newDataStr !== lastData) {
            console.log('🔄 Обнаружены изменения, перезагружаем...');
            data = JSON.parse(newDataStr);
            loadLogo();
            loadServices();
            loadContact();
            loadCategories();
            initMap();
            updateMapAddress();
            lastData = newDataStr;
        }
    }, 2000);
});
