import { defineStore } from 'pinia'

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
    },
})
