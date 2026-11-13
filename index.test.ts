import {test,expect} from "bun:test";
import axios from "axios";
import { sign } from "jsonwebtoken";

const BACKEND_URL = "http://localhost:3000"

// test("signup work as expected",async () => {
//     const response = await axios.post(`${BACKEND_URL}/signup`,{
//         username: "Nishant",
//         password: "123123"
//     })

//     expect(response.status).toBe(200)
//     expect(response.data.message).toBe("Successfully created user")
// })

test("check balance is working fine",async() => {
    const username = `Nishant-${Math.random()}`;
    const response = await axios.post(`${BACKEND_URL}/signup`,{
        username: username,
        password: "123123"
    })
      console.log("signinres",response)

    expect(response.status).toBe(200)
    expect(response.data.message).toBe("Successfully created user")

    const signinresponse = await axios.post(`${BACKEND_URL}/signin`,{
        username: username,
        password: "123123"
    })
    const token = signinresponse.data.data.token

    const balanceResponse = await axios.get(`${BACKEND_URL}/balance`,{
        headers:{
            Authorization: `Bearer ${token}`
        }
    })
    console.log(balanceResponse)
    expect(balanceResponse.data.status).toBe(200)
    expect(balanceResponse.data.usdBalance).toBe(0)

})