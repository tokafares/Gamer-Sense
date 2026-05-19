export default {
content: ['./index.html', './src/**/*.{ts,tsx}'],
theme: {
    extend: {
    fontFamily: {
      beaufort: ['"Beaufort for LOL"', 'Cinzel', 'serif'],
    },
    colors: {
        gs: {
        bg:        '#F0F2F5',
        navy:      '#060F1E',
        card:      '#0D1F3C',
        cardLight: '#112040',
        footer:    '#0A1628',
        border:    '#1E3A5F',
        teal:      '#00C9A7',
        tealLight: '#38E8CC',
        gold:      '#C9A227',
        text:      '#E8EDF5',
        textMuted: '#8FA3C0',
        }
    }
    }
},
plugins: [],
}