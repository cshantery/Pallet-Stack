document.addEventListener('DOMContentLoaded', ()=>{
    const invoice_table = document.getElementById('invoiceTableBody');
    const add_invoice_button = document.getElementById('AddInvoiceButton');
    const search_invoice_button = document.getElementById('searchInvoicesButton');
    const search_input = document.getElementById('invoiceSearchInput');
    const search_type = document.getElementById('invoiceSearchType');
    const print_invoice_button = document.getElementById('printInvoiceButton');
    const modal = document.getElementById('universalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    let modalConfirmBtn = document.getElementById('modalConfirmBtn');
    let modalCancelBtn = document.getElementById('modalCancelBtn');
 


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

    
    async function fetchInvoice(params = null) {
        try{
            let url = '/api/invoices';

            if (params) {
                const queryString = new URLSearchParams(params).toString();
                url += `?${queryString}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            invoice_table.innerHTML = '';
            data.forEach(data=> {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${data.Invoice_ID}</td>
                    <td>${data.Customer_ID}</td>
                    <td>${data.Customer_Name}</td>
                    <td>${data.Order_ID}</td>
                    <td>${data.Invoice_Status}</td>
                `;
                

                row.addEventListener('click', ()=>{
                    const content = createViewDetailsHTML(data);
                    openModal(' Invoice Details', content, "Edit", () => {
                        openEditInvoiceModal(data);});
                        
                    const deleteItemBtn = document.getElementById('deleteItemBtn');
                    if (deleteItemBtn) {
                        deleteItemBtn.addEventListener('click', () => {
                            deleteInventoryItem(data.Invoice_ID);
      });
    }
               
                });

                invoice_table.appendChild(row);
            });


        } catch(error){
            console.error('Error fetching data: ', error)
        }
    }

    async function deleteInvoiceItem(invoiceID) {
        try {
            const response = await fetch(`/api/invoices/${invoiceID}`, {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' }
            });
            const result = await response.json();
            if (response.ok) {
                console.log("Delete success", result.message);
                closeModal();
                fetchInvoice();
            } 
            else {
                console.error("Error from server", result.message);
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error("Error deleting", error);
            alert("Error");
  }
}
    window.addEventListener('click', (event)=> {
        if(event.target == modal){
            closeModal();
        }
    });

    const addInvoiceFormHTML =
         `
        <form id="modal-form" class="modal-form">
                <label for="customer_id">Customer ID</label>
                <input type="text" id="customer_id" name="customer_id" step="1" readonly required>

                <label for="customer_name">Customer Name</label>
                <input type="text" id="customer_name" name="customer_name" step="1" readonly required>
            
                <label for="order_id">Order ID</label>
                <select id = "order_id" name = "order_id" required>
                    <option value = ""> Select Order -- </option>
                </select>

                <label for="invoice_status">Invoice Status</label>
                <select id = "invoice_status" name = "invoice_status" required>
                    <option value = "outstanding" }>Outstanding</option>
                    <option value = "paid" }>Paid</option>
        </form>
    `;

    async function populateOrderDropdown(){
        const select = document.getElementById('order_id');
        select.innerHTML = `<option value="">-- Select Order --</option>`;

        try {
            const response = await fetch('/api/order');  
            const orders = await response.json();

            orders.forEach(o => {
                const option = document.createElement('option');
                option.value = o.Order_ID;
                option.textContent = `Order ID: ${o.Order_ID} — Name: ${o.Customer_Name}`;

                select.appendChild(option);
            });

        } catch(err){
            console.error("Error loading orders:", err);
        }
    }



    async function onOrderSelect(event){
        const order_id = event.target.value;

        if (!order_id) {
            document.getElementById('customer_id').value = '';
            document.getElementById('customer_name').value = '';
            return;
        }

        try {
            const response = await fetch(`/api/order/${order_id}`);  
            const order = await response.json();

            document.getElementById('customer_id').value = order.Customer_ID;

            document.getElementById('customer_name').value = order.Customer_Name ?? '';

        } catch(err){
            console.error("Error fetching order details:", err);
        }
    }



    function createViewDetailsHTML(p){
        return `
            <div class = "item-details">
                <p><strong>Invoice ID: </strong>${p.Invoice_ID}</p>
                <p><strong>Customer ID: </strong>${p.Customer_ID}</p>
                <p><strong>Customer Name: </strong>${p.Customer_Name}</p>
                <p><strong>Order ID: </strong>${p.Order_ID}</p>
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

        // Attach form submission
        const addForm = document.getElementById('modal-form');
        if (addForm) {
            addForm.addEventListener('submit', handleAddSubmit);
        }

        
        populateOrderDropdown();

        const orderSelect = document.getElementById('order_id');
        orderSelect.addEventListener('change', onOrderSelect);

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



    function openEditInvoiceModal(data){
        const editInvoiceFormHTML = `
            <form id = "modal-form" class="modal-form" data-id = "${data.Invoice_ID}">

                <label for = "customer_id">Customer ID:</label>
                <input type = "text" id = "customer_id" name = "customer_id" value = "${data.Customer_ID}"required>

                <label for = "customer_name">Customer Name:</label>
                <input type = "text" id = "customer_name" name = "customer_name" value = "${data.Customer_Name}"required>

                <label for = "order_id">Order ID:</label>
                <input type = "text" id = "order_id" name = "order_id" value = "${data.Order_ID}"required>


                <label for = "status">Status:</label>
                <select id = "invoice_status" name = "invoice_status" required>
                    <option value = "outstanding" ${data.Invoice_Status === 'outstanding' ? 'selected' : ''}>Outstanding</option>
                    <option value = "paid" ${data.Invoice_Status === 'paid' ? 'selected' : ''}>Paid</option>
            </form>
        `;

        openModal('Edit Invoice Form', editInvoiceFormHTML, 'Save Changes', () =>{
            const editInvoiceForm = document.getElementById('modal-form');
            if(editInvoiceForm) editInvoiceForm.requestSubmit();
        });

        const editInvoiceForm = document.getElementById('modal-form');
        if(editInvoiceForm) editInvoiceForm.addEventListener('submit', submitInvoiceUpdate);
    }

    //modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);

    search_invoice_button.addEventListener("click", () => {
        const query = search_input.value.trim();
        
        let params = {}

        if (search_type.value === "invoice" &&  query !== '') params.invoice_id = query;
        if (search_type.value === "customer"  &&  query !== '') params.customer_id = query;
        if (search_type.value === "order"  &&  query !== '') params.order_id = query;
        
        fetchInvoice(params);
    });




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

            const result = await response.json();

            if(response.ok){
                console.log("update success", result.message);

                
                closeModal();
                fetchInvoice();
            //editForm.reset();
            } else {
                console.error('error from server', result.error);
                alert(`error: ${result.error}`);
            }
        } catch (error){
            console.error('error', result.error);
            alert(`error: ${result.error}`);
        }
    };
    fetchInvoice();
});