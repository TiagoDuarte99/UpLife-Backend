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
