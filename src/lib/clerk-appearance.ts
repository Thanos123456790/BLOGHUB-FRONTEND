/**
 * Themes Clerk's prebuilt components (the <SignIn /> on /login, plus any
 * <UserButton />/<UserProfile /> you add later) to match Blogify's
 * slate / indigo / amber design system. Colors are pulled from the same CSS
 * variables defined in globals.css, so this automatically follows light/dark
 * mode too.
 *
 * Left untyped on purpose: Clerk's own `appearance` prop is typed `any` at
 * the <ClerkProvider> level (see @clerk/shared), and the shape varies
 * slightly between Clerk versions — passing a plain object keeps this file
 * resilient to those differences instead of importing a specific version's
 * internal type.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--primary)",
    colorBackground: "var(--card)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorInputBackground: "var(--background)",
    colorInputText: "var(--foreground)",
    colorDanger: "var(--destructive)",
    colorNeutral: "var(--foreground)",
    borderRadius: "var(--radius)",
    fontFamily: "inherit",
  },
  elements: {
    rootBox: "w-full",
    card: "shadow-none border border-border bg-card p-0 w-full",
    header: "hidden",
    main: "gap-5",
    socialButtonsBlockButton:
      "rounded-full border-border hover:bg-muted text-foreground font-medium",
    socialButtonsBlockButtonText: "font-medium text-sm",
    dividerRow: "gap-3",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground text-xs",
    formFieldLabel: "text-foreground text-sm font-medium",
    formFieldInput:
      "rounded-full border-border bg-card focus:border-ring focus:ring-2 focus:ring-ring/30",
    formButtonPrimary:
      "rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm normal-case shadow-sm",
    footerActionLink: "text-primary hover:underline font-medium",
    footerActionText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary",
    formResendCodeLink: "text-primary",
    otpCodeFieldInput: "border-border rounded-xl",
    alternativeMethodsBlockButton: "rounded-full border-border hover:bg-muted",
    footer: "hidden",
  },
} as const;
