# 约定的代码规范

## 命名

### 变量 var

#### 普通变量: 

小写字母和下划线`_`
      
    var foo = 'bar', level_one = '1';
      
#### 常量: 

大写字母和下划线
  
    Fawave.TIMEOUT = 60000;
    var DEFAULT_DATA_TYPE = 'json';
      
#### 私有变量

以一或两个下划线开始

    function Demo(name) {
        this._name = name;
    }
    
    var Foo = {
        __pos: 0,
        // something else
    };
    
### 类 Class

以大写字母开头

    function Database(user, pwd) {
        this.user = user;
        this.pwd = pwd;
    }
    Database.prototype.cursor = function() {
        // balabala
    };
    
## 避免全局变量

除了命名空间外，所有变量都不能定义为全局变量。

    // BAD - we put five variables in the global scope which could be clobbered
    var key = 'value',
        foo = 'bar',
        charlie = 'horse';
     
    function helper() {
        //help out
    }
     
    function info(msg) {
        helper(msg);
        Ti.API.info(msg);
    }
     
    //Better - enclose everything but your public namespace inside a self-calling
    //function... now we only have 1 variable in the global scope
     
    // Now, 'myapp' is the only global variable, which is good
    var myapp = {
        key: 'value',
        foo: 'bar',
        charlie: 'horse'
    };
     
    (function() {
        function helper() {
            //help out
        }
     
        myapp.info = function(msg) {
            helper(msg);
            Ti.API.info(msg)
        };
    })();

## Use === and !== instead of == and !=

等于一定是类型和值都相等才是等于

## 使用最有效的循环

    // In some situations, checking the length of an array during every iteration can be slow. So rather than writing:
    var names = ['Jeff','Nolan','Marshall','Don'];
    for(var i=0;i<names.length;i++){
        process(names[i]);
    }
    
    // It is better to only get the length of the array only once, as in:
    var names = ['Jeff','Nolan','Marshall','Don'];
    for(var i=0,j=names.length;i<j;i++){
        process(names[i]);
    }

## 避免深层次的回调嵌套和循环回调嵌套

尽量将大于两层的回调封装出来，或者可以使用事件机制解决。

## 参考

* [JavaScript Best Practices](http://wiki.appcelerator.org/display/guides/JavaScript+Best+Practices)