const DEFAULT_PREFIX = 'cargo-core:store:'

function readStorage(key) {
    try {
        return window.localStorage.getItem(key)
    } catch {
        return null
    }
}

function writeStorage(key, value) {
    try {
        window.localStorage.setItem(key, value)
    } catch {
        // Ignore storage failures on constrained devices.
    }
}

function removeStorage(key) {
    try {
        window.localStorage.removeItem(key)
    } catch {
        // Ignore storage failures on constrained devices.
    }
}

function pickPaths(state, paths) {
    return paths.reduce((acc, path) => {
        if (Object.prototype.hasOwnProperty.call(state, path)) {
            acc[path] = state[path]
        }
        return acc
    }, {})
}

function resolveConfig(persist, storeId) {
    if (!persist) return null

    if (persist === true) {
        return {
            key: `${DEFAULT_PREFIX}${storeId}`,
            pick: null,
        }
    }

    return {
        key: persist.key || `${DEFAULT_PREFIX}${storeId}`,
        pick: persist.pick || persist.paths || null,
    }
}

export function createPersistedStatePlugin() {
    return ({ store, options }) => {
        const config = resolveConfig(options?.persist, store.$id)
        if (!config) return

        const raw = readStorage(config.key)
        if (raw) {
            try {
                store.$patch(JSON.parse(raw))
            } catch {
                removeStorage(config.key)
            }
        }

        store.$subscribe(
            (_mutation, state) => {
                const payload = config.pick ? pickPaths(state, config.pick) : state
                writeStorage(config.key, JSON.stringify(payload))
            },
            { detached: true }
        )
    }
}
