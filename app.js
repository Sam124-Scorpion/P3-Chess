const express = require('express')
const http = require('http')
const socket = require('socket.io')
const {Chess} = require('chess.js')
const path = require('path')
const { title } = require('process')
const port = 3000

const app = express()
const server = http.createServer(app)


const io = socket(server)

const chess = new Chess()
let players = {}
let currentplayer = "w"
let playercount = 0

app.set('view engine' , 'ejs')
app.use(express.static(path.join(__dirname , 'public')))


app.get('/',(req,res)=>{
    res.render('lat' , {title : "showing Figure"})
})



io.on("connection" , (uniquesocket)=>{
    console.log('connected')
    playercount ++ 
    const playernumber = playercount


if(!players.white){
    players.white = uniquesocket.id;
    uniquesocket.emit("playerRole" , "w" , playernumber)
    // uniquesocket.emit("playerRole" , playernumber)
}
else if(!players.black){
    players.black = uniquesocket.id;
    uniquesocket.emit("playerRole" , "b" , playernumber)
    // uniquesocket.emit("playerRole" , playernumber)
}
else{
    uniquesocket.emit("spectatorRole" , playernumber)
}

uniquesocket.on("disconnect" , ()=>{
    playercount --
    if(uniquesocket.id === players.white){
        delete players.white
    }
    else if(uniquesocket.id === players.black){
        delete players.black
    }
})

uniquesocket.on("move" , (move)=>{

try {
    if(chess.turn() === "w" && uniquesocket.id !== players.white) return
    if(chess.turn() === "b" && uniquesocket.id !== players.black) return

    const result = chess.move(move)
    if(result){
        currentplayer = chess.turn()
        io.emit("move" , move)
        io.emit("boardState" , chess.fen())
    }
    else{
        console.log("Invalid move " . move)
        uniquesocket.emit("InvalidMove" , move)
    }
} catch (error) {
    console.log(error)
    uniquesocket.emit("Invalid Move" , move)
}

})


})







server.listen(port ,()=>{
    console.log(`server listening on http://localhost:${port}/`)
})



