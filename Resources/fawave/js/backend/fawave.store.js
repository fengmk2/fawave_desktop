window.FaWave = window.FaWave || {};

/****
 * 持久化存储
 */
FaWave.Store = {
    /****
     * 文件存储
     * 存储到 Resources 目录的数据目录中
     */
    File: {
        read: function(fileName){
            var path = Titanium.Filesystem.getResourcesDirectory();
            var file = Titanium.Filesystem.getFile(path, FaWave.Config.dataDir, fileName);
            if(file.exists()){
                return file.read();
            }else{
                return '';
            }
        },
        save: function(fileName, value){
            var path = Titanium.Filesystem.getResourcesDirectory();
            var dir = Titanium.Filesystem.getFile(path, FaWave.Config.dataDir);
            if(!dir.exists()){
                dir.createDirectory();
            }
            var file = Titanium.Filesystem.getFile(path, FaWave.Config.dataDir, fileName);
            // file.write这个API好像在Titanium的1.1.0以上版本修改了？
            file.write(value);
        },
        readAsJson: function(fileName){
            var _sets;
            try{
                _sets = JSON.parse(this.read(fileName));
            }catch(e){
                FaWave.Log.error(e);
            }
            return _sets || {};
        },
        saveAsJson: function(fileName, value){
            this.save(fileName, JSON.stringify(value));
        }
    },
    /******
     * 数据库存储
     */
    DB: {}
};


// HTML5 localStorage 存储
// e.g. localStorage.setObject
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var v = this.getItem(key);
    if(v)
    {
        try{
            v = JSON.parse(v);
        }
        catch(err){
            v = null;
        }
    }
    return v;
};
