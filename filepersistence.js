var storage = require('node-persist');

function FileSystemPersistence(logger, opts) {
    opts = opts || {};
    var self = this;

    self.config = {
        dir: opts.storageDir || 'Persistence',
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

function combinedKey(key, clientKey) {
    return [clientKey, key].join(':');
}

function installationKey(forgeInstallationId) {
  return `installation:${forgeInstallationId};`;
};


proto.saveInstallation = async function(val, clientKey) {
    var self = this;
    const clientSetting = await self.set("clientInfo", val, clientKey);

    const forgeInstallationId = clientSetting.installationId;
    if (forgeInstallationId) {
      await self.associateInstallations(forgeInstallationId, clientKey);
    }

    return clientSetting;
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

proto.associateInstallations = async function(forgeInstallationId, clientKey) {
    await this.client.setItem(installationKey(forgeInstallationId), clientKey);
}

proto.deleteAssociation = async function(forgeInstallationId) {
    await this.client.removeItem(installationKey(forgeInstallationId));
}

proto.getClientSettingsForForgeInstallation = async function(forgeInstallationId) {
    const clientKey = await this.client.getItem(
      installationKey(forgeInstallationId)
    );
    if (!clientKey) {
      return null;
    }
    return this.get("clientInfo", clientKey);
}

module.exports = function(logger, opts) {
    return new FileSystemPersistence(logger, opts);
}
