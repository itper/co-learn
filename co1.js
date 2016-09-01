function co(gen){
    var ctx = this;
    var args = slice.call(arguments,1);
    return new Promise(function (resolve,reject){
        if(typeof gen==='function'){
            gen = gen.apply(ctx,args);
        }
        if(!gen || typeof gen.next !== 'function'){
            return resolve(gen);
        }
        onFullfilled();
        function onFulfilled(res){
            var ret;
            try{
                ret = gen.next(res);
            }catch(e){
                return reject(e);
            }
            next(ret);
        }
        function onRejected(err){
            var ret;
            try{
                ret = gen.throw(err);
            }catch(e){
                return reject(e);
            }
            next(ret);
        }
        function next(ret){
            if(ret.done)return resolve(ret.value);
            var value = toPromise.call(ctx,ret.value);
            if(value && isPromise(value))return value.then(onFullfilled,onRejected);
            return onRejected(new TypeError('type error'));
        }
    })
}
function toPromise(obj){
    if(!obj)return obj;
    if(isPromise(obj))return obj;
    if(isGeneratorFunction(obj)||isGenerator(obj))return co.call(this,obj);
    if('function'==typeof obj)return thunkToPromise.call(this,obj);
    if(Array.isArray(obj))return arrayToPromise.call(this,obj);
    if(isObject(obj))return objectToPromise.call(this,obj);
    return obj;
}


function wrap(fn){
    createPromise.__generatorFunction__ = fn;
    return createPromise;
    function createPromise(){
        return co.call(this,fn.apply(this,arguments));
    }
}