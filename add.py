import requests

def cadastrar_ou_atualizar_senha(url, username, password):
    # Defina a URL da API
    api_url = 'http://localhost:3000/add'

    # Criando o payload no formato esperado pela API
    payload = {
        "url": url,
        "username": username,
        "password": password
    }

    # Enviando a requisição POST para a API
    try:
        response = requests.post(api_url, json=payload)

        # Verificando se a requisição foi bem-sucedida
        if response.status_code == 201:
            # Caso a conta tenha sido cadastrada
            print("Conta cadastrada com sucesso!")
            print(response.json())  # Exibindo a resposta da API

        elif response.status_code == 200:
            # Caso a senha tenha sido atualizada
            print("Senha atualizada com sucesso!")
            print(response.json())  # Exibindo a resposta da API

        elif response.status_code == 500:
            # Caso haja um erro no servidor
            print("Erro ao salvar os dados.")
            print(response.json())  # Exibindo a mensagem de erro

        else:
            print(f"Resposta inesperada. Status code: {response.status_code}")
            print(response.text)  # Exibindo a resposta completa

    except requests.exceptions.RequestException as e:
        print(f"Ocorreu um erro ao fazer a requisição: {e}")

# Payload a ser enviado
url = "https://signin.ebay.com/ws/ebayisapi.dll"
username = "lrabuazzo"
password = "silvia@00"

# Chama a função para cadastrar ou atualizar a conta
cadastrar_ou_atualizar_senha(url, username, password)
