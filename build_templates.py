"""
Конвертирует .docx шаблоны в base64-строки и генерирует templates.js,
который подгружается ДО script.js / invoice.js и содержит все шаблоны встроенными.
Это позволяет генерировать документы по file:// без локального сервера.
"""
import base64
import os
import json

TEMPLATES_DIR = "/home/z/my-project/download/dogovor-copy"
OUTPUT_FILE = os.path.join(TEMPLATES_DIR, "templates.js")

templates = {
    "temprsfrus.docx": "Договор рассрочки, физлицо, Россия",
    "temprsfkg.docx": "Договор рассрочки, физлицо, Кыргызстан",
    "tempinv.docx": "Счёт на оплату",
}

chunks = []
chunks.append("// =====================================================================")
chunks.append("// Автоматически сгенерированный файл. НЕ редактируйте вручную.")
chunks.append("// Содержит .docx-шаблоны в base64, чтобы генерация работала по file://")
chunks.append("// без локального HTTP-сервера (обход CORS-блока fetch в Chrome/Edge).")
chunks.append("// =====================================================================")
chunks.append("")
chunks.append("window.EMBEDDED_TEMPLATES = {")
for fname, descr in templates.items():
    fpath = os.path.join(TEMPLATES_DIR, fname)
    with open(fpath, "rb") as f:
        data = f.read()
    b64 = base64.b64encode(data).decode("ascii")
    # Разбиваем на строки по 76 символов для читаемости
    lines = [b64[i:i+76] for i in range(0, len(b64), 76)]
    # ВАЖНО: каждая строка-литерал в массиве должна заканчиваться запятой
    b64joined = "\n".join([f"        '{l}'," for l in lines])
    chunks.append(f"    // {descr}")
    chunks.append(f"    '{fname}': [")
    chunks.append(b64joined)
    chunks.append(f"    ].join(''),")
chunks.append("};")
chunks.append("")
chunks.append("// Декодер base64 → ArrayBuffer (совместим со старыми браузерами)")
chunks.append("window.EMBEDDED_TEMPLATES._toBuffer = function(b64) {")
chunks.append("    var bin = atob(b64);")
chunks.append("    var len = bin.length;")
chunks.append("    var bytes = new Uint8Array(len);")
chunks.append("    for (var i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);")
chunks.append("    return bytes.buffer;")
chunks.append("};")
chunks.append("")

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(chunks))

print(f"Written: {OUTPUT_FILE}")
print(f"Size: {os.path.getsize(OUTPUT_FILE)} bytes ({os.path.getsize(OUTPUT_FILE)/1024:.1f} KB)")
