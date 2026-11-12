import express from 'express'

const app = express()
let USER_INDEX = 0;

const USERS:{id: number, username: string, password: string}[] = [];

app.get('/',(req,res) =>{
    res.json({message:"Hello there"})
})

app.post("/signup",(req,res) =>{
    const {username, password} = req.body();
    
    if(USERS.find(u => u.username === username)){
        res.status(403).json({
            message:"User already exists"
        })
    }

    USERS.push({
        id: USER_INDEX++,
        username,
        password
    })

    res.status(200).json({
        message: "Successfully created user"
    })

})

app.listen(3000,()=>{
    console.log("Server is up....")
})