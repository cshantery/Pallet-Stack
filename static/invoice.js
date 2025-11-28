document.addEventListener('DOMContentLoaded', () => {
    // 1. GET DOM ELEMENTS
    const invoice_table = document.getElementById('invoiceTableBody');
    const add_invoice_button = document.getElementById('AddInvoiceButton');
    const search_invoice_button = document.getElementById('searchInvoicesButton');
    const search_input = document.getElementById('invoiceSearchInput');
    const search_type = document.getElementById('invoiceSearchType');
    
    // Modal Elements
    const modal = document.getElementById('universalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    let modalConfirmBtn = document.getElementById('modalConfirmBtn');
    let modalCancelBtn = document.getElementById('modalCancelBtn');

    // 2. MODAL FUNCTIONS

    function openModal(title, content, confirmText, confirmAction) {
        modalTitle.textContent = title;
        modalBody.innerHTML = content;

        // Reset Confirm Button
        const newConfirmBtn = modalConfirmBtn.cloneNode(true);
        if (confirmText) newConfirmBtn.textContent = confirmText;
        newConfirmBtn.addEventListener('click', confirmAction);
        modalConfirmBtn.parentNode.replaceChild(newConfirmBtn, modalConfirmBtn);
        modalConfirmBtn = newConfirmBtn;

        // Reset Delete Button
        const deleteBtn = document.getElementById('deleteItemBtn');
        const newDeleteBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        newDeleteBtn.style.display = 'none'; 

        modal.classList.add('active');
        return newDeleteBtn; 
    }

    const closeModal = () => {
        modal.classList.remove('active');
        modalBody.innerHTML = ''; 
        const oldForm = document.getElementById('modal-form');
        if (oldForm) {
            oldForm.removeEventListener('submit', handleAddSubmit);
        }
    };

    // 3. API & TABLE LOGIC

    async function fetchInvoice(params = null) {
        try {
            let url = '/api/invoices';
            if (params) {
                const queryString = new URLSearchParams(params).toString();
                url += `?${queryString}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            invoice_table.innerHTML = '';

            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.Invoice_ID}</td>
                    <td>${item.Customer_ID}</td>
                    <td>${item.Order_ID}</td>
                    <td>${item.Invoice_Status}</td>
                `;

                row.addEventListener('click', () => {
                    const content = createViewDetailsHTML(item);
                    const deleteBtn = openModal(
                        'Invoice Details', 
                        content, 
                        "Edit", 
                        () => openEditInvoiceModal(item)
                    );
                    
                    deleteBtn.style.display = 'block';
                    deleteBtn.addEventListener('click', () => {
                        if(confirm("Delete this invoice?")) {
                            deleteInventoryItem(item.Invoice_ID);
                        }
                    });
                });
                invoice_table.appendChild(row);
            });
        } catch(error) {
            console.error('Error fetching data: ', error);
        }
    }

    async function deleteInventoryItem(invoiceID) {
        try {
            const response = await fetch(`/api/invoices/${invoiceID}`, {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' }
            });
            const result = await response.json();
            if (response.ok) {
                closeModal();
                fetchInvoice();
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error("Error deleting", error);
            alert("Delete failed");
        }
    }

    window.addEventListener('click', (event)=> {
        if(event.target == modal) closeModal();
    });
    if(modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);


    // 4. TEMPLATES & FORMS

    const addInvoiceFormHTML = `
        <form id="modal-form" class="modal-form">
                <label for="customer_id">Customer ID</label>
                <input type="number" id="customer_id" name="customer_id" step="1" required>
                <label for="order_id">Order ID</label>
                <input type="number" id="order_id" name="order_id" step="1" required>
                <label for="invoice_status">Invoice Status</label>
                <select id="invoice_status" name="invoice_status" required>
                    <option value="outstanding">Outstanding</option>
                    <option value="paid">Paid</option>
                </select>
        </form>
    `;

    function createViewDetailsHTML(p){
        return `
            <div class="item-details">
                <p><strong>Invoice ID: </strong>${p.Invoice_ID}</p>
                <p><strong>Customer ID: </strong>${p.Customer_ID}</p>
                <p><strong>Order ID: </strong>${p.Order_ID}</p>
                <p><strong>Status: </strong>${p.Invoice_Status}</p>
            </div>   
        `;
    }

    if (add_invoice_button) {
        add_invoice_button.addEventListener('click', () => {
            const addAction = () => {
                const addForm = document.getElementById('modal-form');
                if(addForm) addForm.requestSubmit();
            };

            openModal('Add New Invoice Item', addInvoiceFormHTML, 'Create Invoice', addAction);
            const addForm = document.getElementById('modal-form');
            if (addForm) addForm.addEventListener('submit', handleAddSubmit);
        });
    }

    const handleAddSubmit = async(event) => {
        event.preventDefault();
        const addForm = event.target;
        const formData = new FormData(addForm);
        const data = Object.fromEntries(formData.entries());

        try{
            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if(response.ok){
                closeModal();
                fetchInvoice();
                addForm.reset();
            } else {
                alert(`error: ${result.error}`);
            }
        } catch (error){
            console.error('error', error);
            alert(`Add failed`);
        }
    };

    function openEditInvoiceModal(data){
        const editInvoiceFormHTML = `
            <form id="modal-form" class="modal-form" data-id="${data.Invoice_ID}">
                <label for="customer_id">Customer ID:</label>
                <input type="text" id="customer_id" name="customer_id" value="${data.Customer_ID}" required>
                <label for="order_id">Order ID:</label>
                <input type="text" id="order_id" name="order_id" value="${data.Order_ID}" required>
                <label for="invoice_status">Status:</label>
                <select id="invoice_status" name="invoice_status" required>
                    <option value="outstanding" ${data.Invoice_Status === 'outstanding' ? 'selected' : ''}>Outstanding</option>
                    <option value="paid" ${data.Invoice_Status === 'paid' ? 'selected' : ''}>Paid</option>
                </select>
            </form>
        `;
        openModal('Edit Invoice Form', editInvoiceFormHTML, 'Save Changes', () =>{
            const editInvoiceForm = document.getElementById('modal-form');
            if(editInvoiceForm) editInvoiceForm.requestSubmit();
        });
        const editInvoiceForm = document.getElementById('modal-form');
        if(editInvoiceForm) editInvoiceForm.addEventListener('submit', submitInvoiceUpdate);
    }

    const submitInvoiceUpdate = async (event) => {
        event.preventDefault();
        const editForm = event.target;
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());
        const invoiceID = editForm.dataset.id;

        try{
            const response = await fetch(`/api/invoices/${invoiceID}`, {
                method: 'PUT',
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(data)
            });
            if(response.ok){
                closeModal();
                fetchInvoice();
            } else {
                const result = await response.json();
                alert(`error: ${result.error}`);
            }
        } catch (error){
            console.error('error', error);
            alert(`Update failed`);
        }
    };

    if (search_invoice_button) {
        search_invoice_button.addEventListener("click", () => {
            const query = search_input.value.trim();
            let params = {};
            if (search_type.value === "invoice" && query !== '') params.invoice_id = query;
            if (search_type.value === "customer" && query !== '') params.customer_id = query;
            if (search_type.value === "order" && query !== '') params.order_id = query;
            fetchInvoice(params);
        });
    }

    fetchInvoice();
});