# UpLife - Plataforma de Agendamento de Serviços

## Descrição do Projeto

A **UpLife** é uma aplicação destinada à contratação e agendamento de serviços de freelancers. A plataforma é voltada para **clientes** que desejam contratar profissionais freelancers para serviços como **limpezas**, **cuidados com animais de estimação**, **babysitting**, entre outros. Por outro lado, **freelancers** podem cadastrar seus serviços e aceitar agendamentos diretamente pela plataforma.

### Funcionalidades Principais:
- **Login e Autenticação JWT**: Sistema seguro de login utilizando tokens JWT.
- **Pesquisa de Profissionais**: Usuários podem buscar freelancers de acordo com a categoria de serviço desejada.
- **Agendamento**: Sistema de agendamento que utiliza a API do Google Maps para calcular distâncias e evitar conflitos de horário.
- **Confirmação de Agendamento**: Freelancers podem confirmar ou rejeitar solicitações de serviço.
- **Backend em Node.js** e **Banco de Dados Postgres**: Toda a lógica de negócios e armazenamento de dados é feita utilizando essas tecnologias.

### API do Google Maps
A aplicação utiliza a API do Google Maps para calcular a distância entre a localização do freelancer e o local do serviço, evitando que os agendamentos sejam feitos em horários que não permitam deslocamento. Exemplo da chamada à API:
