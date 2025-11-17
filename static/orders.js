document.addEventListener('DOMContentLoaded', ()=> {
    const order_table = document.getElementById('orderTableBody');
    const modal = document.getElementById('universalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
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


async function fetchOrders(params = null){
    
    let url = '/api/order'; // Base URL

    // NEW: If params are provided, build a query string
    if (params) {
        const queryString = new URLSearchParams(params).toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    try{
        const response = await fetch(url); // Fetch from the new URL
        const data = await response.json();
        order_table.innerHTML = '';

        // NEW: Handle empty results
        if (data.length === 0) {
            order_table.innerHTML = '<tr><td colspan="5">No orders found.</td></tr>';
            return;
        }

        data.forEach(data=> {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${data.Order_ID}</td>
                <td>${data.Pallet_ID}</td>
                <td>${data.Customer_ID}</td>
                <td>${data.Order_Date}</td>
                <td>${data.Quantity}</td>
            `;

            row.addEventListener('click', ()=>{
                const content = createViewDetailsHTML(data);
                openModal('Order Details', content, 'Close', closeModal);

                const editItemBtn = document.getElementById('editItemBtn');
                if(editItemBtn){
                    editItemBtn.addEventListener('click', () => openEditModal(data));
                }
            });
            order_table.appendChild(row);
        });
        
    } catch(error){
        console.error('Error fetching data: ', error)
        // NEW: Add error message to table
        order_table.innerHTML = '<tr><td colspan="5">Error loading data.</td></tr>';
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
                <p><strong>Order_Date: </strong>${p.Order_Date}</p>
                <p><strong>Quantity: </strong>${p.Quantity}</p>
            <div/>


                    
        `
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
            </form>
        `;

        openModal('Edit Order Form', editFormHTML, 'Save Changes', () =>{
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
const searchOrderBtn = document.getElementById('searchOrdersButton');
const orderSearchInput = document.getElementById('orderSearchInput');

searchOrderBtn.addEventListener('click', () => {
    const query = orderSearchInput.value.toLowerCase();
    const rows = document.querySelectorAll('#orderTableBody tr');

    rows.forEach(row => {
        // Combine text from all cells in the row for broad search
        const text = row.textContent.toLowerCase();
        // Toggle visibility based on match
        row.style.display = text.includes(query) ? '' : 'none';
    });
});

// 2. CREATE ORDER BUTTON LOGIC
const createOrderBtn = document.getElementById('createOrderButton');

const addOrderFormHTML = `
    <form id="modal-form" class="modal-form">

        <label for="pallet_id">Pallet ID:</label>
        <input type="number" id = "pallet_id" name="pallet_id" required>

        <label for="customer_id">Customer ID:</label>
        <input type="number" id = "customer_id" name="customer_id" required>

        <label for="order_date">Date:</label>
        <input type="date" id = "order_date" name="order_date" required>

        <label for="quantity">Quantity:</label>
        <input type="number"    id = "quantity" name="quantity" required>

    </form>
`;

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
    const submitAction = async () => {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                document.getElementById('universalModal').classList.remove('active');
                // Refresh the page or re-fetch data here
                location.reload(); 
            } else {
                alert("Failed to create order.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Note: You might need to expose openModal globally - Khai
    openModal('Create New Order', addOrderFormHTML, 'Create Order', submitAction);

});
    modalCancelBtn.addEventListener('click', closeModal);

    fetchOrder();

});

