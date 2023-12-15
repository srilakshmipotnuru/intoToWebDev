if( document.readyState=='loading'){
    document.addEventListener('DOMContentLoaded',ready)
}
else{
    ready()
}
function ready(){
    var removeBtn= document.getElementsByClassName('btn-danger')

    for (var i=0; i<removeBtn.length;i++){
        var button=removeBtn[i]
        button.addEventListener('click',removeCartitem)
    }

    var quantityInputs=document.getElementsByClassName('cart-quantity-input')
    for (var i=0;i<quantityInputs.length;i++){
        var input=quantityInputs[i]
        input.addEventListener('change',quantityChange)
    }

    var addToCart=document.getElementsByClassName('shop-item')
    for (var i=0;i<addToCart.length;i++){
        var button=addToCart[i]
        button.addEventListener('click',addToCartClick)
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click',purchaseClick)
    
    
}

var stripeHandler= StripeCheckout.configure({
    key: stripePublicKey,
    locale:'auto',
    token:function(token){
        var items=[]
        var cartItemsContainer=document.getElementsByClassName('cart-items')[0]
        var cartRows=cartItemsContainer.getElementsByClassName('cart-row')
        for (var i=0;i<cartRows.length;i++){
            var row=cartRows[i]
            var quantityEl=row.getElementsByClassName('cart-quantity-input')[0]
            var id =row.dataset.itemId
            var quantity=quantityEl.value
            items.push({
                id: id,
                quantity:quantity
            })
        }
        fetch('/purchase',{
            method: 'POST',
            headers:{
                'Content-Type':'application/json',
                'Accept':'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items:items
            })
        }).then(function(res){
            console.log(res)
            return  
        }).then(function(data){
            alert(data.message)
            var cartItems=document.getElementsByClassName('cart-items')[0]
            while (cartItems.hasChildNodes()){
                cartItems.removeChild(cartItems.firstChild)
            }
            updateTotal() 
        }).catch(function(error){
            console.log(error)
        })
    }
})
function purchaseClick(){
    
    var priceEl=document.getElementsByClassName('cart-total-price')[0]
    var price=parseFloat(priceEl.innerText.replace('$',''))*100
    stripeHandler.open({
        amount:price
    })
}

function addItemToCart(title,price,img,id){
    var cartrow=document.createElement('div')
    cartrow.dataset.itemId=id
    var cartItems=document.getElementsByClassName('cart-items')[0]
    var cartItemNames=cartItems.getElementsByClassName('cart-item-title')
    for (var i=0;i<cartItemNames.length;i++){
        if (cartItemNames[i].innerText == title){
            alert('This item is already added to cart')
            return
        }
    }
    cartrow.classList.add('cart-row')
    var cartrowContents=`<div class="cart-item cart-column">
    <img src="${img}" width="50">
    <span class="cart-item-title">${title}</span>
</div>


<span class="cart-price cart-column"> ${price}</span>

<div class="cart-qantity cart-column">
    <input class="cart-quantity-input" type="number" value="1">
    <button class="btn btn-danger cart-quantity-button" type="button">Remove</button>
</div>`
    cartrow.innerHTML=cartrowContents
    cartItems.append(cartrow)
    cartrow.getElementsByClassName('btn-danger')[0].addEventListener('click',removeCartitem)
    cartrow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change',quantityChange)

}
function addToCartClick(event){
   var button=event.target
   var shopItem=button.parentElement.parentElement
   var title=shopItem.getElementsByClassName('shop-item-title')[0].innerText
   var price=shopItem.getElementsByClassName('shop-item-price')[0].innerText
   var img=shopItem.getElementsByClassName('shop-item-img')[0].src
   var id=shopItem.dataset.itemId//'data-item-id'
   addItemToCart(title,price,img,id)
   updateTotal()

}

function quantityChange(event){
    var input=event.target
    if (isNaN(input.value)|| input.value<1){
        input.value=1
    }
    updateTotal()

}
function removeCartitem(event){
    var buttonClick=event.target
    buttonClick.parentElement.parentElement.remove()
    updateTotal()

}

function updateTotal(){
    var cartItems=document.getElementsByClassName('cart-items')[0]
    var rows=cartItems.getElementsByClassName('cart-row')
    var total=0
    for (var i=0;i<rows.length;i++){
        item=rows[i]
        var priceEl = item.getElementsByClassName('cart-price')[0]
        var quantityEl=item.getElementsByClassName('cart-quantity-input')[0]
        price=parseFloat(priceEl.innerText.replace('$',''))
        quantity=quantityEl.value
        total+=(price*quantity)
        
    }
    total=Math.round(total*100)/100

    document.getElementsByClassName('cart-total-price')[0].innerText= '$'+total
}
