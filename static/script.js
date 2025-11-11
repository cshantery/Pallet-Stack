
const addInventoryButton = document.getElementById('addInventoryButton');
const inventoryForm = document.getElementById('inventoyrForm');
const submitInventoryButton = document.getElementById('SubmitInventory')

addInventoryButton.addEventListener('click', () =>{
    if(inventoryForm.style.display === 'none'){
        inventoryForm.style.display == 'block';
        addInventoryButton.textContent = 'Hide Inventory Form';
    } else {
        inventoryForm.style.display = 'none';
        addInventoryButton.textContent = 'Add Inventory'
    }
});

submitInventoryButton.addEventListener('click', () => {
    const palletName = getElementById('')
});