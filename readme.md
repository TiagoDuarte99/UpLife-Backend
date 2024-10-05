# UpLife - Plataforma de Agendamento de Serviços

## Descrição do Projeto

A **UpLife** é uma aplicação destinada à contratação e agendamento de serviços de freelancers. A plataforma é direcionada a **clientes** que pretendem contratar profissionais freelancers para serviços como **limpezas**, **cuidados de animais de estimação**, **babysitting**, entre outros. Por outro lado, os **freelancers** podem registar os seus serviços e aceitar agendamentos diretamente através da plataforma.

## Funcionalidades Principais

- **Login e Autenticação JWT**: Sistema seguro de login utilizando tokens JWT.
- **Pesquisa de Profissionais**: Os utilizadores podem procurar freelancers de acordo com a categoria de serviço pretendida.
- **Agendamento**: Sistema de agendamento que utiliza a API do Google Maps para calcular distâncias e evitar conflitos de horário.
- **Confirmação de Agendamento**: Os freelancers podem confirmar ou rejeitar solicitações de serviços.
- **Backend em Node.js** e **Base de Dados Postgres**: Toda a lógica de negócios e armazenamento de dados é implementada utilizando estas tecnologias.

## API do Google Maps

A aplicação utiliza a API do Google Maps para calcular a distância entre a localização do freelancer e o local do serviço, evitando que os agendamentos sejam feitos em horários que não permitam tempo suficiente para o deslocamento.

## Framework e Ferramentas Principais

- **Express**: O backend é construído com o framework Express, que facilita a criação de APIs rápidas e escaláveis.
- **Knex.js**: Utilizado para interações com o banco de dados PostgreSQL, permitindo a criação de migrações e consultas SQL de maneira simples e flexível.

## Autenticação e Segurança

- **JWT (jsonwebtoken + passport-jwt)**: O backend utiliza tokens JWT (JSON Web Tokens) para autenticação, garantindo que as rotas protegidas só sejam acessadas por usuários autenticados.
- **bcrypt-nodejs**: Responsável pela criptografia de senhas, adicionando uma camada extra de segurança ao lidar com credenciais de utilizadores.

## Gerenciamento de Ambiente e Configurações

- **dotenv**: Usado para gerenciar variáveis de ambiente, mantendo seguras as informações sensíveis, como as chaves de API e as credenciais de banco de dados.

## Documentação da API

- **Swagger**: A inclusão de `swagger-ui-express` permite que a API seja documentada e testada de forma interativa, tornando mais fácil para os utilizadores e desenvolvedores entenderem e usarem os endpoints da API.

## Testes e Qualidade de Código

- **Jest e Supertest**: Ferramentas de testes automatizados estão configuradas para garantir a confiabilidade do código, sendo utilizados para testes unitários e de integração.
- **ESLint com configuração Airbnb**: O uso do ESLint ajuda a garantir que o código siga padrões de qualidade e consistência, evitando erros comuns.

## Desenvolvimento Contínuo

- **Nodemon**: Facilita o processo de desenvolvimento ao reiniciar o servidor automaticamente quando mudanças no código são detectadas.

