document.addEventListener('DOMContentLoaded', ()=>{
    const customer_table = document.getElementById('customersTableBody');
    const add_customer_button = document.getElementById('addCustomerButton');
    const search_customer_button = document.getElementById('searchCustomerButton');
    const search_input = document.getElementById('invoiceSearchInput');
    const search_type = document.getElementById('invoiceSearchType');
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

    async function deleteCustomer(customerID) {
        try {
            const response = await fetch(`/api/customers/${customerID}`, {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' }
            });
            const result = await response.json();
            if (response.ok) {
                console.log("Delete success", result.message);
                closeModal();
                fetchCustomer();
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
    
    async function fetchCustomer(params = null) {
        try{
            let url = '/api/customers';

            if (params) {
                const queryString = new URLSearchParams(params).toString();
                url += `?${queryString}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            customer_table.innerHTML = '';
            data.forEach(data=> {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${data.Customer_ID}</td>
                    <td>${data.Customer_Name}</td>
                    <td>${data.Phone}</td>
                    <td>${data.Address}</td>
                `;
                

                row.addEventListener('click', ()=>{
                    const content = createViewDetailsHTML(data);
                    openModal(' Customer Details', content, "Edit", () => {
                        openEditCustomerModal(data);});
                        
                    const deleteCustomerBtn = document.getElementById('deleteItemBtn');
                    if (deleteCustomerBtn) {
                        deleteCustomerBtn.addEventListener('click', () => {
                            deleteCustomer(data.Customer_ID);
      });
    }
               
                });

                customer_table.appendChild(row);
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

    const addCustomerFormHTML =
         `
        <form id="modal-form" class="modal-form">

                <label for="customer_name">Customer Name</label>
                <input type="text" id="customer_name" name="customer_name" step="1" required>
            
                <label for="phone">Customer Phone</label>
                <input type="text" id="phone" name="phone" step="1" required>

                <label for="address">Customer Address</label>
                <input type="text" id="address" name="address" step="1" required>

        </form>
    `;



    function createViewDetailsHTML(p){
        return `
            <div class = "item-details">
                <p><strong>Customer ID: </strong>${p.Customer_ID}</p>
                <p><strong>Customer Name: </strong>${p.Customer_Name}</p>
                <p><strong>Phone: </strong>${p.Phone}</p>
                <p><strong>Address: </strong>${p.Address}</p>
                    
        `
    }

    add_customer_button.addEventListener('click', () => {
        const addAction = () => {
            const addForm = document.getElementById('modal-form');
            if(addForm){
                addForm.requestSubmit();
            }
        };

        openModal(
            ' Add New Customer',
            addCustomerFormHTML,
            null,
            addAction
        );

        const addForm = document.getElementById('modal-form');
        if (addForm) {
            addForm.addEventListener('submit', handleCustomerSubmit);
        }

    });

    const handleCustomerSubmit =  async(event) => {
        event.preventDefault();

        const addForm = event.target;
        const formData = new FormData(addForm);
        const data = Object.fromEntries(formData.entries());

        console.log("sending form.");

        try{
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if(response.ok){
                console.log("success", result.message);

                
                closeModal();
                fetchCustomer();
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



    function openEditCustomerModal(data){
        const editCustomerFormHTML = `
            <form id = "modal-form" class="modal-form" data-id = "${data.Customer_ID}">

                <label for = "customer_name">Customer Name:</label>
                <input type = "text" id = "customer_name" name = "customer_name" value = "${data.Customer_Name}"required>

                <label for = "phone">Phone:</label>
                <input type = "text" id = "phone" name = "phone" value = "${data.Phone}"required>
                
                <label for = "address">Adress:</label>
                <input type = "text" id = "address" name = "address" value = "${data.Address}"required>

            </form>
        `;

        openModal('Edit Customer Form', editCustomerFormHTML, 'Save Changes', () =>{
            const editCustomerForm = document.getElementById('modal-form');
            if(editCustomerForm) editCustomerForm.requestSubmit();
        });

        const editCustomerForm = document.getElementById('modal-form');
        if(editCustomerForm) editCustomerForm.addEventListener('submit', submitCustomerUpdate);
    }

    //modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);

    search_customer_button.addEventListener("click", () => {
        const query = search_input.value.trim();
        
        let params = {}

        if (search_type.value === "customer id" &&  query !== '') params.customer_id_id = query;
        if (search_type.value === "customer name"  &&  query !== '') params.customer_name = query;
        if (search_type.value === "customer phone"  &&  query !== '') params.phone = query;
        
        fetchCustomer(params);
    });




    const submitCustomerUpdate = async (event) => {
        event.preventDefault();

        const editForm = event.target;
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());
        const customerID = editForm.dataset.id;

        try{
            const response = await fetch(`/api/customers/${customerID}`, {
                method: 'PUT',
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if(response.ok){
                console.log("update success", result.message);

                
                closeModal();
                fetchCustomer();
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
    fetchCustomer();
});