// Опция доступна по умолчанию. Чтобы сделать недоступной — добавь disabled: true.
// Недоступные опции рендерятся с пометкой «(скоро)».
const questions = [
    {
        question: 'Выберите действие:',
        options: [
            { value: 'Договор' },
            { value: 'Счет на оплату' }
        ],
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`
    },
    {
        question: 'Выберите тип услуги:',
        options: [
            { value: 'Быстрый старт', disabled: true },   // шаблон ещё не готов
            { value: 'Рассрочка' }
        ],
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
    },
    {
        question: 'Выберите тип лица:',
        options: [
            { value: 'Физическое лицо' },
            { value: 'Юридическое лицо', disabled: true } // шаблон ещё не готов
        ],
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
    },
    {
        question: 'Ваша страна:',
        options: [
            { value: 'Казахстан',  disabled: true }, // шаблон ещё не готов
            { value: 'Россия' },                       // есть Рассрочка-физлицо
            { value: 'Украина',     disabled: true }, // шаблон ещё не готов
            { value: 'Белоруссия',  disabled: true }, // шаблон ещё не готов
            { value: 'Кыргызстан' },                   // есть Рассрочка-физлицо
            { value: 'Таджикистан', disabled: true }  // шаблон ещё не готов
        ],
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
    }
];

let currentQuestionIndex = 0;
const answers = [];

/* ----------------------------- Toast ----------------------------- */
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
    }, 3200);
}

/* --------------------------- Navigation --------------------------- */
function nextQuestion() {
    const selectElement = document.getElementById('answer-select');
    const selectedValue = selectElement.value;

    if (!selectedValue) {
        showToast('Пожалуйста, выберите ответ', 'error');
        return;
    }

    // Доп. защита: даже если как-то выбрана disabled-опция (через JS,
    // DevTools и т.п.) — не пускаем дальше
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (selectedOption && selectedOption.disabled) {
        showToast('Эта опция пока недоступна (шаблон в разработке)', 'error');
        selectElement.value = '';
        return;
    }

    answers.push(selectedValue);
    currentQuestionIndex++;

    if (selectedValue === 'Счет на оплату') {
        window.location.href = 'invoice.html';
        return;
    }

    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        displayForm();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        answers.pop();
        currentQuestionIndex--;
        loadQuestion();
    }
}

/* ------------------------- Render question ------------------------- */
function loadQuestion() {
    const questionContainer = document.getElementById('question-container');
    const question = questions[currentQuestionIndex];

    const showBack = currentQuestionIndex > 0;

    questionContainer.innerHTML = `
        <div class="question">
            <span class="question-icon">${question.icon}</span>
            ${question.question}
        </div>
        <select id="answer-select">
            <option value="" disabled selected>Выберите ответ</option>
            ${question.options.map(opt => {
                const isDisabled = opt.disabled === true;
                const label = isDisabled ? `${opt.value} (скоро)` : opt.value;
                return `<option value="${opt.value}"${isDisabled ? ' disabled' : ''}>${label}</option>`;
            }).join('')}
        </select>
        <div class="button-row">
            ${showBack ? `<button class="btn-secondary" onclick="prevQuestion()">← Назад</button>` : ''}
            <button id="next-button" onclick="nextQuestion()">Далее →</button>
        </div>
    `;
}

/* --------------------------- Render form -------------------------- */
function displayForm() {
    const formContainer = document.getElementById('form-container');
    formContainer.style.display = 'grid';
    const [contractType, serviceType, entityType, country] = answers;

    let formHTML = `
        <div class="form-section-title"><span class="dot"></span> Параметры договора</div>
    `;

    if (serviceType === 'Рассрочка') {
        formHTML += `
            <div class="form-field"><label>Стоимость (руб.)</label><input type="number" name="cost" placeholder="например, 60000"></div>
            <div class="form-field"><label>Срок рассрочки (мес.)</label>
                <select name="term">
                    ${Array.from({ length: 24 }, (_, i) => i + 1).map(i => `<option value="${i}">${i}</option>`).join('')}
                </select>
            </div>
        `;
    }

    if (entityType === 'Физическое лицо') {
        if (country === 'Кыргызстан') {
            // Кыргызстан — плейсхолдеры шаблона temprsfkg.docx:
            // {kginn}, {kgid}, {kgovd}, {kgIssuedBy}, {kgadres}
            formHTML += `
                <div class="form-section-title"><span class="dot"></span> Данные заказчика (физлицо, Кыргызстан)</div>
                <div class="form-field"><label>Номер договора</label><input type="text" name="docNumber" placeholder="например, №12/2026"></div>
                <div class="form-field"><label>Дата договора</label><input type="date" name="date"></div>
                <div class="form-field"><label>ФИО полностью</label><input type="text" name="fullname" placeholder="Иванов Иван Иванович"></div>
                <div class="form-field"><label>ИНН (Кыргызстан)</label><input type="text" name="kginn" placeholder="14 цифр"></div>
                <div class="form-field"><label>ID-карта / паспорт (номер)</label><input type="text" name="kgid" placeholder="например, ID 1234567"></div>
                <div class="form-field"><label>Кем выдан (ОВД)</label><input type="text" name="kgovd" placeholder="например, ОВД Свердловского района"></div>
                <div class="form-field"><label>Когда выдан (дата)</label><input type="text" name="kgIssuedBy" placeholder="например, 12.05.2018"></div>
                <div class="form-field"><label>Адрес регистрации и проживания</label><textarea name="kgadres" placeholder="Индекс, город, улица, дом, кв."></textarea></div>
                <div class="form-field"><label>Email</label><input type="email" name="email" placeholder="example@mail.ru"></div>
                <div class="form-field"><label>Телефон</label><input type="text" name="phone" placeholder="+996 ..."></div>
                <div class="form-field"><label>Предмет договора</label><textarea name="contractSubject" placeholder="Описание услуг / работ"></textarea></div>
            `;
        } else {
            // Россия и другие страны — плейсхолдеры шаблона temprsfrus.docx:
            // {INN}, {passport}, {passportIssuedBy}, {regAddress}, {resAddress}
            formHTML += `
                <div class="form-section-title"><span class="dot"></span> Данные заказчика (физлицо)</div>
                <div class="form-field"><label>Номер договора</label><input type="text" name="docNumber" placeholder="например, №12/2026"></div>
                <div class="form-field"><label>Дата договора</label><input type="date" name="date"></div>
                <div class="form-field"><label>ФИО полностью</label><input type="text" name="fullname" placeholder="Иванов Иван Иванович"></div>
                <div class="form-field"><label>ИНН</label><input type="text" name="INN" placeholder="12 цифр"></div>
                <div class="form-field"><label>Паспорт (серия и номер)</label><input type="text" name="passport" placeholder="например, 45 08 123456"></div>
                <div class="form-field"><label>Кем и когда выдан паспорт</label><textarea name="passportIssuedBy" placeholder="ОВД района ... выдан 12.05.2018"></textarea></div>
                <div class="form-field"><label>Адрес регистрации</label><textarea name="regAddress" placeholder="Индекс, город, улица, дом, кв."></textarea></div>
                <div class="form-field"><label>Адрес проживания</label><textarea name="resAddress" placeholder="Если совпадает с регистрацией — укажите то же"></textarea></div>
                <div class="form-field"><label>Email</label><input type="email" name="email" placeholder="example@mail.ru"></div>
                <div class="form-field"><label>Телефон</label><input type="text" name="phone" placeholder="+7 ..."></div>
                <div class="form-field"><label>Предмет договора</label><textarea name="contractSubject" placeholder="Описание услуг / работ"></textarea></div>
            `;
        }
    }

    if (entityType === 'Юридическое лицо') {
        formHTML += `
            <div class="form-section-title"><span class="dot"></span> Данные заказчика (юрлицо)</div>
            <div class="form-field"><label>Название организации</label><input type="text" name="orgName" placeholder='ООО "Ромашка"'></div>
            <div class="form-field"><label>ИНН</label><input type="text" name="INN" placeholder="10 цифр"></div>
            <div class="form-field"><label>ОГРН или ОГРНИП</label><input type="text" name="OGRN" placeholder="13 или 15 цифр"></div>
            <div class="form-field"><label>Телефон</label><input type="text" name="phone" placeholder="+7 ..."></div>
            <div class="form-field"><label>Email</label><input type="email" name="email" placeholder="info@company.ru"></div>
            <div class="form-field"><label>Юридический адрес</label><textarea name="legalAddress" placeholder="Индекс, город, улица, дом, офис"></textarea></div>
            <div class="form-field"><label>Реквизиты банка</label><textarea name="bankDetails" placeholder="Р/с, БИК, к/с, банк"></textarea></div>
            <div class="form-field"><label>Предмет договора</label><textarea name="contractSubject" placeholder="Описание услуг / работ"></textarea></div>
        `;
    }

    formHTML += `
        <div class="button-row">
            <button class="btn-secondary" onclick="goBackToQuiz()">← Назад</button>
            <button id="submit-button" onclick="insertData()">Сформировать документ</button>
        </div>
    `;

    formContainer.innerHTML = formHTML;
    document.getElementById('question-container').style.display = 'none';
}

function goBackToQuiz() {
    // Возврат к квизу — откатываемся на последний вопрос
    if (answers.length > 0) answers.pop();
    currentQuestionIndex = questions.length - 1;
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('form-container').innerHTML = '';
    document.getElementById('question-container').style.display = 'block';
    loadQuestion();
}

/* --------------------------- Date utils --------------------------- */
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return { longDate: `${day}.${month}.${year}`, shortDate: `${day}.${month}.${year}` };
}

function generateMonthlyDates(startDate, term) {
    const dates = [];
    const date = new Date(startDate);

    for (let i = 1; i < term; i++) {
        date.setMonth(date.getMonth() + 1);
        dates.push(formatDate(date.toISOString().split('T')[0]));
    }
    return dates;
}

/* --------------------- Load template (embedded first, fetch fallback) ---- */
function loadTemplate(templateFile) {
    // 1) Пробуем встроенный base64-шаблон (работает по file://)
    if (window.EMBEDDED_TEMPLATES && window.EMBEDDED_TEMPLATES[templateFile]) {
        try {
            const b64 = window.EMBEDDED_TEMPLATES[templateFile];
            const buffer = window.EMBEDDED_TEMPLATES._toBuffer(b64);
            return Promise.resolve(buffer);
        } catch (e) {
            console.warn('Встроенный шаблон повреждён, fallback на fetch:', e);
        }
    }
    // 2) Fallback: fetch .docx (работает только через http(s):// сервер)
    return fetch(templateFile).then(r => r.arrayBuffer());
}

/* --------------------- Generate the document --------------------- */
function insertData() {
    const formData = {};
    document.querySelectorAll('.form-field input, .form-field textarea, .form-field select')
        .forEach(field => formData[field.name] = field.value);

    // Валидация обязательных полей
    const requiredFields = ['contractSubject', 'email', 'phone'];
    if (formData.term && formData.cost) requiredFields.push('cost', 'term');
    if (formData.fullname === '' && formData.orgName === '') {
        // оба пустые — не выбран тип лица (странно, но проверим)
    }

    const missing = requiredFields.filter(f => !formData[f] || !String(formData[f]).trim());
    if (missing.length) {
        showToast(`Заполните обязательные поля: ${missing.join(', ')}`, 'error');
        return;
    }

    const formattedDate = formatDate(formData.date || new Date().toISOString().split('T')[0]);
    formData.longDate = formattedDate.longDate;
    formData.shortDate = formattedDate.shortDate;

    // График платежей
    if (formData.term && formData.cost) {
        const cost = parseFloat(formData.cost);
        const term = parseInt(formData.term, 10);

        formData.monthlyPayment = (cost / term).toFixed(2);

        const monthlyDates = generateMonthlyDates(
            formattedDate.shortDate.split('.').reverse().join('-'),
            term
        );

        formData.paymentSchedule = monthlyDates.map((date, index) =>
            `3.2.${index + 2} Внесение платежа в размере ${formData.monthlyPayment} рублей до ${date.shortDate} г.`
        ).join('\n');
    } else {
        formData.paymentSchedule = '';
    }

    // Поддержка всех стран и типов
    const [contractType, serviceType, entityType, country] = answers;
    let templateFile = '';

    if (serviceType === 'Рассрочка' && entityType === 'Физическое лицо' && country === 'Россия') {
        templateFile = 'temprsfrus.docx';
    } else if (serviceType === 'Рассрочка' && entityType === 'Физическое лицо' && country === 'Кыргызстан') {
        templateFile = 'temprsfkg.docx';
    } else {
        const descr = [
            serviceType, entityType, country
        ].filter(Boolean).join(' · ');
        showToast(
            `Шаблон для комбинации «${descr}» ещё не добавлен. ` +
            `Положите .docx в папку и добавьте ветку в script.js.`,
            'error'
        );
        return;
    }

    showToast('Формируем документ...', 'info');

    loadTemplate(templateFile)
        .then(buffer => {
            const zip = new window.PizZip(buffer);
            const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            doc.setData(formData);

            try {
                doc.render();
            } catch (error) {
                console.error('Ошибка при рендеринге шаблона:', error);
                throw error;
            }

            const out = doc.getZip().generate({
                type: 'blob',
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });

            saveAs(out, templateFile);
            showToast('Документ успешно сформирован!', 'success');
        })
        .catch(error => {
            console.error('Ошибка при загрузке или обработке:', error);
            showToast('Не удалось сформировать документ', 'error');
        });
}

window.onload = loadQuestion;
