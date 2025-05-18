from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mysqldb import MySQL
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

import os  

# configurações a partir das variáveis de ambiente (Render)
app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST')
app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER')
app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD')
app.config['MYSQL_DB'] = os.environ.get('MYSQL_DB')
app.config['MYSQL_PORT'] = int(os.environ.get('MYSQL_PORT', 3306))
app.config['MYSQL_CURSORCLASS'] = os.environ.get('MYSQL_CURSORCLASS', 'DictCursor')


mysql = MySQL(app)

# Routes for Cliente
@app.route('/clientes', methods=['GET', 'POST'])
def clientes():
    if request.method == 'GET':
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM cliente")
        clientes = cur.fetchall()
        cur.close()
        return jsonify(clientes)
    
    elif request.method == 'POST':
        data = request.json
        nome = data['nome']
        cpf = data['cpf']
        email = data['email']
        
        cur = mysql.connection.cursor()
        try:
            cur.execute("INSERT INTO cliente (nome, cpf, email) VALUES (%s, %s, %s)", 
                        (nome, cpf, email))
            mysql.connection.commit()
            cliente_id = cur.lastrowid
            cur.close()
            return jsonify({"id": cliente_id, "message": "Cliente cadastrado com sucesso!"}), 201
        except Exception as e:
            mysql.connection.rollback()
            cur.close()
            return jsonify({"error": str(e)}), 400

@app.route('/clientes/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def cliente(id):
    cur = mysql.connection.cursor()
    
    if request.method == 'GET':
        cur.execute("SELECT * FROM cliente WHERE id = %s", (id,))
        cliente = cur.fetchone()
        cur.close()
        
        if cliente:
            return jsonify(cliente)
        return jsonify({"message": "Cliente não encontrado"}), 404
    
    elif request.method == 'PUT':
        data = request.json
        nome = data['nome']
        cpf = data['cpf']
        email = data['email']
        
        try:
            cur.execute("UPDATE cliente SET nome = %s, cpf = %s, email = %s WHERE id = %s", 
                        (nome, cpf, email, id))
            mysql.connection.commit()
            cur.close()
            return jsonify({"message": "Cliente atualizado com sucesso!"})
        except Exception as e:
            mysql.connection.rollback()
            cur.close()
            return jsonify({"error": str(e)}), 400
    
    elif request.method == 'DELETE':
        try:
            cur.execute("DELETE FROM cliente WHERE id = %s", (id,))
            mysql.connection.commit()
            cur.close()
            return jsonify({"message": "Cliente excluído com sucesso!"})
        except Exception as e:
            mysql.connection.rollback()
            cur.close()
            return jsonify({"error": str(e)}), 400

# Routes for Compra
@app.route('/compras', methods=['POST'])
def criar_compra():
    data = request.json
    data_compra = data['data']
    valor_total = data['valor_total']
    forma_pagamento = data['forma_pagamento']
    cliente_id = data['cliente_id']
    
    cur = mysql.connection.cursor()
    try:
        cur.execute("INSERT INTO compra (data, valor_total, forma_pagamento, cliente_id) VALUES (%s, %s, %s, %s)", 
                    (data_compra, valor_total, forma_pagamento, cliente_id))
        mysql.connection.commit()
        compra_id = cur.lastrowid
        cur.close()
        return jsonify({"id": compra_id, "message": "Compra registrada com sucesso!"}), 201
    except Exception as e:
        mysql.connection.rollback()
        cur.close()
        return jsonify({"error": str(e)}), 400

@app.route('/compras/cliente/<int:cliente_id>', methods=['GET'])
def compras_cliente(cliente_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM compra WHERE cliente_id = %s", (cliente_id,))
    compras = cur.fetchall()
    cur.close()
    return jsonify(compras)

@app.route('/compras/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def compra(id):
    cur = mysql.connection.cursor()
    
    if request.method == 'GET':
        cur.execute("SELECT * FROM compra WHERE id = %s", (id,))
        compra = cur.fetchone()
        cur.close()
        
        if compra:
            return jsonify(compra)
        return jsonify({"message": "Compra não encontrada"}), 404
    
    elif request.method == 'PUT':
        data = request.json
        data_compra = data['data']
        valor_total = data['valor_total']
        forma_pagamento = data['forma_pagamento']
        
        try:
            cur.execute("UPDATE compra SET data = %s, valor_total = %s, forma_pagamento = %s WHERE id = %s", 
                        (data_compra, valor_total, forma_pagamento, id))
            mysql.connection.commit()
            cur.close()
            return jsonify({"message": "Compra atualizada com sucesso!"})
        except Exception as e:
            mysql.connection.rollback()
            cur.close()
            return jsonify({"error": str(e)}), 400
    
    elif request.method == 'DELETE':
        try:
            cur.execute("DELETE FROM compra WHERE id = %s", (id,))
            mysql.connection.commit()
            cur.close()
            return jsonify({"message": "Compra excluída com sucesso!"})
        except Exception as e:
            mysql.connection.rollback()
            cur.close()
            return jsonify({"error": str(e)}), 400
from flask import render_template

@app.route("/")
def home():
    return render_template("cadastro_cliente.html")

@app.route("/listar_clientes")
def listar_clientes():
    return render_template("lista_clientes.html")

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=10000)

print("Flask API is running on http://localhost:5000")