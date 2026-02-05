# Social Media App - Frontend

A sleek, premium, and fully responsive User Interface built with React and Tailwind CSS.

## ✨ Highlights

- **Modern Aesthetics**: Dark-themed UI with glassmorphism, smooth gradients, and subtle glow effects.
- **Seamless Auth Flow**: integrated Login, Signup, and Forgot Password pages with real-time validation.
- **Dynamic Feed**: Real-time interaction for likes and comments.
- **AI Integration**: "Magic Bio" generator that suggests creative profiles using AI.
- **Global State**: Centralized Auth context handling users, session tokens, and notification badges.
- **Responsive Design**: Mobile-first architecture that looks great on all devices.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/) with automatic token-refresh interceptors.

## 📦 Project Structure

```text
frontend/
├── src/
│   ├── api/          # Axios client and API mapping
│   ├── components/   # Reusable UI components
│   ├── context/      # AuthContext for global state
│   ├── pages/        # Main route views (Feed, Profile, Settings)
│   └── App.jsx       # Main application shell
└── tailwind.config.js # Custom design tokens
```

## ⚙️ Setup & Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configuration**:
   Ensure the API base URL in `src/api/client.js` matches your backend address:
   ```javascript
   export const API_BASE_URL = 'http://127.0.0.1:8000';
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## 🎨 UI Reference

The application uses a strict design system based on:
- **Primary Background**: `#000000` (True Black)
- **Accent Blue**: `#0095f6`
- **Surface**: `#0a0a0a` with subtle borders
- **Typography**: Inter / System Sans-Serif
