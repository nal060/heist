# Heist — Claude Rules

## Project Overview
React Native food surplus marketplace (Expo Router + Supabase). Consumers buy discounted food bags from local businesses. Dual-role app: consumer tabs and business tabs, role-determined at runtime via `AuthContext.userRole`.

---

## Architecture

| Layer | Location | Rule |
|-------|----------|------|
| Screens | `app/(group)/screen.tsx` | One screen per file, default export |
| Shared UI | `src/components/ui/` | Check here first before creating any new component |
| Domain components | `src/components/bags/`, `business/`, `favorites/` | Domain-specific reusables |
| Data functions | `src/data/index.ts` (consumer), `src/data/business.ts` (business) | All Supabase calls live here |
| Types | `src/types/index.ts` | All interfaces and type aliases |
| Theme | `src/theme/` | Tokens only — never hardcode values |
| Strings | `src/constants/strings.ts` | All user-visible text |
| Utils | `src/utils/` | Pure formatters and helpers |
| Context | `src/context/` | Global state only |

---

## Hard Rules (never break these)

### Styling
- **No inline styles** in JSX. The only exception: simple spacing shims with `<View style={{ height: spacing.X }} />` when a named style would be used exactly once and has no semantic meaning.
- **StyleSheet.create** always at the **bottom** of the file, always named `styles`.
- **Never hardcode** colors, spacing, font sizes, or border radii. Use tokens from `src/theme/`:
  - `colors.primary[500]`, `colors.text.secondary`, `colors.background.primary`
  - `spacing.md`, `spacing.xl`
  - `typography.fontSize.base`, `typography.fontWeight.bold`
  - `borderRadius.md`, `shadows.md`
- Spread shadows with a cast: `...(shadows.md as ViewStyle)`
- Page backgrounds: `colors.background.primary`. Card on secondary bg: `borderWidth: 1, borderColor: colors.gray[200]`.

### Strings
- **All user-facing text goes in `src/constants/strings.ts`** under the appropriate nested key. Never write display text directly in JSX.
- The app is in **Spanish** — all new strings should be in Spanish.

### Components
- **Check `src/components/ui/` before creating anything new.** These already exist: `Button`, `Card`, `Badge`, `ScreenShell`, `ScreenHeader`, `FormField`, `EmptyState`, `ErrorState`, `SearchBar`, `PriceDisplay`, `RatingBadge`, `CategoryPill`, `Divider`, and more.
- Use `EmptyState` for no-data scenarios. Use `ErrorState` for failed fetches. Do not build custom one-off empty/error layouts.
- Props interface is always named `ComponentNameProps`. No default values in the interface — put them in the destructure: `function Btn({ disabled = false }: BtnProps)`.
- Variant/size lookup maps go above the component, typed as `Record<Variant, Value>` with SCREAMING_SNAKE_CASE name: `const HEIGHT_MAP: Record<ButtonSize, number> = { ... }`.

### TypeScript
- Strict mode is on. No `any`.
- `interface` for object shapes, `type` for unions and aliases.
- All async data functions have explicit return types: `Promise<Order[]>`.
- Use `import type` for type-only imports.

### Data Layer
- All Supabase calls live in `src/data/`. Screens never import from `src/lib/supabase.ts` directly.
- Pattern: destructure `{ data, error }`, throw `new Error(error.message)` on error, return `data ?? []` for lists.
- Parallel fetches use `Promise.all([...])`.
- Constants shared between functions (like status configs, day abbreviations) go at module level in SCREAMING_SNAKE_CASE.

### Database (Supabase)
- Every new table **must** have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and complete RLS policies (SELECT, INSERT, UPDATE, DELETE where applicable).
- Migration files go in `supabase/migrations/` with timestamp prefix: `YYYYMMDDHHMMSS_description.sql`.
- Add indexes on all foreign key columns in the same migration as the table.

### Navigation
- `router.replace()` for auth redirects. `router.push()` for normal navigation. `router.back()` to go back.
- Route params via dynamic segments `[id].tsx`, extracted with `useLocalSearchParams<{ id: string }>()`.
- All Stack.Screen options live in `app/_layout.tsx`, not scattered in screen files.

---

## Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Components, interfaces | PascalCase | `BagCardHorizontal`, `OrderWithDetails` |
| Props interface | `ComponentNameProps` | `ButtonProps` |
| Union types | PascalCase | `OrderStatus`, `ButtonVariant` |
| Functions, hooks, variables | camelCase | `formatCurrency`, `useAuth`, `isLoading` |
| Module-level constants | SCREAMING_SNAKE_CASE | `FIFTY_MILES_IN_METERS`, `STATUS_CONFIG` |
| Style object | always `styles` | `const styles = StyleSheet.create(...)` |
| Style keys | camelCase | `container`, `businessName`, `pickupText` |

---

## File Structure Within a Screen

```
1. Imports (React → RN → Expo Router → third-party → UI components → theme/constants → data/utils → types)
2. Module-level constants and config maps
3. Component function
   a. Hooks (state, router, context, insets)
   b. Callbacks (useCallback)
   c. Effects (useEffect)
   d. Computed/derived values
   e. Early returns (loading, error)
   f. JSX return
4. StyleSheet.create at the very bottom
```

---

## Icons
Always `Ionicons` from `@expo/vector-icons`. Cast names when needed:
```tsx
<Ionicons name={'compass' as React.ComponentProps<typeof Ionicons>['name']} size={24} color={colors.primary[500]} />
```

## Safe Area
Always `useSafeAreaInsets()` from `react-native-safe-area-context`. Apply to headers (top) and footers (bottom). Never hardcode padding values for notch/home indicator avoidance.

## Platform Differences
Isolate in theme files (`shadows.ts`, `typography.ts`) or with inline `Platform.OS === 'ios' ? ... : ...`. Keep platform checks minimal.

## Lists
- `FlatList` for large/pageable lists — always include `keyExtractor`, `showsVerticalScrollIndicator={false}`, and a `ListEmptyComponent`.
- `ScrollView` + `.map()` for small fixed collections (<20 items).
- Horizontal carousels: `horizontal showsHorizontalScrollIndicator={false}`.
- Separators: `ItemSeparatorComponent={() => <View style={styles.separator} />}` (not inline).

## Async State Pattern
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(false);
const [data, setData] = useState<Thing[]>([]);

const load = useCallback(() => {
  setLoading(true);
  setError(false);
  fetchThing()
    .then(setData)
    .catch(() => setError(true))
    .finally(() => setLoading(false));
}, []);
```

## Comments
Only comment the **why**, never the what. One line max. Good: `// Silently reload — no pull-to-refresh indicator needed`. Bad: `// Set loading to true`.
Use section separators in long files: `// ─── Section Name ────────────────────────────────────`.

## Accessibility
All interactive elements need `accessibilityRole` and `accessibilityLabel`. Touch targets need `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}` when smaller than 44×44pt.
