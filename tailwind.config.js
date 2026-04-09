export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        /* Warm Caramel Primary Palette */
        'primary': {
          '50': '#FAF6F3',
          '100': '#F2E8E0',
          '200': '#E8C4A0',
          '300': '#DEB88C',
          '400': '#D4A574',
          '500': '#CA9860',
          '600': '#C49464',
          '700': '#B0824F',
          '800': '#8B6840',
          '900': '#6B5232'
        },
        /* Status Colors */
        'success': '#27AE60',
        'warning': '#F39C12',
        'active': '#3498DB',
        'alert': '#E74C3C',
        /* Warm Neutral Scale */
        'neutral': {
          '50': '#FDFBF9',
          '100': '#F5F3F0',
          '200': '#EAE5E0',
          '300': '#D4CDCA',
          '400': '#B5ADAA',
          '500': '#8B8680',
          '600': '#6B6560',
          '700': '#4A4540',
          '800': '#2D2A27',
          '900': '#1A1815'
        },
        /* Surface Colors */
        'surface': {
          '50': '#FDFBF9',
          '100': '#F5F3F0',
          '200': '#EAE5E0',
          '900': '#1A1815'
        }
      },
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'SF Pro Display', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'monospace']
      }
    }
  },
  plugins: []
}
