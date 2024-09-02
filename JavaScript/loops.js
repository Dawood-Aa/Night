// var a = 99;
// function beer(){
// while(a>0){
//     console.log(a + " bottles of beer on the wall, " + a + "bottles of beer. Take 1 down, pass it around, " + (a-1) + "bottles of beer on the wall")
//     a--
// }
// }
// beer(); 

function fib (n){
    var a = 0
    var b = 1
    var c = 0
    var count = 0
    var fiba = []
    while(count<=n){
        fiba.push(a)
        c=b;
        b=a;
        a=a+c;
        count++
    }
    console.log(fiba)
}

fib(5);