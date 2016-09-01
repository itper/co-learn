var fs = require('fs');

//Thunk是一种写法,作用是将函数参数单次传入执行,这里主要讲callback作为第二次参数传递,可以移出回调控制权到gen函数外.
var Thunk = function(fn){
    return function(){
        var arg = [];
        for(var j in arguments){
            arg[j] = arguments[j];
        }
        return function(cb){
            arg.push(cb)
            fn.apply(this,arg);
        }
    }
}

var read = Thunk(fs.readFile);



var ToPromiseFun = function(fn){
    return function(){
        var c = this;
        var arg = [];
        for(var j in arguments){
            arg[j] = arguments[j];
        }
        return new Promise(function(resolve,reject){
            arg.push(function(e,r){
                if(e){
                    reject(e);
                }else{
                    resolve(r);
                }
            })
            fn.apply(c,arg);
        });
    }
}


var read1 = ToPromiseFun(fs.readFile);

function* gen(){
    var f1 = yield read('./1.js');
    var f2 = yield read('./2.js');
    var f3 = yield read('./3.js');
    console.log(f1.toString());
    console.log(f2.toString());
    console.log(f3.toString());
}

gen = gen();
function next(v){
    var ret = gen.next(v);
    if(ret.done){
        return v;
    }
    ret.value(function(e,r){
        next(r);
    });
}
function* gen1(){
    var f1 = yield read1('./1.js');
    var f2 = yield read1('./2.js');
    var f3 = yield read1('./3.js');
    console.log('gen1');
    console.log(f1.toString());
    console.log(f2.toString());
    console.log(f3.toString());
}

gen1 = gen1();
function next1(v){
    var ret = gen1.next(v);
    if(ret.done){
        return v;
    }
    ret.value.then(function(r){
        next1(r);
    });
}
next();
next1();