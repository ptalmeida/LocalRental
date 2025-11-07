# Theme System Documentation

## Overview

The application uses a centralized theme system for consistent styling across all components. This follows best practices for maintainability and design consistency.

## Structure

### Theme Configuration (`src/theme.ts`)

Central theme object containing all design tokens:

```typescript
import { theme } from './theme';

// Access theme values
theme.colors.navy
theme.typography.fontHeading
theme.spacing.md
theme.transitions.fast
```

### Available Theme Properties

#### Colors
- **Primary**: `navy`, `navyDark`, `navyLight`
- **Neutrals**: `grayBg`, `grayLight`, `white`
- **Text**: `textDark`, `textMedium`, `textLight`, `textOnNavy`
- **Borders**: `border`
- **States**: `error`, `errorBg`, `errorBorder`

#### Typography
- **Font Families**: `fontHeading` (Montserrat), `fontBody` (Open Sans)
- **Weights**: `weightRegular`, `weightSemiBold`, `weightBold`, `weightExtraBold`
- **Sizes**: `sizeXs` to `size3Xl`
- **Line Heights**: `lineHeightTight`, `lineHeightNormal`, `lineHeightRelaxed`

#### Spacing
- `xs` (4px), `sm` (8px), `md` (16px), `lg` (24px), `xl` (32px), `2xl` (48px)

#### Layout
- `headerHeight`: Fixed header height (60px)
- `maxWidth`: Maximum content width (1100px)
- `sidebarWidth`: Left sidebar width (384px)

#### Transitions
- `fast`: 0.2s ease-in
- `normal`: 0.3s ease-in-out
- `slow`: 0.4s ease-in-out

#### Shadows
- `neumorphic`, `neumorphicSm`, `neumorphicLg`, `neumorphicInset`

#### Border Radius
- `sm` (8px), `md` (12px), `lg` (16px), `xl` (24px)

## CSS Variables

All theme values are also available as CSS custom properties in `index.css`:

```css
:root {
  --color-navy: #0f2f7f;
  --font-heading: 'Montserrat', sans-serif;
  --transition-fast: all 0.2s ease-in;
}
```

Use in CSS:
```css
.element {
  color: var(--color-navy);
  font-family: var(--font-heading);
}
```

## Component Architecture

### Separated Components

Each UI component is in its own file for maintainability:

- `Header.tsx` - Main navigation header
- `NavLink.tsx` - Navigation link component with hover effects
- `PropertyList.tsx` - Property listing sidebar
- `PropertyDetail.tsx` - Property details panel
- `StatsPanel.tsx` - Statistics dashboard
- `Map.tsx` - MapLibre GL map component

### Component Pattern

All components should:
1. Import theme from `../theme`
2. Use theme values instead of hardcoded styles
3. Follow TypeScript strict typing
4. Use proper prop interfaces

Example:
```typescript
import { theme } from '../theme';

interface MyComponentProps {
  active: boolean;
  onClick: () => void;
}

export default function MyComponent({ active, onClick }: MyComponentProps) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: theme.colors.navy,
        fontFamily: theme.typography.fontHeading,
        padding: theme.spacing.md,
        transition: theme.transitions.fast,
      }}
    >
      Click me
    </button>
  );
}
```

## Design System Consistency

The theme is based on the design system from [ptalmeida.com](https://www.ptalmeida.com):

- **Navy blue** (`#0f2f7f`) as primary brand color
- **Montserrat** for headings (bold, professional)
- **Open Sans** for body text (readable, clean)
- **Light gray** (`#EFEFEF`) backgrounds
- **0.2s transitions** for interactive elements
- **Neumorphic shadows** for depth

## Benefits

✅ **Single source of truth** - All design tokens in one place
✅ **Type safety** - TypeScript ensures correct usage
✅ **Easy maintenance** - Change once, update everywhere
✅ **Consistent design** - No arbitrary magic numbers
✅ **Better DX** - Autocomplete for all theme values
✅ **CSS + JS** - Available in both contexts

## Migration Guide

When updating existing components to use the theme:

1. Import theme: `import { theme } from '../theme';`
2. Replace hardcoded colors with `theme.colors.*`
3. Replace font families with `theme.typography.font*`
4. Replace spacing with `theme.spacing.*`
5. Replace transitions with `theme.transitions.*`

Before:
```typescript
style={{ color: '#0f2f7f', fontFamily: 'Montserrat, sans-serif' }}
```

After:
```typescript
style={{ color: theme.colors.navy, fontFamily: theme.typography.fontHeading }}
```
