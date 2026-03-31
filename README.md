# Academia# Centro de Treinamento - Sistema de Gestão

Um sistema web no formato Single Page Application (SPA) para gerenciamento de uma academia, contendo um portal para os alunos e um painel administrativo. O projeto não utiliza backend, fazendo a persistência de dados localmente através do localStorage do navegador.

## Funcionalidades

Para o Aluno:
* Autenticação (Cadastro, Login e Recuperação de Senha).
* Check-in diário com registro de histórico.
* Catálogo de treinos e biblioteca de vídeos de instrução.
* Geração de plano de treino personalizado baseado em formulário.
* Registro de progresso de exercícios (cargas, séries e repetições).
* Simulação de assinatura de planos com checkout interativo.
* Geração de convites para acompanhantes (benefício premium).

Para o Administrador:
* Dashboard com indicadores financeiros e de uso (Total de alunos, Assinantes, MRR, Check-ins).
* Listagem e gerenciamento de usuários (edição manual de plano, cancelamento e exclusão).
* Gerenciamento de convites gerados.
* Publicação de avisos globais na interface dos alunos.

## Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript (ES6+)

## Como Executar

1. Clone ou baixe este repositório.
2. Certifique-se de que a pasta `img/` contém os arquivos de imagem utilizados no projeto.
3. Abra o arquivo `CentroDeTreinamento.html` em qualquer navegador web. 
4. (Opcional) Recomendo abrir utilizando uma extensão como o Live Server (VS Code) para evitar eventuais bloqueios de segurança do navegador ao carregar iframes.

## Acesso Administrativo (Testes)

O sistema cria automaticamente um perfil de administrador na primeira execução. Para acessar o painel de controle, faça login com as credenciais abaixo:

* Email: admin@academia.com
* Senha: admin
academia-theta-ten.vercel.app 


