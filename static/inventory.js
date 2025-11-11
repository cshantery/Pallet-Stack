document.addEventListener('DOMContentLoaded', ()=> {
    const pallet_table = document.getElementById('inventoryTableBody');
    const add_inventory_button = document.getElementById('addInventoryButton');
    const search_inventory = document.getElementById('searchInventoryButton');
    const update_inventpry = document.getElementById('updateInventoryButton');
    const delete_inventory = document.getElementById('deleteInventoryButton');
    const inventory_form = document.getElementById('addInventoryModal');
    const closeBtn = document.querySelector('.close-button');
    const addForm = document.getElementById('addInventoryForm');

    function openModal(){
        inventory_form.style.display = 'flex';
    }

    function closeModal(){
        inventory_form.style.display = 'none';
    }

    add_inventory_button.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);


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
        if(event.target == inventory_form){
            closeModal;
        }
    });

    addForm.addEventListener('submit', async (event)=> {
        event.preventDefault();

        const formData = new FormData(addForm);
        const data = Object.fromEntries(formData.entries());

        console.log('From being sent: ', data);

        try{
            
            const response = await fetch('/api/inventory',{
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if(response.ok){
                console.log('Success', result.message);

                addForm.requestFullscreen();
                closeModal();
                fetchInventory();

            } else {
                console.error('Error from server:', result.error);
                alert(`Error: ${result.error}`); 
            } 
        } catch(error){
            console.error('Error', result.error);
            alert('Error: ${result.error}');
        }
    });

    fetchInventory();
});