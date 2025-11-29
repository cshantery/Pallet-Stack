document.addEventListener('DOMContentLoaded', () => {
    // get DOM elements
    const pallet_table = document.getElementById('inventoryTableBody');
    const add_inventory_button = document.getElementById('addInventoryButton');
    const search_inventory_button = document.getElementById('searchInventoryButton');
    const inventory_search_input = document.getElementById('inventorySearchInput');
    const delete_inventory_button = document.getElementById('deleteInventoryButton');
    const modal = document.getElementById('universalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    let modalConfirmBtn = document.getElementById('modalConfirmBtn');
    let modalCancelBtn = document.getElementById('modalCancelBtn');
    let modalCloseBtn = document.getElementById('modalCloseBtn');

    // close modal and cleanup form listeners
    const closeModal = () => {
        modal.classList.remove('active');
        modalBody.innerHTML = '';
        const oldForm = document.getElementById('modal-form');
        if (oldForm) {
            oldForm.removeEventListener('submit', handleAddSubmit);
            oldForm.removeEventListener('submit', submitUpdate);
        }
    };

    // open modal with dynamic title, content, and confirm action
    function openModal(title, content, confirmText, confirmAction){
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        const newConfirmBtn = modalConfirmBtn.cloneNode(true);
        if (confirmText) newConfirmBtn.textContent = confirmText;
        newConfirmBtn.addEventListener('click', confirmAction);
        modalConfirmBtn.parentNode.replaceChild(newConfirmBtn, modalConfirmBtn);
        modalConfirmBtn = newConfirmBtn;
        modal.classList.add('active');
    }

    // fetch inventory from API, optionally filtered by search term
    async function fetchInventory(search_term = ''){
        try {
            const url = '/api/inventory' + (search_term ? `?search=${encodeURIComponent(search_term)}` : '');
            const response = await fetch(url);
            const data = await response.json();
            pallet_table.innerHTML = '';
            if (!data.length) {
                pallet_table.innerHTML = '<tr><td colspan="5">No inventory found.</td></tr>';
                return;
            }
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.Pallet_ID}</td>
                    <td>${item.Pallet_Condition}</td>
                    <td>${item.Size}</td>
                    <td>${item.Inventory_Count}</td>
                    <td>${item.Price}</td>
                `;
                row.addEventListener('click', () => {
                    openModal(
                        'Pallet Details',
                        createViewDetailsHTML(item),
                        'Edit',
                        () => openEditModal(item)
                    );
                     const deleteItemBtn = document.getElementById('deleteItemBtn');
                    if (deleteItemBtn) {
                        deleteItemBtn.addEventListener('click', () => {
                            deleteInventoryItem(item.Pallet_ID);
      });
    }
                });
                pallet_table.appendChild(row);
            });
        } catch (error) {
            console.error(error);
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


    // bind search button and auto-clear behavior
    if (search_inventory_button) {
        search_inventory_button.addEventListener('click', () => {
            fetchInventory(inventory_search_input.value.trim());
        });
        inventory_search_input.addEventListener('keyup', e => {
            if (e.target.value === '') fetchInventory();
        });
    }

    // HTML template for add-inventory form
    const addInventoryFormHTML = `
        <form id="modal-form" class="modal-form">
            <label for="pallet_condition">Pallet Condition:</label>
            <select id="pallet_condition" name="pallet_condition" required>
                <option value="new">New Pallet</option>
                <option value="used">Used Pallet</option>
                <option value="combo">Combo Pallet</option>
            </select>
            <label for="size">Size:</label>
            <input type="text" id="size" name="size" required>
            <label for="inventory_count">Inventory Count:</label>
            <input type="number" id="inventory_count" name="inventory_count" value="1" required>
            <label for="price">Price/Unit:</label>
            <input type="text" id="price" name="price" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*">
        </form>
    `;

    // generate HTML for viewing pallet details
    function createViewDetailsHTML(p){
        return `
            <div class="item-details">
                <p><strong>Pallet ID:</strong> ${p.Pallet_ID}</p>
                <p><strong>Condition:</strong> ${p.Pallet_Condition}</p>
                <p><strong>Size:</strong> ${p.Size}</p>
                <p><strong>Count:</strong> ${p.Inventory_Count}</p>
                <p><strong>Price:</strong> ${p.Price}</p>
            </div>
        `;
    }

    // open modal with edit form pre-filled for given pallet
    function openEditModal(data){
        const editFormHTML = `
            <form id="modal-form" class="modal-form" data-id="${data.Pallet_ID}">
                <label for="pallet_condition">Pallet Condition:</label>
                <select id="pallet_condition" name="pallet_condition" required>
                    <option value="new" ${data.Pallet_Condition==='new'?'selected':''}>New Pallet</option>
                    <option value="used" ${data.Pallet_Condition==='used'?'selected':''}>Used Pallet</option>
                    <option value="combo" ${data.Pallet_Condition==='combo'?'selected':''}>Combo Pallet</option>
                </select>
                <label for="size">Size:</label>
                <input type="text" id="size" name="size" value="${data.Size}" required>
                <label for="inventory_count">Inventory Count:</label>
                <input type="number" id="inventory_count" name="inventory_count" value="${data.Inventory_Count}" required>
                <label for="price">Price/Unit:</label>
                <input type="text" id="price" name="price" value="${data.Price}" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*">
            </form>
        `;
        openModal('Edit Inventory Form', editFormHTML, 'Save Changes', () => {
            document.getElementById('modal-form')?.requestSubmit();
        });
        document.getElementById('modal-form')?.addEventListener('submit', submitUpdate);
    }

    // add button shows add-inventory modal and binds its submit
    add_inventory_button.addEventListener('click', () => {
        openModal('Add New Inventory Item', addInventoryFormHTML, null, () => {
            document.getElementById('modal-form')?.requestSubmit();
        });
        document.getElementById('modal-form')?.addEventListener('submit', handleAddSubmit);
    });

    // handle PUT request to update pallet
    const submitUpdate = async event => {
        event.preventDefault();
        const form = event.target;
        const data = Object.fromEntries(new FormData(form).entries());
        const id = form.dataset.id;
        try {
            const res = await fetch(`/api/inventory/${id}`, {
                method: 'PUT',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(data)
            });
            if (res.ok) {
                closeModal();
                fetchInventory();
            } else {
                alert((await res.json()).error);
            }
        } catch {
            alert('Update failed');
        }
    };

    // handle POST request to add new pallet
    const handleAddSubmit = async event => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.target).entries());
        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(data)
            });
            if (res.ok) {
                closeModal();
                fetchInventory();
                event.target.reset();
            } else {
                alert((await res.json()).error);
            }
        } catch {
            alert('Add failed');
        }
    };

    // close modal when clicking outside or cancel button
    window.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });
    modalCancelBtn?.addEventListener('click', closeModal);

    // initial data load
    fetchInventory();
});
