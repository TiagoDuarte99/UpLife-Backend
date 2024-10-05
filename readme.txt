Guia de iniciação:

npm install

criar docker
docker run --name projetoFinal -e POSTGRES_USER=user -e POSTGRES_PASSWORD=12345 -e POSTGRES_DB=projetoFinal -p 9002:5432 -d postgres

Fazer migrate
node_modules/.bin/knex migrate:latest --env test 

Run querys

npm start

npm run lint

npm test