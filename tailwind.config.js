/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.html",
    "./js/**/*.js",
    // Add any other file types that use Tailwind classes
  ],
  theme: {
    extend: {
      // Brand Colors
      colors: {
        'navy': '#0A1018',
        'navy-light': '#1a2332',
        'navy-tertiary': '#2a3548',
        'gold': '#C9A772',
        'gold-dark': '#9D7F52',
        'gold-light': '#E8D4B8',
        'accent-light': '#f0e6d8',
      },
      
      // Typography
      fontFamily: {
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'body': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      
      // Custom Shadows
      boxShadow: {
        'island': '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
        'gold': '0 0 20px rgba(201, 167, 114, 0.3)',
        'gold-lg': '0 0 40px rgba(201, 167, 114, 0.5)',
      },
      
      // Custom Animations
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201, 167, 114, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201, 167, 114, 0.6)' },
        },
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      
      // Backdrop Blur
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
  
  // Important: Disable preflight if you want to keep your custom CSS
  // corePlugins: {
  //   preflight: false,
  // },
}
