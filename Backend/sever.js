const {app} =require('./app')
const {connect}=require('./database/connect')
require('dotenv').config()

const port=process.env.HOST

app.listen(port,async()=>{
    try {
        console.log(`app is running on ${port}`)
        await connect
    } catch (error) {
        console.log(error);
    } 
})