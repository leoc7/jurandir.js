export default class PluginManager {
    plugins = {};

    add(plugin) {
        this.plugins[plugin.key] = plugin;
    }

    exists(key) {
        return this.plugins.hasOwnProperty(key);
    }

    get(key) {
        return this.plugins[key];
    }

    iterate(cb) {
        Object.values(this.plugins).forEach(plugin => cb(plugin));
    }

    emit(header, data) {
        this.iterate(plugin => {
            if (plugin.enabled) {
                plugin.receive(header, data);
            }
        });
    }
}
