function sum(a, b){
    return a+b;
}
function prod(a, b){
    return a*b;
}
function mod(a, b){
    return a%b;
}
function sub(a, b){
    return a-b;
}
function divide(a, b){
    return a/b;
}
function calc(a, b, opperand){
    return opperand(a, b);
}

console.log(calc(37,43,divide));

