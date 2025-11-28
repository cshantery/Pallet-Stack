document.addEventListener('DOMContentLoaded', () => {
    // 1. GET DOM ELEMENTS
    const order_table = document.getElementById('orderTableBody');
    const modal = document.getElementById('universalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // Modal Buttons
    let modalConfirmBtn = document.getElementById('modalConfirmBtn');
    let modalCancelBtn = document.getElementById('modalCancelBtn');
    
    // Search Elements
    const searchOrderBtn = document.getElementById('searchOrdersButton'); 
    const orderSearchInput = document.getElementById('orderSearchInput');
    const createOrderBtn = document.getElementById('createOrderButton');

    // 2. MODAL FUNCTIONS

    const closeModal = () => {
        modal.classList.remove('active');
        modalBody.innerHTML = ''; 
        const oldForm = document.getElementById('modal-form');
        if (oldForm) {
            oldForm.removeEventListener('submit', handleAddSubmit);
            oldForm.removeEventListener('submit', submitUpdate);
        }
    };

    function openModal(title, content, confirmText, confirmAction){
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

    // 3. API & TABLE LOGIC

    async function fetchOrder(){
        try{
            const response = await fetch('/api/order');
            const data = await response.json();
            order_table.innerHTML = '';
            
            if (!data.length) {
                order_table.innerHTML = '<tr><td colspan="6">No orders found.</td></tr>';
                return;
            }

            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.Order_ID}</td>
                    <td>${item.Pallet_ID}</td>
                    <td>${item.Customer_ID}</td>
                    <td>${item.Order_Date}</td>
                    <td>${item.Quantity}</td>
                    <td>${item.Order_Price}</td>
                `;

                row.addEventListener('click', () => {
                    const deleteBtn = openModal(
                        'Order Details', 
                        createViewDetailsHTML(item), 
                        'Edit', 
                        () => openEditModal(item)
                    );

                    deleteBtn.style.display = 'block';
                    deleteBtn.addEventListener('click', () => {
                        deleteInventoryItem(item.Order_ID);
                    });
                });
                order_table.appendChild(row);
            });
        } catch(error){
            console.error('Error fetching data: ', error);
        }
    }

    async function deleteInventoryItem(orderID) {
        if(!confirm("Are you sure you want to delete this order?")) return;

        try {
            const response = await fetch(`/api/order/${orderID}`, {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' }
            });
            const result = await response.json();
            if (response.ok) {
                closeModal();
                fetchOrder();
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error("Error deleting", error);
            alert("Error deleting order");
        }
    }

    // 4. TEMPLATES & FORMS

    function createViewDetailsHTML(p){
        return `
            <div class = "item-details">
                <p><strong>Order ID: </strong>${p.Order_ID}</p>
                <p><strong>Pallet ID: </strong>${p.Pallet_ID}</p>
                <p><strong>Customer ID: </strong>${p.Customer_ID}</p>
                <p><strong>Order Date: </strong>${p.Order_Date}</p>
                <p><strong>Quantity: </strong>${p.Quantity}</p>
                <p><strong>Order Price: </strong>${p.Order_Price}</p>
            </div>
        `;
    }

    function openEditModal(data){
        const editFormHTML = `
            <form id="modal-form" class="modal-form" data-id="${data.Order_ID}">
                <label for="pallet_id">Pallet ID:</label>
                <input type="text" id="pallet_id" name="pallet_id" value="${data.Pallet_ID}" required>
                <label for="customer_id">Customer ID:</label>
                <input type="text" id="customer_id" name="customer_id" value="${data.Customer_ID}" required>
                <label for="order_date">Order Date:</label>
                <input type="Date" id="order_date" name="order_date" value="${data.Order_Date}" required>
                <label for="quantity">Quantity:</label>
                <input type="number" id="quantity" name="quantity" value="${data.Quantity}" required>
                <label for="order_price">Order Price:</label>
                <input type="number" id="order_price" name="order_price" value="${data.Order_Price}" required>
            </form>
        `;
        openModal('Edit Order Form', editFormHTML, 'Save Changes', () => {
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
            if(response.ok){
                closeModal();
                fetchOrder();
            } else {
                const result = await response.json();
                alert(`error: ${result.error}`);
            }
        } catch (error){
            console.error('error', error);
            alert(`Update failed`);
        }
    };

    const addOrderFormHTML = `
        <form id="modal-form" class="modal-form">
            <label for="pallet_id">Pallet ID:</label>
            <input type="number" id="pallet_id" name="pallet_id" required>
            <label for="customer_id">Customer ID:</label>
            <input type="number" id="customer_id" name="customer_id" required>
            <label for="order_date">Date:</label>
            <input type="date" id="order_date" name="order_date" required>
            <label for="quantity">Quantity:</label>
            <input type="number" id="quantity" name="quantity" required>
            <label for="order_price">Price:</label>
            <input type="number" id="order_price" name="price" required>
        </form>
    `;

    const handleAddSubmit = async (event) => {
        event.preventDefault();
        const addForm = event.target;
        const formData = new FormData(addForm);
        const data = Object.fromEntries(formData.entries());

        try{
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if(response.ok){
                closeModal();
                fetchOrder();
                addForm.reset();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error){
            console.error('Error', error);
            alert(`Creation failed`);
        }
    };

    // 5. EVENT LISTENERS

    if (createOrderBtn) {
        createOrderBtn.addEventListener('click', () => {
            const submitAction = () => {
                const form = document.getElementById('modal-form');
                if(form) form.requestSubmit();
            };
            openModal('Create New Order', addOrderFormHTML, 'Create Order', submitAction);
            const addForm = document.getElementById('modal-form');
            if (addForm) addForm.addEventListener('submit', handleAddSubmit);
        });
    }

    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event)=> {
        if(event.target == modal) closeModal();
    });

    // SEARCH LOGIC
    function filterOrderTable() {
        if (!orderSearchInput) return;
        const query = orderSearchInput.value.toLowerCase();
        const rows = document.querySelectorAll('#orderTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    }

    if (searchOrderBtn) searchOrderBtn.addEventListener('click', filterOrderTable);
    if (orderSearchInput) orderSearchInput.addEventListener('keyup', filterOrderTable);

    fetchOrder();
});