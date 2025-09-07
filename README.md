# Workload Stats

A React application for tracking production workload and displaying meaningful statistics about your work output.

## Features

- **Mobile-first responsive design** using Tailwind CSS
- **Interactive form** with cascading dropdowns (Line → Part → Production)
- **Real-time calculations** based on your production data
- **GSAP ScrollTrigger animations** with smooth fade-in/fade-out effects
- **Pixi.js canvas animations** with interactive visual elements:
  1. **Worker lifting box** - Animated worker character lifting a box
  2. **Worker straining under weight** - Worker struggling with a large weight circle
  3. **Cash stacking animation** - Multiple cash stacks bouncing and stacking
  4. **Wage vs profit comparison** - Small vs giant cash stack visualization
- **Four full-screen result sections** (100vh each) with dynamic animations

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

1. Select a production line from the dropdown
2. Choose a specific part (SKU) from the available options
3. Enter your production count (maximum 15,000)
4. Click "Calculate My Stats" to see your results
5. Scroll down through the four result sections

## Data Source

The app uses data from `part_list.json` which contains:
- Line information
- SKU numbers
- Carton quantities
- Unit weights
- Pricing information

## Technologies Used

- React 18
- Tailwind CSS
- GSAP 3.13+ with ScrollTrigger
- Pixi.js 7.4+ for canvas animations
- JavaScript ES6+
- Mobile-first responsive design
