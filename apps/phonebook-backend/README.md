# Contellect contacts app (backend)

## running the app

- start the PostgreSQL driver and create the database (default name is `contellect`)

- modify .env (.env is temporarily not listed in .gitignore)

- run `npm start` or use `PM2`

- open `localhost:3000` and navigate to `/register` to add the desired users such as `user1@user1`

## notes

- all routes are public by default, to mark a route as members-only add `@Private()`

- there is no roles privileges, all resources are accessible o all members
