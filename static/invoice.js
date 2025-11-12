document.addEventListener('DOMContentLoaded', ()=>{
    const invoice_table = document.getElementById('invoiceTableBody');
    const add_invoice_button = document.getElementById('AddInvoiceButton');
    const search_invoice = document.getElementById('searchInvoiceButton');
    const print_invoice = document.getElementById('printInvoiceButton');
    const invoice_form = document.getElementById('addInvoiceModal');
    const closeBtn = document.querySelector('.close-button');
    const addForm = document.getElementById('addInvoiceForm');

    function openModal(){
        invoice_form.style.display = 'flex';
    }

    function closeModal(){
        invoice_form.style.display = 'none';
    }

    add_invoice_button.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    
    async function fetchInvoice() {
        try{
            const response = await fetch('/api/invoice');
            const data = await response.json();
            invoice_table.innerHTML = '';
            data.forEach(data=> {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${data.Invoice_ID}</td>
                    <td>${data.Customer_ID}</td>
                    <td>${data.Order_ID}</td>
                    <td>${data.Order_Price}</td>
                    <td>${data.Invoice_Status}</td>
                `;
                
                invoice_table.appendChild(row);
            });
        } catch(error){
            console.error('Error fetching data: ', error)
        }
    }
    window.addEventListener('click', (event)=> {
        if(event.target == invoice_form){
            closeModal;
        }
    });

    addForm.addEventListener('submit', async (event)=>{
        event.preventDefault();

        const formData = new FormData(addForm);
        const data = Object.fromEntries(formData.entries());

        console.log('Form being sent: ', data);

        try{
            const response = await fetch('/api/invoices',{
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if(response.ok){
                console.log('Success', result.message);

                closeModal();
                fetchInvoice();
            }else{
                console.error('Error from server:', result.error);
                alert(`Error: ${result.error}`); 
            }
        }catch(error){
            console.error('Error', result.error);
            alert('Error: ${result.error}');
        }
    });

    fetchInvoice();
});