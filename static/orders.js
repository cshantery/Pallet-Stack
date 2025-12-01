document.addEventListener('DOMContentLoaded', ()=> {
    const order_table = document.getElementById('orderTableBody');
    const modal = document.getElementById('universalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const delete_orders_button = document.getElementById('deleteOrdersButton');
    let modalConfirmBtn = document.getElementById('modalConfirmBtn');
    let modalCancelBtn = document.getElementById('modalCancelBtn');
    let modalCloseBtn = document.getElementById('modalCloseBtn');


    const closeModal = () => {
        modal.classList.remove('active');
        modalBody.innerHTML = ''; // Clear the body to remove old forms
        
        // Find any form that was in the modal and remove its submit listener
        const oldForm = document.getElementById('modal-form');
        if (oldForm) {
            oldForm.removeEventListener('submit', handleAddSubmit);
            oldForm.removeEventListener('submit', submitUpdate);
        }
    };


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
        async function deleteOrders(orderID) {
        try {
            const response = await fetch(`/api/order/${orderID}`, {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' }
            });
            const result = await response.json();
            if (response.ok) {
                console.log("Delete success", result.message);
                closeModal();
                fetchOrder();
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


    async function fetchOrder(){

        try{
            const response = await fetch('/api/order');
            const data = await response.json();
            order_table.innerHTML = '';
            data.forEach(data=> {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${data.Order_ID}</td>
                    <td>${data.Pallet_ID}</td>
                    <td>${data.Customer_ID}</td>
                    <td>${data.Order_Date}</td>
                    <td>${data.Quantity}</td>
                    <td>${data.Order_Price}</td>
                    <td>${data.Order_Status}</td>
                `;


                row.addEventListener('click', ()=>{
                    const content = createViewDetailsHTML(data);
                    openModal('Order Details', content, 'Edit', () => openEditModal(data));

                    const deleteOrderBtn = document.getElementById('deleteItemBtn');
                    if (deleteOrderBtn) {
                        deleteOrderBtn.addEventListener('click', () => {
                            deleteOrders(data.Order_ID);
      });
    }

                });

                order_table.appendChild(row);


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
    
    function createViewDetailsHTML(p){
        return `
      

            
            <div class = "item-details">
                <p><strong>Order ID: </strong>${p.Order_ID}</p>
                <p><strong>Pallet_ID: </strong>${p.Pallet_ID}</p>
                <p><strong>Customer_ID: </strong>${p.Customer_ID}</p>
                <p><strong>Order_Datet: </strong>${p.Order_Date}</p>
                <p><strong>Quantity: </strong>${p.Quantity}</p>
                <p><strong>Order_Price: </strong>${p.Order_Price}</p>
                <p><strong>Order_Status: </strong>${p.Order_Status}</p>
            <div/>


                    
        `;
    }


    function openEditModal(data){
        const editFormHTML = `
            <form id = "modal-form" class="modal-form" data-id = "${data.Order_ID}">

                <label for = "pallet_id">Pallet ID:</label>
                <input type = "text" id = "pallet_id" name = "pallet_id" value = "${data.Pallet_ID}"required>

                <label for = "customer_id">Customer ID:</label>
                <input type = "text" id = "customer_id" name = "customer_id" value = "${data.Customer_ID}"required>

                <label for = "order_date">Order Date:</label>
                <input type = "Date" id = "order_date" name = "order_date" value = "${data.Order_Date}" required>

                <label for = "quantity">Quantity:</label>
                <input type = "number" id = "quantity" name = "quantity" value = "${data.Quantity}" required>
                
                <label for = "order_price">Order Price:</label>
                <input type = "number" id = "order_price" name = "order_price" value = "${data.Order_Price}" required>

                <label for="order_status">Order_Status</label>
                <select id = "order_status" name = "order_status" required>
                <option value = "hold" ${data.Order_Status === 'hold' ? 'selected' : ''}>Hold</option>
                <option value = "processing" ${data.Invoice_Status === 'processing' ? 'selected' : ''}>Processing</option>
                <option value = "shipped" ${data.Invoice_Status === 'shipped' ? 'selected' : ''}>Shipped</option>
                <option value = "Delivered" ${data.Invoice_Status === 'delivered' ? 'selected' : ''}>Delivered</option>

            </form>
        `;

        openModal(' Edit Order Form', editFormHTML, 'Save Changes', () =>{
            const editForm = document.getElementById('modal-form');
            if(editForm) editForm.requestSubmit();
        });

        const editForm = document.getElementById('modal-form');
        if(editForm) editForm.addEventListener('submit', submitUpdate);
    }



    const submitUpdate = async (event) => {
        event.preventDefault();

        const editForm = event.target;
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());
        const orderID = editForm.dataset.id;

        try{
            const response = await fetch(`/api/order/${orderID}`, {
                method: 'PUT',
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if(response.ok){
                console.log("update success", result.message);

                
                closeModal();
                fetchOrder();
        
            } else {
                console.error('error from server', result.error);
                alert(`error: ${result.error}`);
            }
        } catch (error){
            console.error('error', result.error);
            alert(`error: ${result.error}`);
        }
    };

// 1. SEARCH BAR LOGIC
// REFACTORED: SEARCH BAR LOGIC
const searchOrderBtn = document.getElementById('searchOrdersButton'); 
const orderSearchInput = document.getElementById('orderSearchInput');

function filterOrderTable() {
    // Now orderSearchInput is properly defined
    const query = orderSearchInput.value.toLowerCase();
    const rows = document.querySelectorAll('#orderTableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        // Toggle visibility based on match
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

// Event listener for the search button
// Now searchOrderBtn is properly defined - Khai
if (searchOrderBtn) {
    searchOrderBtn.addEventListener('click', filterOrderTable);
}

// Add keyup listener to filter as the user types or clear the filter
if (orderSearchInput) {
    orderSearchInput.addEventListener('keyup', filterOrderTable);
}

// 2. CREATE ORDER BUTTON LOGIC
const createOrderBtn = document.getElementById('createOrderButton');

const addOrderFormHTML = `
    <form id="modal-form" class="modal-form">

        <label for="pallet_id">Pallet ID</label>
        <select id = "pallet_id" name = "pallet_id" required>
            <option value = ""> Select Pallet -- </option>
        </select>

        <label for="customer_id">Customer ID</label>
        <select id = "customer_id" name = "customer_id" required>
            <option value = ""> Select Customer -- </option>
        </select>

        <label for="order_date">Date:</label>
        <input type="date" id = "order_date" name="order_date" required>

        <label for="quantity">Quantity:</label>
        <input type="number"    id = "quantity" name="quantity" required>
        
        <label for="price">Price:</label>
        <input type="text" id="price" name="price" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*">

        <label for="order_status">Order_Status</label>
                <select id = "order_status" name = "order_status" required>
                    <option value = "Hold" }>Hold</option>
                    <option value = "Processing" }>Processing</option>
                    <option value = "shipped" }>Shipped</option>
                    <option value = "Delivered" }>Delivered</option>

    </form>
`;


    async function populatePalletDropdown(){
        const select = document.getElementById('pallet_id');
        select.innerHTML = `<option value="">-- Select Pallet --</option>`;

        try {
            const response = await fetch('/api/inventory');  
            const orders = await response.json();

            orders.forEach(p => {
                const option = document.createElement('option');
                option.value = p.Pallet_ID;
                option.textContent = `Pallet ID: ${p.Pallet_ID} - Size: ${p.Size} - Condition: ${p.Pallet_Condition}`;

                select.appendChild(option);
            });

        } catch(err){
            console.error("Error loading pallets:", err);
        }
    }


        async function populateCustomerDropdown(){
        const select = document.getElementById('customer_id');
        select.innerHTML = `<option value="">-- Select Customer --</option>`;

        try {
            const response = await fetch('/api/customers');  
            const orders = await response.json();

            orders.forEach(c => {
                const option = document.createElement('option');
                option.value = c.Customer_ID;
                option.textContent = `Customer ID: ${c.Customer_ID} - Customer_Name: ${c.Customer_Name}`;

                select.appendChild(option);
            });

        } catch(err){
            console.error("Error loading customers:", err);
        }
    }


const handleAddSubmit =  async (event) => {
        event.preventDefault();

        const addForm = event.target;
        const formData = new FormData(addForm);
        const data = Object.fromEntries(formData.entries());

        console.log("sending form.");

        try{
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if(response.ok){
                console.log("success", result.message);

                
                closeModal();
                fetchOrder();
                addForm.reset();
            } else {
                console.error('Error from server', result.error);
                alert(`error: ${result.error}`);
            }
        } catch (error){
            console.error('Error', result.error);
            alert(`error: ${result.error}`);
        }
    };

createOrderBtn.addEventListener('click', () => {
    // Define what happens when user clicks "Confirm" in the modal
    const submitAction = () => {
        const form = document.getElementById('modal-form');
        if(form) {
            // We tell the form to submit, which triggers the 'handleAddSubmit' listener
            form.requestSubmit();
        }
    };

    openModal('Create New Order', addOrderFormHTML, 'Create Order', submitAction);
    populatePalletDropdown();
    populateCustomerDropdown();
    // After opening the modal, we add the submit listener to the new form
    const addForm = document.getElementById('modal-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddSubmit);
    }
});
    modalCancelBtn.addEventListener('click', closeModal);

    fetchOrder();
    

});

