var output = [];
let a = 1;
function fizzbuzz(){
    if(a%5===0 && a%3===0){
        output.push("fizzbuzz");
    }else if(a%5===0){
        output.push("buzz");
}else if(a%3===0){
        output.push("fizz")
}else{
         output.push(a);   
}
    a++
    console.log(output);
}

for(let n = 1; n<=100;n++){
    fizzbuzz();
}