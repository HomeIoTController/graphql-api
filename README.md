# Light Control - GraphQL API

 This GraphQL API supports authentication with JWT and does IoT device management

## Getting Started

* Clone the project repository by running the command below if you use HTTPS

```bash
git clone https://github.com/PhilipsHUEController/api.git
```

* After cloning, run:

```bash
cd Project/api
npm install
```

* Rename `.env.example` to `.env` then fill in your database detail and your JWT secret:

```txt
NODE_ENV=development
DB_HOST=db
DB_USERNAME=adaptive_user
DB_PASSWORD=adaptive_pw
DB_NAME=adaptive_db
JWT_SECRET=adaptive_software_jwt
```

* Then run the migration:

```bash
sequelize db:migrate
```

* And finally, start the application:

```bash
npm start
```

* The server will be running on [http://localhost:3000/api](http://localhost:3000/api).

## How to create a new DB entity

* Example: `sequelize model:generate --name EEGData --attributes userId:integer,time:date,theta:integer,lowAlpha:integer,highAlpha:integer,lowBeta:integer,highBeta:integer,lowGamma:integer,midGamma:integer,attention:integer,meditation:integer,blink:integer --force`
