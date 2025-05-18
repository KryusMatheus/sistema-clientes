document.addEventListener('DOMContentLoaded', function() {
    const clienteForm = document.getElementById('clienteForm');
    const btnCancelar = document.getElementById('btnCancelar');
    const messageDiv = document.getElementById('message');
    const cpfInput = document.getElementById('cpf');
    
    // Format CPF as user types
    cpfInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        if (value.length > 9) {
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{3})(\d{3})(\d{3}).*/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/^(\d{3})(\d{3}).*/, '$1.$2');
        }
        
        e.target.value = value;
    });
    
    // Handle form submission
    clienteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const cpf = document.getElementById('cpf').value;
        const email = document.getElementById('email').value;
        
        const cliente = {
            nome: nome,
            cpf: cpf,
            email: email
        };
        
        fetch('http://localhost:5000/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cliente)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao cadastrar cliente');
            }
            return response.json();
        })
        .then(data => {
            showMessage('Cliente cadastrado com sucesso!', 'success');
            clienteForm.reset();
        })
        .catch(error => {
            showMessage('Erro ao cadastrar cliente: ' + error.message, 'error');
        });
    });
    
    // Handle cancel button
    btnCancelar.addEventListener('click', function() {
        clienteForm.reset();
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    });
    
    // Function to show messages
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = 'message ' + type;
        
        // Clear message after 3 seconds
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 3000);
    }
});