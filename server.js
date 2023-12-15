

if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const stripeSecretKey=process.env.STRIPE_SECRET_KEY
const stripePublicKey=process.env.STRIPE_PUBLIC_KEY
const fs =require('fs') // to read json files
const express=require('express')
const stripe=require('stripe')(stripeSecretKey)
const app=express()// creates an app same this as createServer function in node.js
//embed serversisde code into frontend
app.set('view engine','ejs') //ejs is a templating engine
app.use(express.json())
app.use(express.static('public'))// marking all file sin piblic folder as static(frontend)
app.listen(8080)//port

//--stripe for payments--
//when you click purchase stripe gives a pop up that lets user to enter credit card info etc inorder 
//to purchse and send that to stripe and sends back as a unique id 

// to access josn items inside front end we use routing

app.get('/store',function(req,res){

    fs.readFile('item.json',function(error,data){
        if (error){
            console.log(error,'hello')
            res.status(500).end()
        }else{
            res.render('store.ejs',{
                stripePublicKey:stripePublicKey,
                items:JSON.parse(data)
            })
        }
    })
})//get request
app.post('/purchase',function(req,res){

    fs.readFile('item.json',function(error,data){
        if (error){
            res.status(500).end()
        }else{
            const itemsJSON=JSON.parse(data)
            const itemsArr=itemsJSON.music.concat(itemsJSON.merch)
            let total=0
            req.body.items.forEach(function(item) {
                const itemsJSON=itemsArr.find(function(i){
                    return i.id==item.id
                })
                total=total+itemsJSON.price*item.quantity
            })


            stripe.charges.create({
                amount:total,
                source:req.body.stripeTokenId,
                currency:'usd'
            }).then(function(){
                console.log('charge successfull')
                res.json({message:'Successfully purchased items'})
            }).catch(function(){
                console.log('charge failed')
                res.status(500).end()
            })
        }
    })
})//post request