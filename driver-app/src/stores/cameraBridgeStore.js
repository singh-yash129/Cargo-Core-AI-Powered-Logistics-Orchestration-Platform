import { defineStore } from 'pinia'

const CAMERA_RETURN_ROUTE_KEY = 'cargo-core:camera-return-route'

function saveReturnRoute(path) {
    try {
        window.localStorage.setItem(CAMERA_RETURN_ROUTE_KEY, path)
    } catch {
        // Ignore storage failures on constrained devices.
    }
}

function consumeReturnRoute(path) {
    const resolved = path || window.localStorage.getItem(CAMERA_RETURN_ROUTE_KEY) || '/dashboard'
    try {
        window.localStorage.removeItem(CAMERA_RETURN_ROUTE_KEY)
    } catch {
        // Ignore storage failures on constrained devices.
    }
    return resolved
}

/**
 * Camera Bridge Store
 * ------------------
 * Caller:        const result = await cameraBridgeStore.openCamera(router, 'qr' | 'photo' | 'ocr', prompt)
 * Camera screen: cameraBridgeStore.deliver(result)   // resolves with data
 *                cameraBridgeStore.cancel()           // resolves with null (caller does: if (!result) return)
 */
export const useCameraBridgeStore = defineStore('cameraBridge', {
    state: () => ({
        _resolve: null,
        promptText: '',
        mode: '', // 'qr' | 'photo' | 'ocr'
        returnRoute: '/dashboard',
    }),

    actions: {
        /**
         * Navigate to a camera route and return a promise that resolves
         * when the camera screen calls deliver() or cancel().
         * @param {import('vue-router').Router} router
         * @param {'qr'|'photo'|'ocr'} type
         * @param {string} prompt
         */
        openCamera(router, type, prompt = '') {
            this.mode = type
            this.promptText = prompt
            this.returnRoute = router.currentRoute.value.fullPath || '/dashboard'
            saveReturnRoute(this.returnRoute)

            return new Promise((resolve) => {
                this._resolve = resolve
                const routeMap = {
                    qr: '/camera/qr',
                    photo: '/camera/photo',
                    ocr: '/camera/ocr',
                }
                router.push(routeMap[type])
            })
        },

        /** Called by the camera view when it has a result */
        deliver(result) {
            const res = this._resolve
            this._resolve = null
            if (res) res(result)
        },

        /** Called by the camera view when the user presses Close */
        cancel() {
            const res = this._resolve
            this._resolve = null
            if (res) res(null)
        },

        async navigateBack(router) {
            const target = consumeReturnRoute(this.returnRoute)
            this.returnRoute = '/dashboard'
            this.promptText = ''
            this.mode = ''
            await router.replace(target)
        },
    },
})
