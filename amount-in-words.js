/**
 * Сумма прописью на русском языке.
 * Поддерживает целую часть до триллионов и копейки.
 * Пример: 6543.50 -> "Шесть тысяч пятьсот сорок три рубля 50 копеек"
 *         6000.00 -> "Шесть тысяч рублей 00 копеек"
 */
function amountToWords(amount) {
    if (isNaN(amount)) amount = 0;
    amount = Math.round(amount * 100) / 100;

    const rubles = Math.floor(amount);
    const kopecks = Math.round((amount - rubles) * 100);

    const ones = ['', 'один', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
    const onesFem = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']; // для тысяч
    const tens = ['', 'десять', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
    const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
    const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];
    const scales = [
        { name: ['', '', ''], fem: false },            // единицы
        { name: ['тысяча', 'тысячи', 'тысяч'], fem: true },   // 10^3
        { name: ['миллион', 'миллиона', 'миллионов'], fem: false }, // 10^6
        { name: ['миллиард', 'миллиарда', 'миллиардов'], fem: false }, // 10^9
        { name: ['триллион', 'триллиона', 'триллионов'], fem: false } // 10^12
    ];

    function threeDigitsToWords(n, scale) {
        let result = '';
        const h = Math.floor(n / 100);
        const t = Math.floor((n % 100) / 10);
        const o = n % 10;
        if (h > 0) result += hundreds[h] + ' ';
        if (t === 1) {
            result += teens[o] + ' ';
        } else {
            if (t > 0) result += tens[t] + ' ';
            if (o > 0) {
                result += (scale.fem ? onesFem[o] : ones[o]) + ' ';
            }
        }
        return result.trim();
    }

    function pickScaleForm(n, scale) {
        if (n === 0) return '';
        const t = n % 100;
        const o = n % 10;
        if (t >= 11 && t <= 14) return scale.name[2];
        if (o === 1) return scale.name[0];
        if (o >= 2 && o <= 4) return scale.name[1];
        return scale.name[2];
    }

    if (rubles === 0) {
        return 'Ноль рублей 00 копеек';
    }

    let words = '';
    let remaining = rubles;
    let scaleIndex = 0;
    const groups = [];
    while (remaining > 0 && scaleIndex < scales.length) {
        const grp = remaining % 1000;
        if (grp > 0) {
            groups.unshift({ grp, scaleIndex });
        }
        remaining = Math.floor(remaining / 1000);
        scaleIndex++;
    }

    for (const { grp, scaleIndex } of groups) {
        const scale = scales[scaleIndex];
        const grpWords = threeDigitsToWords(grp, scale);
        words += grpWords;
        if (scaleIndex > 0) {
            words += ' ' + pickScaleForm(grp, scale);
        }
        words += ' ';
    }

    words = words.trim();
    // Capitalize first letter
    words = words.charAt(0).toUpperCase() + words.slice(1);

    // "рублей" / "рубль" / "рубля" depending on amount
    const rublesForm = (() => {
        const t = rubles % 100;
        const o = rubles % 10;
        if (t >= 11 && t <= 14) return 'рублей';
        if (o === 1) return 'рубль';
        if (o >= 2 && o <= 4) return 'рубля';
        return 'рублей';
    })();

    const kopecksStr = String(kopecks).padStart(2, '0');
    return `${words} ${rublesForm} ${kopecksStr} копеек`;
}

// Expose for testing if needed
if (typeof window !== 'undefined') {
    window.amountToWords = amountToWords;
}
