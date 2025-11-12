document.addEventListener('DOMContentLoaded', ()=> {
    const pallet_table = document.getElementById('inventoryTableBody');
    const add_inventory_button = document.getElementById('addInventoryButton');
    const search_inventory_button = document.getElementById('searchInventoryButton');
    const update_inventpry_button = document.getElementById('updateInventoryButton');
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



    async function fetchInventory(){

        try{
            const response = await fetch('/api/inventory');
            const data = await response.json();
            pallet_table.innerHTML = '';
            data.forEach(data=> {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${data.Pallet_ID}</td>
                    <td>${data.Pallet_Condition}</td>
                    <td>${data.Size}</td>
                    <td>${data.Inventory_Count}</td>
                    <td>${data.Price}</td>
                `;

                pallet_table.appendChild(row);
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

    const addInventoryFormHTML = `
        <form id = "modal-form" class="modal-form">
            <label for = "pallet_condition">Pallet Condition:</label>
            <input type ="text" id = "pallet_Condition" name = "pallet_condition" required>

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
                <p><strong>Price: </strong>${p.Price.toFixed(2)}</p>
                    
        `
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

    const handleAddSubmit =  async(event) => {
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

    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);

    fetchInventory();
});