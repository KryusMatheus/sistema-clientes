document.addEventListener('DOMContentLoaded', function() {
    const clientesTableBody = document.querySelector('#clientesTable tbody');
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');
    
    // Load clients when page loads
    loadClientes();
    
    function loadClientes() {
        loadingDiv.style.display = 'block';
        
        fetch('http://localhost:5000/clientes')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar clientes');
                }
                return response.json();
            })
            .then(clientes => {
                renderClientes(clientes);
                loadingDiv.style.display = 'none';
            })
            .catch(error => {
                showMessage('Erro ao carregar clientes: ' + error.message, 'error');
                loadingDiv.style.display = 'none';
            });
    }
    
    function renderClientes(clientes) {
        clientesTableBody.innerHTML = '';
        
        if (clientes.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" class="no-data">Nenhum cliente cadastrado</td>';
            clientesTableBody.appendChild(row);
            return;
        }
        
        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cliente.nome}</td>
                <td>${cliente.cpf}</td>
                <td>${cliente.email}</td>
                <td class="actions">
                    <button class="btn btn-info btn-sm" data-id="${cliente.id}" data-action="view">Visualizar Compras</button>
                    <button class="btn btn-danger btn-sm" data-id="${cliente.id}" data-action="delete">Excluir</button>
                </td>
            `;
            clientesTableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('[data-action="view"]').forEach(button => {
            button.addEventListener('click', function() {
                const clienteId = this.getAttribute('data-id');
                window.location.href = `compras_cliente.html?cliente_id=${clienteId}`;
            });
        });
        
        document.querySelectorAll('[data-action="delete"]').forEach(button => {
            button.addEventListener('click', function() {
                const clienteId = this.getAttribute('data-id');
                if (confirm('Tem certeza que deseja excluir este cliente?')) {
                    deleteCliente(clienteId);
                }
            });
        });
    }
    
    function deleteCliente(id) {
        fetch(`http://localhost:5000/clientes/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir cliente');
            }
            return response.json();
        })
        .then(data => {
            showMessage('Cliente excluído com sucesso!', 'success');
            loadClientes();
        })
        .catch(error => {
            showMessage('Erro ao excluir cliente: ' + error.message, 'error');
        });
    }
    
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