1. npm i
2. copy file .env.example to .env
3. npx tsc
4. npx typeorm migration:generate -d src/data-source.js --outputJs src/migration/first-migration
5. npx typeorm migration:run -d src/data-source.js
6. npm run seed:run
7. redis-server
8. npm start