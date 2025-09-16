# 🕵️ Impostor Word Game

A fun party game built with Vue 3, TypeScript, and Tailwind CSS where players try to find the impostor who doesn't know the secret word!

## 🎯 How to Play

1. **Setup**: Choose the number of players (3-20) and select a category
2. **Word Distribution**: Each player except one (the impostor) receives the same secret word
3. **Discussion**: Players take turns describing the word without saying it directly
4. **Detection**: After discussion, players vote to eliminate who they think is the impostor
5. **Victory**: 
   - **Impostor wins** if they avoid detection and correctly guess the word
   - **Other players win** if they successfully identify the impostor

## ✨ Features

- 🎲 **Deterministic randomization** - Same game setup always produces the same impostor and word
- 📱 **Mobile-friendly** responsive design
- 🎨 **Beautiful UI** with smooth animations and modern design
- 🎯 **Multiple categories** with extensive word banks
- 👑 **Starting player indicator** for organized gameplay
- 🔄 **Easy round management** with one-click new rounds
- 💾 **Persistent settings** using local storage
- 📖 **Built-in rules** and helpful instructions

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or download** this project
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎮 Game Categories

- **Everyday** - Common household items and daily objects
- **Food** - Delicious dishes and cuisine from around the world  
- **Places** - Locations and destinations
- **Animals** - Creatures from land, sea, and air
- **Sports** - Athletic activities and games
- **Technology** - Modern gadgets and digital devices

## 🛠️ Technical Details

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Vite** for fast development and building
- **VueUse** for useful composables
- **Lucide Vue** for beautiful icons

## 🎨 User Experience Features

- **Smooth animations** and transitions
- **Visual feedback** for interactive elements
- **Clear visual hierarchy** and intuitive layout
- **Accessibility considerations** with proper labeling
- **Mobile-optimized** touch targets and responsive grid
- **Progressive disclosure** to avoid overwhelming users
- **Helpful tooltips** and contextual information

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the game!

## 📄 License

This project is open source and available under the MIT License.

---

**Have fun finding the impostor!** 🕵️‍♂️🕵️‍♀️