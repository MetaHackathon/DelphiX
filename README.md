# Remix + TailwindCSS + shadcn/ui Starter

A modern web application starter built with [Remix](https://remix.run), [TailwindCSS](https://tailwindcss.com), and [shadcn/ui](https://ui.shadcn.com) components.

## 🚀 What's Included

- **Remix** - Full-stack web framework focused on web standards and modern UX
- **TailwindCSS** - Utility-first CSS framework with custom design system
- **shadcn/ui** - Beautiful components built with Radix UI and Tailwind CSS
- **TypeScript** - Type safety and better developer experience
- **Vite** - Lightning fast build tool with HMR
- **Dark Mode** - Built-in dark mode support

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
app/
├── components/
│   └── ui/          # shadcn/ui components
├── lib/
│   └── utils.ts     # Utility functions
├── routes/          # Remix routes
└── tailwind.css     # Global styles & CSS variables
```

## 🎨 Adding New shadcn/ui Components

You can add new shadcn/ui components using the CLI:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

Or manually create components in `app/components/ui/` following the shadcn/ui patterns.

## 🌙 Dark Mode

Dark mode is configured and ready to use. The app includes CSS variables for both light and dark themes. You can toggle dark mode by adding the `dark` class to your HTML element.

## 📚 Useful Resources

- [Remix Documentation](https://remix.run/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://radix-ui.com)

## 🚀 Deployment

To deploy your app, you may need to install an adapter for your target environment.

```bash
npm run build
```

Check out the [deployment docs](https://remix.run/docs/en/main/guides/deployment) for more information.
