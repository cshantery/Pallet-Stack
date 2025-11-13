document.addEventListener('DOMContentLoaded', ()=>{
    const invoice_table = document.getElementById('invoiceTableBody');
    const add_invoice_button = document.getElementById('AddInvoiceButton');
    const search_invoice_button = document.getElementById('searchInvoiceButton');
    const print_invoice_button = document.getElementById('printInvoiceButton');
    const modal = document.getElementById('universalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    let modalConfirmBtn = document.getElementById('modalConfirmBtn');
    let modalCancelBtn = document.getElementById('modalCancelBtn');
    let modalCloseBtn = document.getElementById('modalCloseBtn');

    function openModal(title, content, confirmText, confirmAction){
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        const newConfirmBtn = modalConfirmBtn.cloneNode(true);

        if (confirmText) {
        newConfirmBtn.textContent = confirmText;
        }

        newConfirmBtn.addEventListener('click', confirmAction);
        modalConfirmBtn.parentNode.replaceChild(newConfirmBtn, modalConfirmBtn);
        modalConfirmBtn = newConfirmBtn;



        modal.classList.add('active');
    }

    const closeModal = () => {
        modal.classList.remove('active');
        modalBody.innerHTML = ''; // Clear the body to remove old forms
        
        // Find any form that was in the modal and remove its submit listener
        const oldForm = document.getElementById('modal-form');
        if (oldForm) {
            oldForm.removeEventListener('submit', handleAddSubmit);
        }
    };

    
    async function fetchInvoice() {
        try{
            const response = await fetch('/api/invoice');
            const data = await response.json();
            invoice_table.innerHTML = '';
            data.forEach(data=> {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${data.Invoice_ID}</td>
                    <td>${data.Customer_ID}</td>
                    <td>${data.Order_ID}</td>
                    <td>${data.Order_Price}</td>
                    <td>${data.Invoice_Status}</td>
                `;
                
                invoice_table.appendChild(row);
            });
        } catch(error){
            console.error('Error fetching data: ', error)
        }
    }
    window.addEventListener('click', (event)=> {
        if(event.target == modal){
            closeModal();
        }
    });

    const addInvoiceFormHTML = `
        <form id="modal-form" class="modal-form">
                <label for="customer_id">Customer ID</label>
                <input type="number" id="customer_id" name="customer_id" step="1" required>
            
                <label for="order_id">Order ID</label>
                <input type="number" id="order_id" name="order_id" step="1" required>

                <label for="order_price">Order Price</label>
                <input type="number" id="order_price" name="order_price" required>

                <label for="invoice_status">Invoice Status</label>
                <input type="text" id="invoice_status" name="invoice_status" required>
        </form>
    `;

    function createViewDetailsHTML(p){
        return `
            <div class = "item-details">
                <p><strong>Invoice ID: </strong>${p.Invoice_ID}</p>
                <p><strong>Customer ID: </strong>${p.Customer_ID}</p>
                <p><strong>Order ID: </strong>${p.Order_ID}</p>
                <p><strong>Order_Price: </strong>${p.Order_Price}</p>
                <p><strong>Status: </strong>${p.Invoice_Status}</p>
                    
        `
    }

    add_invoice_button.addEventListener('click', () => {
        const addAction = () => {
            const addForm = document.getElementById('modal-form');
            if(addForm){
                addForm.requestSubmit();
            }
        };

        openModal(
            ' Add New Invoice Item',
            addInvoiceFormHTML,
            null,
            addAction
        );

        const addForm = document.getElementById('modal-form');
        if (addForm) {
            addForm.addEventListener('submit', handleAddSubmit);
        }

    });

    const handleAddSubmit =  async(event) => {
        event.preventDefault();

        const addForm = event.target;
        const formData = new FormData(addForm);
        const data = Object.fromEntries(formData.entries());

        console.log("sending form.");

        try{
            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if(response.ok){
                console.log("success", result.message);

                
                closeModal();
                fetchInvoice();
                addForm.reset();
            } else {
                console.error('error from server', result.error);
                alert(`error: ${result.error}`);
            }
        } catch (error){
            console.error('error', result.error);
            alert(`error: ${result.error}`);
        }
    };

    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);

    fetchInvoice();
});