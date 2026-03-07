/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#1CE783',
                'primary-dark': '#15b86a',
                'background-dark': '#0F1115',
                'background-light': '#F5F7F6',
                'surface-dark': '#1a2c24',
                'surface-light': '#ffffff',
                'card-dark': '#1a2c24',
                'card-darker': '#14261e',
                'accent-blue': '#44a8e9',
                'accent-purple': '#a844e9',
                'accent-gold': '#e9c444',
                'signal-amber': '#FFB020',
                'ai-blue': '#4DA3FF',
            },
            fontFamily: {
                'display': ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px -5px rgba(28, 231, 131, 0.4)',
                'glow-lg': '0 0 50px 10px rgba(28, 231, 131, 0.15)',
                'glow-red': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'slideRight': 'slideRight 1.5s ease-in-out infinite',
                'fadeIn': 'fadeIn 0.5s ease-out forwards',
                'slideUp': 'slideUp 0.4s ease-out forwards',
                'truck': 'motion 1s linear infinite',
                'road': 'roadAnimation 1.4s linear infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 20px -5px rgba(28, 231, 131, 0.3)' },
                    '100%': { boxShadow: '0 0 50px 10px rgba(28, 231, 131, 0.15)' },
                },
                slideRight: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(200%)' },
                },
                fadeIn: {
                    'from': { opacity: '0', transform: 'translateY(10px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    'from': { opacity: '0', transform: 'translateY(20px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                motion: {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(3px)' },
                    '100%': { transform: 'translateY(0px)' },
                },
                roadAnimation: {
                    '0%': { transform: 'translateX(0px)' },
                    '100%': { transform: 'translateX(-350px)' },
                },
            },
        },
    },
    plugins: [],
}
