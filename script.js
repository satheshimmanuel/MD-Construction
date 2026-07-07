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
    customerGst: document.getElementById('customerGst'),
    projectLocation: document.getElementById('projectLocation'),
    customerPincode: document.getElementById('customerPincode'),
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
    const today = new Date().toISOString().split('T')[0];
    elements.quotationDate.value = today;
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
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addItem();
        });
    });
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
    const workType = elements.workTypeInput.value;
    const material = elements.materialInput.value;
    const floor = elements.floorInput.value || "-";
    const sqFt = parseFloat(elements.sqFtInput.value);
    const rate = parseFloat(elements.rateInput.value);

    // Validation
    if (!workType || !material) {
        alert("Please select both Work Type and Material.");
        return;
    }
    if (!sqFt || sqFt <= 0) {
        alert("Please enter a valid Square Feet value.");
        return;
    }
    if (!rate || rate <= 0) {
        alert("Please enter a valid Rate.");
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
    elements.printDate.textContent = elements.quotationDate.value;
    elements.printEstTime.textContent = elements.estTime.value || "TBD";

    elements.printCustomerName.textContent = elements.customerName.value || "Valued Customer";
    
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

    // New Fields in Body
    const printCustomerPhone = document.getElementById('printCustomerPhone');
    if (printCustomerPhone) printCustomerPhone.textContent = elements.customerPhone.value || "-";

    elements.printCustomerId.textContent = elements.customerId.value || "-";
    elements.printCustomerGst.textContent = elements.customerGst.value || "-";

    elements.printProject.textContent = elements.projectLocation.value || "Site Location";
    const printCustomerPincode = document.getElementById('printCustomerPincode');
    if (printCustomerPincode) printCustomerPincode.textContent = elements.customerPincode.value ? ` - ${elements.customerPincode.value}` : "";

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

    updatePrintView(); // Ensure data is fresh

    // We rely on @media print CSS to hide everything else and show only the quotation.
    // The br owser's native print dialog will appear.
    // User can select "Save as PDF" from there.

    window.print();
}
