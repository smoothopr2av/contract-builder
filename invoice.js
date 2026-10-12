document.addEventListener("DOMContentLoaded", () => {
    const formContainer = document.getElementById("invoice-form-container");

    formContainer.innerHTML = `
        <div class="form-section-title"><span class="dot"></span> Номер и дата счёта</div>
        <div class="form-single-column">
            <div class="form-field">
                <label>Номер счёта на оплату</label>
                <input type="text" name="numbco" placeholder="например, №104">
            </div>
            <div class="form-field">
                <label>Дата от какого числа</label>
                <input type="date" name="invoiceDate">
            </div>
        </div>

        <div class="form-section-title"><span class="dot"></span> Реквизиты организации</div>
        <div class="form-grid">
            <div class="form-field">
                <label>Наименование компании</label>
                <input type="text" name="nameorg" placeholder='ООО "Ромашка"'>
            </div>
            <div class="form-field">
                <label>ИНН</label>
                <input type="text" name="inn">
            </div>
            <div class="form-field">
                <label>КПП</label>
                <input type="text" name="kpp">
            </div>
            <div class="form-field">
                <label>ОГРН</label>
                <input type="text" name="ogrn">
            </div>
            <div class="form-field">
                <label>Расчётный счёт (р/с)</label>
                <input type="text" name="rc">
            </div>
            <div class="form-field">
                <label>Банк</label>
                <input type="text" name="bank">
            </div>
            <div class="form-field">
                <label>БИК</label>
                <input type="text" name="bik">
            </div>
            <div class="form-field">
                <label>Корреспондентский счёт (к/с)</label>
                <input type="text" name="kc">
            </div>
            <div class="form-field">
                <label>Адрес организации</label>
                <textarea name="adresorg"></textarea>
            </div>
            <div class="form-field">
                <label>Основание</label>
                <input type="text" name="basis" value="Без договора">
            </div>
        </div>

        <div class="form-section-title"><span class="dot"></span> Позиция счёта</div>
        <div class="form-single-column">
            <div class="form-field">
                <label>Наименование</label>
                <input type="text" name="itemName" placeholder="Услуга / товар">
            </div>
            <div class="form-field">
                <label>Количество</label>
                <input type="number" name="itemQuantity" id="itemQuantity">
            </div>
            <div class="form-field">
                <label>Цена за единицу</label>
                <input type="number" name="itemPrice" id="itemPrice">
            </div>
            <div class="form-field">
                <label>Сумма</label>
                <input type="number" name="itemTotal" id="itemTotal" readonly>
            </div>
        </div>

        <button id="generate-invoice">Сформировать счёт</button>
    `;

    document.getElementById("itemQuantity").addEventListener("input", updateTotal);
    document.getElementById("itemPrice").addEventListener("input", updateTotal);

    function updateTotal() {
        const quantity = parseFloat(document.getElementById("itemQuantity").value) || 0;
        const price = parseFloat(document.getElementById("itemPrice").value) || 0;
        const total = quantity * price;
        document.getElementById("itemTotal").value = total.toFixed(2);
    }

    document.getElementById("generate-invoice").addEventListener("click", () => {
        const formFields = document.querySelectorAll(".form-field input, .form-field textarea");
        const invoiceData = {};

        formFields.forEach(field => {
            if (field.name === 'invoiceDate' && field.value) {
                const date = new Date(field.value);
                invoiceData['day'] = date.getDate();
                const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                                  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                invoiceData['month'] = monthsRu[date.getMonth()];
                invoiceData['year'] = date.getFullYear();
            } else {
                invoiceData[field.name] = field.value;
            }
        });

        // Проверка заполненности полей (itemTotal вычисляется автоматически, пропускаем)
        for (const [key, value] of Object.entries(invoiceData)) {
            if (!value || !String(value).trim()) {
                if (!['day', 'month', 'year', 'itemTotal'].includes(key)) {
                    showToast(`Поле "${key}" не заполнено!`, 'error');
                    return;
                }
            }
        }

        // Форматируем сумму: "12345.67" -> "12 345,67"
        const total = parseFloat(invoiceData.itemTotal) || 0;
        const formattedTotal = total.toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
            .replace('.', ',');
        invoiceData.itemTotal = formattedTotal;

        // Сумма прописью для строки "Всего наименований ... рублей ..."
        if (typeof amountToWords === 'function') {
            invoiceData.itemTotalWords = amountToWords(total);
        } else {
            invoiceData.itemTotalWords = '';
        }

        // Форматируем цену аналогично
        if (invoiceData.itemPrice) {
            const price = parseFloat(invoiceData.itemPrice) || 0;
            invoiceData.itemPrice = price.toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                .replace('.', ',');
        }

        showToast('Формируем счёт...', 'info');

        // Подставляем данные в шаблон и генерируем документ
        generateInvoiceDoc(invoiceData);
    });

    function generateInvoiceDoc(data) {
        loadTemplate("tempinv.docx")
            .then(arrayBuffer => {
                const zip = new PizZip(arrayBuffer);
                const doc = new window.docxtemplater(zip, {
                    paragraphLoop: true,
                    linebreaks: true,
                });

                doc.setData(data);

                try {
                    doc.render();
                } catch (error) {
                    console.error("Ошибка генерации документа:", error);
                    showToast("Ошибка при создании счёта.", 'error');
                    return;
                }

                const out = doc.getZip().generate({
                    type: "blob",
                    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                });

                saveAs(out, "Счет-на-оплату.docx");
                showToast("Счёт успешно сформирован!", 'success');
            })
            .catch(error => {
                console.error("Ошибка загрузки шаблона:", error);
                showToast("Ошибка загрузки шаблона.", 'error');
            });
    }
});

/* --------------------- Load template (embedded first, fetch fallback) ---- */
function loadTemplate(templateFile) {
    if (window.EMBEDDED_TEMPLATES && window.EMBEDDED_TEMPLATES[templateFile]) {
        try {
            const b64 = window.EMBEDDED_TEMPLATES[templateFile];
            const buffer = window.EMBEDDED_TEMPLATES._toBuffer(b64);
            return Promise.resolve(buffer);
        } catch (e) {
            console.warn('Встроенный шаблон повреждён, fallback на fetch:', e);
        }
    }
    return fetch(templateFile).then(r => r.arrayBuffer());
}

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
