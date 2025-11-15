document.addEventListener('DOMContentLoaded', ()=> {
    const pallet_table = document.getElementById('inventoryTableBody');
    const add_inventory_button = document.getElementById('addInventoryButton');
    const search_inventory_button = document.getElementById('searchInventoryButton');
    const delete_inventory_button = document.getElementById('deleteInventoryButton');
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



    async function fetchInventory(search_term = null){
            try{
                let url = '/api/inventory';
            
            // Add the search term as a URL parameter if it exists
                if (search_term) {
                url += `?search=${encodeURIComponent(search_term)}`;
            }

                const response = await fetch(url);
                const data = await response.json();
            
                pallet_table.innerHTML = ''; // Clear the table body
            
            if (data.length === 0) {
                pallet_table.innerHTML = '<tr><td colspan="5">No inventory found.</td></tr>';
                return;
            }

            data.forEach(data=> {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${data.Pallet_ID}</td>
                    <td>${data.Pallet_Condition}</td>
                    <td>${data.Size}</td>
                    <td>${data.Inventory_Count}</td>
                    <td>${data.Price}</td>
                `;


                row.addEventListener('click', ()=>{
                    const content = createViewDetailsHTML(data);
                    openModal('Pallet Details', content, 'Close', closeModal);

                    const editItemBtn = document.getElementById('editItemBtn');
                    if(editItemBtn){
                        editItemBtn.addEventListener('click', () => openEditModal(data));
                    }
                    
                    const deleteItemBtn = document.getElementById('deleteItemBtn');
                    if (deleteItemBtn) {
                        deleteItemBtn.addEventListener('click', () => {
                            deleteInventoryItem(data.Pallet_ID);
      });
    }
});

                pallet_table.appendChild(row);


            });
            
        } catch(error){
            console.error('Error fetching data: ', error)
        }
    }

    async function deleteInventoryItem(palletID) {
        try {
            const response = await fetch(`/api/inventory/${palletID}`, {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' }
            });
            const result = await response.json();
            if (response.ok) {
                console.log("Delete success", result.message);
                closeModal();
                fetchInventory();
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

    const addInventoryFormHTML = `
        <form id = "modal-form" class="modal-form">
            <label for = "pallet_condition">Pallet Condition:</label>
            <select id = "pallet_condition" name = "pallet_condition" required>
                <option value = "new">New Pallet</option>
                <option value = "used">Used Pallet</option>
                <option value = "combo">Combo Pallet</option>
            </select>
           

            <label for = "size">Size:</label>
            <input type = "text" id = "size" name = "size"required>

            <label for = "inventory_count">Inventory Count:</label>
            <input type = "number" id = "inventory_count" name = "inventory_count" value = "1" required>

            <label for = "price">Price/Unit:</label>
            <input type="text" id = "price" name = "price" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*">
        </form>
    `;

    function createViewDetailsHTML(p){
        return `
      

            
            <div class = "item-details">
                <p><strong>Pallet ID: </strong>${p.Pallet_ID}</p>
                <p><strong>Pallet_Condition: </strong>${p.Pallet_Condition}</p>
                <p><strong>Size: </strong>${p.Size}</p>
                <p><strong>Inventory_Count: </strong>${p.Inventory_Count}</p>
                <p><strong>Price: </strong>${p.Price}</p>
            <div/>


                    
        `
    }
    

    function openEditModal(data){
        const editFormHTML = `
            <form id = "modal-form" class="modal-form" data-id = "${data.Pallet_ID}">
                <label for = "pallet_condition">Pallet Condition:</label>
                <select id = "pallet_condition" name = "pallet_condition" required>
                    <option value = "new" ${data.Pallet_Condition === 'new' ? 'selected' : ''}>New Pallet</option>
                    <option value = "used" ${data.Pallet_Condition === 'used' ? 'selected' : ''}>Used Pallet</option>
                    <option value = "combo" ${data.Pallet_Condition === 'combo' ? 'selected' : ''}>Combo Pallet</option>
                </select>
           

                <label for = "size">Size:</label>
                <input type = "text" id = "size" name = "size" value = "${data.Size}"required>

                <label for = "inventory_count">Inventory Count:</label>
                <input type = "number" id = "inventory_count" name = "inventory_count" value = "value="${data.Inventory_Count}"" required>

                <label for = "price">Price/Unit:</label>
                <input type="text" id = "price" name = "price" value = "${data.Price}" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*">
            </form>
        `;

        openModal('editInventoryForm', editFormHTML, 'Save Changes', () =>{
            const editForm = document.getElementById('modal-form');
            if(editForm) editForm.requestSubmit();
        });

        const editForm = document.getElementById('modal-form');
        if(editForm) editForm.addEventListener('submit', submitUpdate);
    }


  
    add_inventory_button.addEventListener('click', () => {
        const addAction = () => {
            const addForm = document.getElementById('modal-form');
            if(addForm){
                addForm.requestSubmit();
            }
        };

        openModal(
            ' Add New Inventory Item',
            addInventoryFormHTML,
            null,
            addAction
        );

        const addForm = document.getElementById('modal-form');
        if (addForm) {
            addForm.addEventListener('submit', handleAddSubmit);
        }

    });


    const submitUpdate = async (event) => {
        event.preventDefault();

        const editForm = event.target;
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());
        const palletID = editForm.dataset.id;

        try{
            const response = await fetch(`/api/inventory/${palletID}`, {
                method: 'PUT',
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if(response.ok){
                console.log("update success", result.message);

                
                closeModal();
                fetchInventory();
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

    const handleAddSubmit =  async (event) => {
        event.preventDefault();

        const addForm = event.target;
        const formData = new FormData(addForm);
        const data = Object.fromEntries(formData.entries());

        console.log("sending form.");

        try{
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if(response.ok){
                console.log("success", result.message);

                
                closeModal();
                fetchInventory();
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

    //modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);

    fetchInventory();
});

// SEARCH INVENTORY LOGIC (Client-Side Filter)
const search_inventory_btn = document.getElementById('searchInventoryButton');
    const inventory_search_input = document.getElementById('inventorySearchInput');

    if(search_inventory_btn){
        search_inventory_btn.addEventListener('click', () => {
            const term = inventory_search_input.value.trim();
            // Call fetchInventory with the search term
            fetchInventory(term);
        });

        // Auto-reset if input is cleared
        inventory_search_input.addEventListener('keyup', (e) => {
            if (e.target.value === '') {
                // Fetch all inventory when search is cleared
                fetchInventory();
            }
        });
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
                fetchInventory();
        
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
    // This line should already exist at the bottom
    fetchInventory();