document.addEventListener('DOMContentLoaded', function() {
    const compraForm = document.getElementById('compraForm');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnVoltar = document.getElementById('btnVoltar');
    const comprasTableBody = document.querySelector('#comprasTable tbody');
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');
    const clienteNameSpan = document.getElementById('clienteName');
    
    // Get cliente_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('cliente_id');
    
    if (!clienteId) {
        window.location.href = 'lista_clientes.html';
        return;
    }
    
    // Set cliente_id in hidden field
    document.getElementById('clienteId').value = clienteId;
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = today;
    
    // Load client info and purchases
    loadClienteInfo();
    loadCompras();
    
    // Handle form submission
    compraForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const compraId = document.getElementById('compraId').value;
        const data = document.getElementById('data').value;
        const valor_total = document.getElementById('valor_total').value;
        const forma_pagamento = document.getElementById('forma_pagamento').value;
        
        const compra = {
            data: data,
            valor_total: parseFloat(valor_total),
            forma_pagamento: forma_pagamento,
            cliente_id: parseInt(clienteId)
        };
        
        if (compraId) {
            // Update existing purchase
            updateCompra(compraId, compra);
        } else {
            // Create new purchase
            createCompra(compra);
        }
    });
    
    // Handle cancel button
    btnCancelar.addEventListener('click', function() {
        resetForm();
    });
    
    // Handle back button
    btnVoltar.addEventListener('click', function() {
        window.location.href = 'lista_clientes.html';
    });
    
    function loadClienteInfo() {
        fetch(`http://localhost:5000/clientes/${clienteId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar informações do cliente');
                }
                return response.json();
            })
            .then(cliente => {
                clienteNameSpan.textContent = cliente.nome;
            })
            .catch(error => {
                showMessage('Erro ao carregar informações do cliente: ' + error.message, 'error');
            });
    }
    
    function loadCompras() {
        loadingDiv.style.display = 'block';
        
        fetch(`http://localhost:5000/compras/cliente/${clienteId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar compras');
                }
                return response.json();
            })
            .then(compras => {
                renderCompras(compras);
                loadingDiv.style.display = 'none';
            })
            .catch(error => {
                showMessage('Erro ao carregar compras: ' + error.message, 'error');
                loadingDiv.style.display = 'none';
            });
    }
    
    function renderCompras(compras) {
        comprasTableBody.innerHTML = '';
        
        if (compras.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" class="no-data">Nenhuma compra registrada</td>';
            comprasTableBody.appendChild(row);
            return;
        }
        
        compras.forEach(compra => {
            // Format date from YYYY-MM-DD to DD/MM/YYYY
            const dateParts = compra.data.split('-');
            const formattedDate = dateParts.length === 3 ? 
                `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : compra.data;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>R$ ${parseFloat(compra.valor_total).toFixed(2).replace('.', ',')}</td>
                <td>${compra.forma_pagamento}</td>
                <td class="actions">
                    <button class="btn btn-warning btn-sm" data-id="${compra.id}" data-action="edit">Editar</button>
                    <button class="btn btn-danger btn-sm" data-id="${compra.id}" data-action="delete">Excluir</button>
                </td>
            `;
            comprasTableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('[data-action="edit"]').forEach(button => {
            button.addEventListener('click', function() {
                const compraId = this.getAttribute('data-id');
                editCompra(compraId);
            });
        });
        
        document.querySelectorAll('[data-action="delete"]').forEach(button => {
            button.addEventListener('click', function() {
                const compraId = this.getAttribute('data-id');
                if (confirm('Tem certeza que deseja excluir esta compra?')) {
                    deleteCompra(compraId);
                }
            });
        });
    }
    
    function createCompra(compra) {
        fetch('http://localhost:5000/compras', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(compra)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao registrar compra');
            }
            return response.json();
        })
        .then(data => {
            showMessage('Compra registrada com sucesso!', 'success');
            resetForm();
            loadCompras();
        })
        .catch(error => {
            showMessage('Erro ao registrar compra: ' + error.message, 'error');
        });
    }
    
    function updateCompra(id, compra) {
        fetch(`http://localhost:5000/compras/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(compra)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao atualizar compra');
            }
            return response.json();
        })
        .then(data => {
            showMessage('Compra atualizada com sucesso!', 'success');
            resetForm();
            loadCompras();
        })
        .catch(error => {
            showMessage('Erro ao atualizar compra: ' + error.message, 'error');
        });
    }
    
    function editCompra(id) {
        fetch(`http://localhost:5000/compras/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar dados da compra');
                }
                return response.json();
            })
            .then(compra => {
                document.getElementById('compraId').value = compra.id;
                document.getElementById('data').value = compra.data;
                document.getElementById('valor_total').value = compra.valor_total;
                document.getElementById('forma_pagamento').value = compra.forma_pagamento;
                
                document.getElementById('btnSalvar').textContent = 'Atualizar';
                document.querySelector('.form-section h3').textContent = 'Editar Compra';
                
                // Scroll to form
                document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                showMessage('Erro ao carregar dados da compra: ' + error.message, 'error');
            });
    }
    
    function deleteCompra(id) {
        fetch(`http://localhost:5000/compras/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir compra');
            }
            return response.json();
        })
        .then(data => {
            showMessage('Compra excluída com sucesso!', 'success');
            loadCompras();
        })
        .catch(error => {
            showMessage('Erro ao excluir compra: ' + error.message, 'error');
        });
    }
    
    function resetForm() {
        compraForm.reset();
        document.getElementById('compraId').value = '';
        document.getElementById('data').value = today;
        document.getElementById('btnSalvar').textContent = 'Salvar';
        document.querySelector('.form-section h3').textContent = 'Nova Compra';
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