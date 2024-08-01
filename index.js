const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();




app.get('/users/',async(request,response)=>{
    const userDetails = `select * from user;`;
    const user = await db.all(userDetails)
    response.send(user)
})

// register user API //
 app.post("/users/", async (request, response) => {
  
   const { username, name, password, gender, location } = request.body;
   const hashedPassword = await bcrypt.hash(password, 10);
   const selectUserQuery = `
  SELECT 
    * 
  FROM 
    user 
  WHERE 
    username = '${username}'`;
   const dbUser = await db.get(selectUserQuery);
   if (dbUser === undefined) {
     const createUserQuery = `
  INSERT INTO
    user (username, name, password, gender, location)
  VALUES
    (
      '${username}',
      '${name}',
      '${hashedPassword}',
      '${gender}',
      '${location}'  
    );`;
     await db.run(createUserQuery);
     response.send("created user successfully..!");
   } else {
     response.status(400);
     response.send("user already exits");
   }
 });

 // login User API 
 app.post("/login/", async (request, response) => {
   const { username, password } = request.body;
   const selectUserQuery = `
  SELECT 
    * 
  FROM 
    user 
  WHERE 
    username = '${username}'`;
   const dbUser = await db.get(selectUserQuery);
   if (dbUser === undefined){
       response.status(400);
       response.send("Invaild User..!!");
   }else {
       const isPasswordMatch = await bcrypt.compare(password,dbUser.password);
       if(isPasswordMatch === true){
           response.send("login Successful..!!");
       }else{
           response.status(400);
           response.send('Invaild Password..!!');
       }
       
   }
 });
