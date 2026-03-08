// State Management using LocalStorage
const STATE_KEY = 'chequeAppRecords';

const BANK_TEMPLATES = {
    "UNIVERSAL": {
        name: "Standard CTS-2010 (202x92mm)",
        front: {
            acPayee: { x: 10, y: 10 },
            dateBoxes: { x: 145, y: 8, letterSpacing: '4.5mm' },
            payee: { x: 15, y: 26 },
            amountWords: { x: 20, y: 36, width: 120 },
            amountFig: { x: 155, y: 40 }
        }
    },
    "SBI": {
        name: "State Bank of India (202x92mm)",
        front: {
            acPayee: { x: 5, y: 15 },
            dateBoxes: { x: 150, y: 10, letterSpacing: '4.5mm' },
            payee: { x: 12, y: 32 },
            amountWords: { x: 22, y: 46, width: 120 },
            amountFig: { x: 150, y: 45 }
        }
    },
    "HDFC": {
        name: "HDFC Bank (202x92mm)",
        front: {
            acPayee: { x: 10, y: 5 },
            dateBoxes: { x: 148, y: 8, letterSpacing: '4.5mm' },
            payee: { x: 15, y: 28 },
            amountWords: { x: 25, y: 44, width: 125 },
            amountFig: { x: 153, y: 43 }
        }
    }
};

function getRecords() {
    const data = localStorage.getItem(STATE_KEY);
    return data ? JSON.parse(data) : [];
}

// XSS Prevention Utility
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

function saveRecord(record) {
    const records = getRecords();
    records.push({
        id: Date.now(),
        ...record
    });
    localStorage.setItem(STATE_KEY, JSON.stringify(records));
    refreshUI();
}

function deleteRecord(id) {
    let records = getRecords();
    records = records.filter(r => r.id !== id);
    localStorage.setItem(STATE_KEY, JSON.stringify(records));
    refreshUI();
}

async function goToPrint(id) {
    await switchTab('print');
    const select = document.getElementById('printChequeSelect');
    if (select) {
        select.value = id.toString();
        select.dispatchEvent(new Event('change'));
    }
}

// Navigation Logic
async function switchTab(targetId) {
    if (!document.startViewTransition) {
        performTabSwitch(targetId);
        return;
    }
    const transition = document.startViewTransition(() => {
        performTabSwitch(targetId);
    });
    await transition.updateCallbackDone;
}

function performTabSwitch(targetId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

    document.getElementById(targetId).classList.add('active');

    const navBtn = document.querySelector(`.nav-item[data-target="${targetId}"]`);
    if (navBtn) navBtn.classList.add('active');

    if (targetId === 'print') populatePrintSelect();
    if (targetId === 'report') renderReport();
}

document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => switchTab(e.target.dataset.target));
});

// Form Submission
document.getElementById('issueForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const record = {
        date: document.getElementById('chequeDate').value,
        payee: document.getElementById('payeeName').value.toUpperCase(),
        amount: parseFloat(document.getElementById('chequeAmount').value),
        type: document.getElementById('chequeType').value,
        chequeNo: document.getElementById('chequeNumber').value.toUpperCase(),
        remarks: document.getElementById('remarks').value.toUpperCase(),
        rtgsName: document.getElementById('rtgsName').value.toUpperCase()
    };

    saveRecord(record);
    this.reset();
});

// UI Rendering - Issue Table
const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
});

function refreshUI() {
    const records = getRecords();
    const tbody = document.getElementById('issuedTableBody');
    tbody.innerHTML = '';

    records.forEach((record, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHTML(new Date(record.date).toLocaleDateString('en-GB'))}</td>
            <td>${escapeHTML(record.payee)}</td>
            <td style="color: var(--accent-gold);">${escapeHTML(currencyFormatter.format(record.amount))}</td>
            <td>${escapeHTML(record.type)}</td>
            <td>${escapeHTML(record.chequeNo)}</td>
            <td>${escapeHTML(record.remarks || '-')}</td>
            <td class="actions-cell">
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button class="btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="goToPrint(${record.id})">Print</button>
                    <button id="dots-${record.id}" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.2rem; padding: 0 0.25rem;" onclick="document.getElementById('delete-${record.id}').style.display='inline-block'; this.style.display='none';">⋮</button>
                    <button id="delete-${record.id}" class="btn-outline" style="display: none; padding: 0.25rem 0.5rem; font-size: 0.75rem; color: #ef4444; border-color: #ef4444;" onclick="deleteRecord(${record.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Amount to Words Converter
function numberToWords(num) {
    if (num === 0) return 'Zero Only';

    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven',
        'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    const inWords = (n) => {
        let str = '';
        if (n > 99) {
            str += a[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n > 19) {
            str += b[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n > 0) {
            str += a[n] + ' ';
        }
        return str.trim();
    };

    let word = '';
    let wholeNumber = Math.floor(num);
    let decimalPart = Math.round((num - wholeNumber) * 100);

    let crore = Math.floor(wholeNumber / 10000000);
    wholeNumber %= 10000000;
    let lakh = Math.floor(wholeNumber / 100000);
    wholeNumber %= 100000;
    let thousand = Math.floor(wholeNumber / 1000);
    wholeNumber %= 1000;
    let remainder = Math.floor(wholeNumber);

    if (crore > 0) word += inWords(crore) + ' Crore ';
    if (lakh > 0) word += inWords(lakh) + ' Lakh ';
    if (thousand > 0) word += inWords(thousand) + ' Thousand ';
    if (remainder > 0) word += inWords(remainder);

    let result = word.trim();
    if (decimalPart > 0) {
        if (result === '') {
            result = inWords(decimalPart) + ' Paise';
        } else {
            result += ' And ' + inWords(decimalPart) + ' Paise';
        }
    }

    return result ? 'Rupees ' + result + ' Only' : 'Rupees Zero Only';
}

// Printing Engine Logic
let currentPrintSide = 'front';
let selectedRecordForPrint = null;

function populatePrintSelect() {
    const records = getRecords();
    const select = document.getElementById('printChequeSelect');
    select.innerHTML = '<option value="">-- Choose a record --</option>';

    records.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.chequeNo} - ${r.payee} (${currencyFormatter.format(r.amount)})`;
        select.appendChild(opt);
    });
}

document.getElementById('printChequeSelect').addEventListener('change', function (e) {
    const records = getRecords();
    selectedRecordForPrint = records.find(r => r.id === parseInt(e.target.value));
    updatePreviewTemplate();
});

document.getElementById('btnFront').addEventListener('click', function () {
    currentPrintSide = 'front';
    this.classList.add('active');
    this.style.borderColor = 'var(--accent-gold)';
    this.style.color = 'var(--accent-gold)';
    document.getElementById('btnBack').classList.remove('active');
    document.getElementById('btnBack').style.borderColor = 'var(--border-color)';
    document.getElementById('btnBack').style.color = 'var(--text-primary)';
    updatePreviewTemplate();
});

document.getElementById('btnBack').addEventListener('click', function () {
    currentPrintSide = 'back';
    this.classList.add('active');
    this.style.borderColor = 'var(--accent-gold)';
    this.style.color = 'var(--accent-gold)';
    document.getElementById('btnFront').classList.remove('active');
    document.getElementById('btnFront').style.borderColor = 'var(--border-color)';
    document.getElementById('btnFront').style.color = 'var(--text-primary)';
    updatePreviewTemplate();
});

['fmtPrefix', 'fmtSuffix', 'bankTemplateSelect', 'offsetX', 'offsetY'].forEach(id => {
    document.getElementById(id).addEventListener('input', updatePreviewTemplate);
});

function updatePreviewTemplate() {
    const previewArea = document.getElementById('previewContent');
    previewArea.innerHTML = '';

    if (!selectedRecordForPrint) return;

    const baseOffsetX = parseFloat(document.getElementById('offsetX').value) || 0;
    const baseOffsetY = parseFloat(document.getElementById('offsetY').value) || 0;

    if (currentPrintSide === 'front') {
        const pref = document.getElementById('fmtPrefix').value;
        const suff = document.getElementById('fmtSuffix').value;
        const amountStr = selectedRecordForPrint.amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        const formattedAmount = `${pref}${amountStr}${suff}`;

        // Format Date to an array of DDMMYYYY digits
        const d = new Date(selectedRecordForPrint.date);
        const dateChars = `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`.split('');

        let dateHtmlBoxes = "";
        dateChars.forEach(char => {
            dateHtmlBoxes += `<div style="flex: 1; display: flex; align-items: center; justify-content: center; height: 100%;">${char}</div>`;
        });

        const templateId = document.getElementById('bankTemplateSelect').value || 'UNIVERSAL';
        const tpl = BANK_TEMPLATES[templateId].front;

        previewArea.innerHTML = `
            <div class="print-element" style="top: ${tpl.acPayee.y + baseOffsetY}mm; left: ${tpl.acPayee.x + baseOffsetX}mm; font-size: 16px; font-weight: bold; text-decoration: underline; text-decoration-style: double; transform: rotate(-35deg); transform-origin: center left;">
                ${selectedRecordForPrint.type === 'A/c Payee' ? 'A/C PAYEE ONLY' : ''}
            </div>
            
            <!-- Structural 8 Date Boxes Container -->
            <div class="print-element" style="top: ${7 + baseOffsetY}mm; right: ${8 - baseOffsetX}mm; display: flex; width: 42mm; height: 6mm; font-family: monospace;">
                ${dateHtmlBoxes}
            </div>
            <div class="print-element" style="top: ${tpl.payee.y + baseOffsetY}mm; left: ${tpl.payee.x + baseOffsetX}mm;">
                ${escapeHTML(selectedRecordForPrint.payee)}
            </div>
            <div class="print-element" style="top: ${tpl.amountWords.y + baseOffsetY}mm; left: ${tpl.amountWords.x + baseOffsetX}mm; width: ${tpl.amountWords.width}mm; line-height: 1.5;">
                ${escapeHTML(numberToWords(selectedRecordForPrint.amount))}
            </div>
            <div class="print-element" style="top: ${tpl.amountFig.y + baseOffsetY}mm; left: ${tpl.amountFig.x + baseOffsetX}mm;">
                ${escapeHTML(formattedAmount)}
            </div>
        `;
    } else {
        // Back Side (RTGS)
        previewArea.innerHTML = `
            <div class="print-element" style="top: ${20 + baseOffsetY}mm; left: ${20 + baseOffsetX}mm;">Beneficiary: ${escapeHTML(selectedRecordForPrint.rtgsName || selectedRecordForPrint.payee)}</div>
            <div class="print-element" style="top: ${30 + baseOffsetY}mm; left: ${20 + baseOffsetX}mm;">Bank Name: _____________________</div>
            <div class="print-element" style="top: ${40 + baseOffsetY}mm; left: ${20 + baseOffsetX}mm;">A/C: _____________________</div>
            <div class="print-element" style="top: ${50 + baseOffsetY}mm; left: ${20 + baseOffsetX}mm;">IFSC: _____________________</div>
            <div class="print-element" style="top: ${70 + baseOffsetY}mm; left: ${20 + baseOffsetX}mm;">Signature:</div>
        `;
    }
}

function triggerPrint() {
    if (!selectedRecordForPrint) {
        alert("Please select a cheque to print.");
        return;
    }
    // Inject exact cheque CSS dimensions dynamically
    let style = document.getElementById('printPageStyle');
    if (!style) {
        style = document.createElement('style');
        style.id = 'printPageStyle';
        document.head.appendChild(style);
    }
    style.innerHTML = `@page { size: 202mm 92mm; margin: 0mm; }`;
    window.print();
}

function printReport() {
    document.body.classList.add('print-report-mode');

    // Inject A4 CSS dimensions for report printing
    let style = document.getElementById('printPageStyle');
    if (!style) {
        style = document.createElement('style');
        style.id = 'printPageStyle';
        document.head.appendChild(style);
    }
    style.innerHTML = `@page { size: A4 portrait; margin: 10mm; }`;
    window.print();

    // Clean up classes after print dialogue resolves
    setTimeout(() => {
        document.body.classList.remove('print-report-mode');
    }, 500);
}

// Report Logic
function renderReport() {
    const allRecords = getRecords();
    const selMonth = document.getElementById('filterMonth') ? document.getElementById('filterMonth').value : 'All Months';
    const selYear = document.getElementById('filterYear') ? document.getElementById('filterYear').value : 'All Years';

    // Apply Month & Year filter
    let records = allRecords.filter(r => {
        const d = new Date(r.date);
        const matchMonth = selMonth === 'All Months' || d.getMonth().toString() === selMonth;
        const matchYear = selYear === 'All Years' || d.getFullYear().toString() === selYear;
        return matchMonth && matchYear;
    });

    // Global Stats based on filtered rules
    let totalAmt = 0;
    records.forEach(r => totalAmt += r.amount);

    const statsElem = document.getElementById('reportStats');
    if (statsElem) {
        const titleContext = selMonth === 'All Months' ? 'All' : document.getElementById('filterMonth').options[document.getElementById('filterMonth').selectedIndex].text;
        statsElem.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${records.length}</div>
                <div class="stat-label">Cheques Issued (${titleContext})</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="font-size: 2rem;">${currencyFormatter.format(totalAmt)}</div>
                <div class="stat-label">Total Volume (INR)</div>
            </div>
        `;
    }

    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Sort by date descending
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    records.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="white-space: nowrap;">${escapeHTML(new Date(r.date).toLocaleDateString('en-GB'))}</td>
            <td><strong>${escapeHTML(r.payee)}</strong></td>
            <td>${escapeHTML(r.chequeNo)}</td>
            <td style="color: var(--accent-gold); font-weight: 600;">${escapeHTML(currencyFormatter.format(r.amount))}</td>
            <td><span style="padding: 2px 8px; border-radius: 12px; background: rgba(22, 48, 43, 0.5); border: 1px solid var(--accent-gold); color: var(--accent-gold); font-size: 0.75rem;">Issued</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    refreshUI();

    // Theme logic
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'dark';

        if (currentTheme === "light") {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggle.checked = false;
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.checked = true;
        }

        themeToggle.addEventListener('change', function (e) {
            if (e.target.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Init dates for report dropdowns
    const mSelect = document.getElementById('filterMonth');
    const ySelect = document.getElementById('filterYear');

    if (mSelect && ySelect) {
        mSelect.innerHTML = '';
        ySelect.innerHTML = '';

        mSelect.add(new Option('All Months', 'All Months'));
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].forEach((m, i) => {
            mSelect.add(new Option(m, i));
        });

        const currentYear = new Date().getFullYear();
        ySelect.add(new Option('All Years', 'All Years'));
        [currentYear, currentYear - 1, currentYear - 2].forEach(y => {
            ySelect.add(new Option(y, y));
        });

        mSelect.addEventListener('change', renderReport);
        ySelect.addEventListener('change', renderReport);
    }
});
