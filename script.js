/**
 * MD Construction & Interior - Quotation Logic
 * Handles form interactions, calculations, and PDF generation.
 */

// Data Configuration
// WORK_TYPES removed as requested, Work Type is now a plain text input.

// State
let quotationItems = [];
let gstEnabled = false;
let projectNotes = [];
let projectTerms = [
    "Payment: 50% advance, 40% in progress, 10% on completion.",
    "Timeline: Subject to site clearance and material availability.",
    "Electrical work is not included.",
    "Client must provide tea, coffee, and snacks for the workers."
];

// DOM Elements
const elements = {
    customerName: document.getElementById('customerName'),
    customerId: document.getElementById('customerId'),
    customerPhone: document.getElementById('customerPhone'),
    phoneError: document.getElementById('phoneError'),
    customerGst: document.getElementById('customerGst'),
    projectLocation: document.getElementById('projectLocation'),
    customerPincode: document.getElementById('customerPincode'),
    pincodeError: document.getElementById('pincodeError'),
    quotationDate: document.getElementById('quotationDate'),
    estTime: document.getElementById('estTime'),
    documentType: document.getElementById('documentType'),

    workTypeInput: document.getElementById('workTypeInput'),
    materialInput: document.getElementById('materialInput'),
    floorInput: document.getElementById('floorInput'),
    descriptionInput: document.getElementById('descriptionInput'),
    sqFtInput: document.getElementById('sqFtInput'),
    rateInput: document.getElementById('rateInput'),
    addItemBtn: document.getElementById('addItemBtn'),

    itemsTableBody: document.getElementById('itemsTableBody'),

    subTotalDisplay: document.getElementById('subTotalDisplay'),
    gstToggle: document.getElementById('gstToggle'),
    gstDisplay: document.getElementById('gstDisplay'),
    grandTotalDisplay: document.getElementById('grandTotalDisplay'),
    mobileGrandTotal: document.getElementById('mobileGrandTotal'),

    previewBtn: document.getElementById('previewBtn'),
    downloadPdfBtn: document.getElementById('downloadPdfBtn'),

    // Printable Area Elements
    printableArea: document.getElementById('printableArea'),
    printDate: document.getElementById('printDate'),
    printEstTime: document.getElementById('printEstTime'),
    printCustomerName: document.getElementById('printCustomerName'),
    printCustomerId: document.getElementById('printCustomerId'),
    printCustomerGst: document.getElementById('printCustomerGst'),
    printProject: document.getElementById('printProject'),
    printDocTypeLabel: document.getElementById('printDocTypeLabel'),
    printValidityTerm: document.getElementById('printValidityTerm'),
    printTableBody: document.getElementById('printTableBody'),
    printSubTotal: document.getElementById('printSubTotal'),
    printGstRow: document.getElementById('printGstRow'),
    printGst: document.getElementById('printGst'),
    printGrandTotal: document.getElementById('printGrandTotal'),

    // Notes Elements
    noteInput: document.getElementById('noteInput'),
    addNoteBtn: document.getElementById('addNoteBtn'),
    notesList: document.getElementById('notesList'),
    printNotesSection: document.getElementById('printNotesSection'),
    printNotesList: document.getElementById('printNotesList'),

    // Terms Elements
    termInput: document.getElementById('termInput'),
    addTermBtn: document.getElementById('addTermBtn'),
    termsListUI: document.getElementById('termsListUI'),
    printTermsList: document.getElementById('printTermsList'),

    // Modal Elements (Legacy support if needed, mostly unused now)
    modalOverlay: document.getElementById('modalOverlay'),
    closePreviewBtn: document.getElementById('closePreviewBtn'),
    modalDownloadBtn: document.getElementById('modalDownloadBtn')
};

// Global State
// Global State
// notes removed from here
document.addEventListener('DOMContentLoaded', () => {
    initDate();
    setupEventListeners();
    renderTerms(); // Render default terms
});

// 1. Initialize Date
function initDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    elements.quotationDate.value = `${yyyy}-${mm}-${dd}`;
}

// Format Date as DD-MM-YYYY
function formatDateDDMMYYYY(dateStr) {
    if (!dateStr) return "-";
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        if (parts[0].length === 4) {
            // YYYY-MM-DD -> DD-MM-YYYY
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    }
    return dateStr;
}

// 2. Setup Dropdowns (Removed)
// Removed initDropdowns() since Work Type is now plain text

// 3. Event Listeners
function setupEventListeners() {
    elements.addItemBtn.addEventListener('click', addItem);
    elements.gstToggle.addEventListener('change', (e) => {
        gstEnabled = e.target.checked;
        calculateTotals();
    });

    // Notes Listeners
    if (elements.addNoteBtn) {
        elements.addNoteBtn.addEventListener('click', addNote);
    }
    if (elements.noteInput) {
        elements.noteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNote();
        });
    }

    // Terms Listeners
    if (elements.addTermBtn) {
        elements.addTermBtn.addEventListener('click', addTerm);
    }
    if (elements.termInput) {
        elements.termInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTerm();
        });
    }

    // Preview & Download
    elements.previewBtn.addEventListener('click', togglePreview);
    elements.downloadPdfBtn.addEventListener('click', () => generatePDF());

    // Inline Controls
    if (elements.closePreviewBtn) {
        elements.closePreviewBtn.addEventListener('click', hidePreview);
        elements.closePreviewBtn.textContent = "Hide Preview";
    }
    if (elements.modalDownloadBtn) {
        elements.modalDownloadBtn.addEventListener('click', () => generatePDF());
    }

    // Allow 'Enter' key in inputs to trigger Add Item
    const inputs = [elements.sqFtInput, elements.rateInput, elements.floorInput];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addItem();
            });
        }
    });

    // Setup input validations (phone, pincode, sqft, rate)
    setupInputValidations();
}

// Input Validations
function setupInputValidations() {
    // 1. Phone Number Validation (10 digits only, numbers only)
    if (elements.customerPhone) {
        elements.customerPhone.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 10) val = val.slice(0, 10);
            e.target.value = val;
            validatePhoneField();
        });

        elements.customerPhone.addEventListener('keypress', (e) => {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });

        elements.customerPhone.addEventListener('blur', validatePhoneField);
    }

    // 2. Pincode Validation (6 digits only, numbers only)
    if (elements.customerPincode) {
        elements.customerPincode.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 6) val = val.slice(0, 6);
            e.target.value = val;
            validatePincodeField();
        });

        elements.customerPincode.addEventListener('keypress', (e) => {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });

        elements.customerPincode.addEventListener('blur', validatePincodeField);
    }

    // 3. Sq Ft & Rate Inputs (Text inputs, allow numbers only)
    const numericInputs = [elements.sqFtInput, elements.rateInput];
    numericInputs.forEach(input => {
        if (!input) return;

        input.addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^0-9.]/g, '');
            // Only allow single decimal point
            const parts = val.split('.');
            if (parts.length > 2) {
                val = parts[0] + '.' + parts.slice(1).join('');
            }
            e.target.value = val;
        });

        input.addEventListener('keypress', (e) => {
            // Allow 0-9
            if (/[0-9]/.test(e.key)) return;
            // Allow single '.' if not already present
            if (e.key === '.' && !e.target.value.includes('.')) return;
            // Disallow all other characters
            e.preventDefault();
        });
    });
}

function validatePhoneField() {
    if (!elements.customerPhone) return true;
    const val = elements.customerPhone.value.trim();
    const errorEl = elements.phoneError;

    if (val.length === 0) {
        elements.customerPhone.classList.remove('input-error', 'input-success');
        if (errorEl) errorEl.textContent = '';
        return true;
    }

    if (val.length !== 10) {
        elements.customerPhone.classList.add('input-error');
        elements.customerPhone.classList.remove('input-success');
        if (errorEl) errorEl.textContent = `Phone number must be 10 digits (${val.length}/10)`;
        return false;
    }

    elements.customerPhone.classList.remove('input-error');
    elements.customerPhone.classList.add('input-success');
    if (errorEl) errorEl.textContent = '';
    return true;
}

function validatePincodeField() {
    if (!elements.customerPincode) return true;
    const val = elements.customerPincode.value.trim();
    const errorEl = elements.pincodeError;

    if (val.length === 0) {
        elements.customerPincode.classList.remove('input-error', 'input-success');
        if (errorEl) errorEl.textContent = '';
        return true;
    }

    if (val.length !== 6) {
        elements.customerPincode.classList.add('input-error');
        elements.customerPincode.classList.remove('input-success');
        if (errorEl) errorEl.textContent = `Pincode must be 6 digits (${val.length}/6)`;
        return false;
    }

    elements.customerPincode.classList.remove('input-error');
    elements.customerPincode.classList.add('input-success');
    if (errorEl) errorEl.textContent = '';
    return true;
}

function validateFormBeforePrint() {
    if (!validatePhoneField()) {
        alert("Please enter a valid 10-digit Phone Number.");
        elements.customerPhone.focus();
        return false;
    }
    if (!validatePincodeField()) {
        alert("Please enter a valid 6-digit Pincode.");
        elements.customerPincode.focus();
        return false;
    }
    return true;
}

// Note Logic
function addNote() {
    if (!elements.noteInput) return;
    const text = elements.noteInput.value.trim();
    if (text) {
        projectNotes.push(text);
        elements.noteInput.value = '';
        renderNotes();
    }
}

function removeNote(index) {
    projectNotes.splice(index, 1);
    renderNotes();
}

function renderNotes() {
    if (!elements.notesList) return;
    elements.notesList.innerHTML = '';
    projectNotes.forEach((note, index) => {
        const li = document.createElement('li');
        li.style.cssText = "display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;";

        const span = document.createElement('span');
        span.innerHTML = `&bull; ${note}`;

        const btn = document.createElement('button');
        btn.innerHTML = '&times;';
        btn.style.cssText = "background:none; border:none; color:red; cursor:pointer;";
        btn.addEventListener('click', () => removeNote(index));

        li.appendChild(span);
        li.appendChild(btn);
        elements.notesList.appendChild(li);
    });
}

// Term Logic
function addTerm() {
    if (!elements.termInput) return;
    const text = elements.termInput.value.trim();
    if (text) {
        projectTerms.push(text);
        elements.termInput.value = '';
        renderTerms();
    }
}

function removeTerm(index) {
    projectTerms.splice(index, 1);
    renderTerms();
}

function renderTerms() {
    if (!elements.termsListUI) return;
    elements.termsListUI.innerHTML = '';
    projectTerms.forEach((term, index) => {
        const li = document.createElement('li');
        li.style.cssText = "display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;";

        const span = document.createElement('span');
        span.innerHTML = `&bull; ${term}`;

        const btn = document.createElement('button');
        btn.innerHTML = '&times;';
        btn.style.cssText = "background:none; border:none; color:red; cursor:pointer;";
        btn.addEventListener('click', () => removeTerm(index));

        li.appendChild(span);
        li.appendChild(btn);
        elements.termsListUI.appendChild(li);
    });
}

// 4. Add Item Logic
function addItem() {
    // Get Values
    const workType = elements.workTypeInput.value.trim();
    const material = elements.materialInput.value.trim();
    const floor = elements.floorInput.value.trim() || "-";
    const sqFtStr = elements.sqFtInput.value.trim();
    const rateStr = elements.rateInput.value.trim();
    const sqFt = parseFloat(sqFtStr);
    const rate = parseFloat(rateStr);

    // Validation
    if (!workType || !material) {
        alert("Please select both Work Type and Material.");
        return;
    }
    if (!sqFtStr || isNaN(sqFt) || sqFt <= 0) {
        alert("Please enter a valid numeric Square Feet value.");
        elements.sqFtInput.focus();
        return;
    }
    if (!rateStr || isNaN(rate) || rate <= 0) {
        alert("Please enter a valid numeric Rate.");
        elements.rateInput.focus();
        return;
    }

    const total = sqFt * rate;

    // Add to State
    const item = {
        id: Date.now(),
        workType,
        material,
        floor,
        sqFt,
        rate,
        total
    };
    quotationItems.push(item);

    // Render & Reset
    renderTable();
    calculateTotals();
    resetInputs();
}

function resetInputs() {
    elements.workTypeInput.value = "";
    elements.materialInput.value = "";
    // elements.descriptionInput.value = ""; // Removed
    elements.floorInput.value = "";
    elements.sqFtInput.value = "";
    elements.rateInput.value = "";
}

function removeItem(id) {
    quotationItems = quotationItems.filter(item => item.id !== id);
    renderTable();
    calculateTotals();
}
// Expose removeItem to window for inline onclick in table
window.removeItem = removeItem;

// 5. Render Table
function renderTable() {
    elements.itemsTableBody.innerHTML = '';

    if (quotationItems.length === 0) {
        elements.itemsTableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="8" style="text-align:center; padding: 2rem; color: #888;">
                    No items added yet.
                </td>
            </tr>`;
        return;
    }

    quotationItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${item.workType}</strong></td>
            <td>${item.material}</td>
            <td>${item.floor}</td>
            <td>${item.sqFt}</td>
            <td>₹${item.rate.toFixed(2)}</td>
            <td>₹${item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>
                <button class="delete-btn" onclick="removeItem(${item.id})">&times;</button>
            </td>
        `;
        elements.itemsTableBody.appendChild(row);
    });
}

// 6. Calculate Totals
function calculateTotals() {
    const subTotal = quotationItems.reduce((sum, item) => sum + item.total, 0);
    let gstAmount = 0;

    if (gstEnabled) {
        gstAmount = subTotal * 0.18;
    }

    const grandTotal = subTotal + gstAmount;

    // Update UI
    elements.subTotalDisplay.textContent = formatCurrency(subTotal);

    if (gstEnabled) {
        elements.gstDisplay.textContent = formatCurrency(gstAmount);
        elements.gstDisplay.style.color = '#333';
        elements.printGstRow.style.display = 'flex';
    } else {
        elements.gstDisplay.textContent = "₹0.00";
        elements.gstDisplay.style.color = '#ccc';
        elements.printGstRow.style.display = 'none'; // Hide in print if disabled
    }

    elements.grandTotalDisplay.textContent = formatCurrency(grandTotal);
    elements.mobileGrandTotal.textContent = formatCurrency(grandTotal);
}

function formatCurrency(amount) {
    return "₹" + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 7. Preview Logic

function updatePrintView() {
    // Fill Meta Data
    elements.printDate.textContent = formatDateDDMMYYYY(elements.quotationDate.value) || "-";
    elements.printEstTime.textContent = (elements.estTime.value || "").trim() || "-";

    elements.printCustomerName.textContent = (elements.customerName.value || "").trim() || "-";
    
    if (elements.printDocTypeLabel) {
        const docTypeValue = elements.documentType.value || "Quotation";
        if (docTypeValue === "Invoice") {
            elements.printDocTypeLabel.textContent = "Invoice Bill";
        } else {
            elements.printDocTypeLabel.textContent = docTypeValue + " For";
        }
    }
    if (elements.printValidityTerm) {
        const docType = (elements.documentType.value || "Quotation").toLowerCase();
        elements.printValidityTerm.textContent = `Validity: This ${docType} is valid for 15 days.`;
    }

    // Customer Fields
    const printCustomerPhone = document.getElementById('printCustomerPhone');
    if (printCustomerPhone) printCustomerPhone.textContent = (elements.customerPhone.value || "").trim() || "-";

    elements.printCustomerId.textContent = (elements.customerId.value || "").trim() || "-";
    elements.printCustomerGst.textContent = (elements.customerGst.value || "").trim() || "-";

    // Site Location
    const siteVal = (elements.projectLocation.value || "").trim();
    const pinVal = (elements.customerPincode.value || "").trim();
    if (siteVal && pinVal) {
        elements.printProject.textContent = `${siteVal}, ${pinVal}`;
    } else if (siteVal) {
        elements.printProject.textContent = siteVal;
    } else if (pinVal) {
        elements.printProject.textContent = pinVal;
    } else {
        elements.printProject.textContent = "-";
    }

    // Fill Table
    elements.printTableBody.innerHTML = '';
    quotationItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td style="font-weight: 500;">${item.workType}</td>
            <td style="color: #555;">${item.material}</td>
            <td>${item.floor}</td>
            <td class="text-right">${item.sqFt}</td>
            <td class="text-right">${item.rate.toFixed(2)}</td>
            <td class="text-right">${item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        `;
        elements.printTableBody.appendChild(row);
    });

    // Fill Totals
    const subTotal = quotationItems.reduce((sum, item) => sum + item.total, 0);
    const gstAmt = gstEnabled ? subTotal * 0.18 : 0;

    elements.printSubTotal.textContent = formatCurrency(subTotal);
    elements.printGst.textContent = formatCurrency(gstAmt);
    elements.printGrandTotal.textContent = formatCurrency(subTotal + gstAmt);

    // Fill Notes
    if (projectNotes.length > 0 && elements.printNotesSection) {
        elements.printNotesSection.style.display = 'block';
        elements.printNotesList.innerHTML = projectNotes.map(note => `<li>${note}</li>`).join('');
    } else if (elements.printNotesSection) {
        elements.printNotesSection.style.display = 'none';
    }

    // Fill Terms
    if (elements.printTermsList) {
        elements.printTermsList.innerHTML = '';
        // Add dynamic validity term if applicable
        if (elements.documentType) {
            const docType = (elements.documentType.value || "Quotation").toLowerCase();
            elements.printTermsList.innerHTML += `<li>Validity: This ${docType} is valid for 15 days.</li>`;
        }
        
        projectTerms.forEach(term => {
            elements.printTermsList.innerHTML += `<li>${term}</li>`;
        });
    }
}

function togglePreview() {
    if (quotationItems.length === 0) {
        alert("Please add items to preview quotation.");
        return;
    }

    if (!validateFormBeforePrint()) {
        return;
    }

    updatePrintView();

    // Show Inline
    elements.printableArea.style.display = 'block';

    // Scroll to it
    elements.printableArea.scrollIntoView({ behavior: 'smooth' });
}

function hidePreview() {
    elements.printableArea.style.display = 'none';
}


// 8. PDF Generation (Native Browser Print)
function generatePDF() {
    if (quotationItems.length === 0) {
        alert("No items to generate quotation.");
        return;
    }

    if (!validateFormBeforePrint()) {
        return;
    }

    updatePrintView(); // Ensure data is fresh

    // We rely on @media print CSS to hide everything else and show only the quotation.
    // The browser's native print dialog will appear.
    // User can select "Save as PDF" from there.

    window.print();
}
