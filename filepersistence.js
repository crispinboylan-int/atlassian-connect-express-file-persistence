var storage = require('node-persist');

function FileSystemPersistence(logger, opts) {
    opts = opts || {};
    var self = this;

    self.config = {
        storageDir: opts.storageDir || 'Persistence',
        logging: opts.logging || true,
        encoding: opts.encoding || 'utf8'
    }

    storage.init(self.config, function(initiatedClient) {
        self.client = initiatedClient;
    })

    self.client = storage.init(self.config);

    self.client = storage.create(self.config)
}

var proto = FileSystemPersistence.prototype;

function redisKey(key, clientKey) {
    return [clientKey, key].join(':');
}

function combinedKey(key, clientKey) {
    return [clientKey, key].join(':');
}

proto.get = async function(key, clientKey) {
    var self = this;
    return await self.client.getItem(combinedKey(key, clientKey));
}

proto.set = async function(key, val, clientKey) {
    var self = this;
    return await self.client.setItem(combinedKey(key, clientKey), val);
}

proto.del = async function(key, clientKey) {
    var self = this;
    return await self.client.removeItem(combinedKey(key, clientKey));
}

proto.getAllClientInfos = async function() {
    var self = this;
    return await storage.values();

};

proto.isMemoryStore = function() {
    return false;
};

module.exports = function(logger, opts) {
    return new FileSystemPersistence(logger, opts);
}