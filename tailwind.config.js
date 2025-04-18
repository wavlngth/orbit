/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'issetdarkmode',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tovybg: "#FF0099", // old colour here for backwards compatibility
        orbit: "#FF0099", 
		    primary: 'rgb(var(--group-theme) / <alpha-value>)',
      },
	  backgroundImage: {
		infobg: "url('/tovybackground.svg')"
	  }
    },
    
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],

};
