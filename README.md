# Blogify

A fully responsive blogging app built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui** primitives, **Redux Toolkit + RTK Query** for state/data, and **Clerk** for authentication — wired up to a real **Spring Boot** backend.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your real Clerk keys + backend URL, see below
npm run dev
```

Open http://localhost:3000. You'll be redirected to `/login` until you sign in. Once your backend is running (default `http://localhost:8070`, see `BACKEND_API_URL`), the whole app — feed, posts, comments, follows, notifications, profile — is driven by real API calls.

To build for production:

```bash
npm run build
npm run start
```

## Environment setup

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

BACKEND_API_URL=http://localhost:8070
```

See `.env.example` for the full annotated version. Clerk setup steps (dashboard config for email OTP + Google) are unchanged from before — see the comments in `.env.example`.

## How the frontend talks to the backend (secure by design)

```
Browser (RTK Query)
   │  same-origin fetch, httpOnly cookie travels automatically,
   │  token itself is never visible to client-side JS
   ▼
/api/backend/[...path]  (src/app/api/backend/[...path]/route.ts — our own Next.js Route Handler)
   │  reads the `accessToken` cookie server-side, attaches
   │  Authorization: Bearer <token>
   ▼
apiFetch()  (src/lib/api/base-api.ts — the "base API" function)
   ▼
Real backend, e.g. http://localhost:8070/api/v1/...
```

- **`src/proxy.ts`** protects every route except `/login`, and mirrors the current Clerk session into an httpOnly `accessToken` cookie on every request (see "Setting up Clerk" history below for the `refreshToken` caveat — unchanged from before).
- **`src/lib/api/base-api.ts`** exports `apiFetch()`, the base function that automatically attaches the access token from that cookie to every outgoing request. It's server-only (`import "server-only"`).
- **`src/app/api/backend/[...path]/route.ts`** is a catch-all proxy: any path under `/api/backend/*` is forwarded to `${BACKEND_API_URL}/api/v1/*` via `apiFetch()`, for every HTTP method, including multipart file uploads. This is what makes "secure by design" possible — the browser never needs the raw token, because it never calls the real backend directly.
- **`src/lib/store/api/blogifyApi.ts`** is an RTK Query `createApi` slice with every endpoint the backend exposes (see below), all pointed at `/api/backend` (our proxy), not the real backend URL. This is "the API client" — every component calls a typed hook from here (`useGetFeedQuery`, `useReactToBlogMutation`, etc.) and never constructs a fetch call by hand.

## What's wired up to the real backend

| Area | Endpoints used |
|---|---|
| Feed (For you / Following), trending posts | `GET /blogs`, `GET /blogs/trending` |
| Post detail, publish, react, bookmark | `GET/POST/PUT/DELETE /blogs/**`, `/blogs/{id}/reactions`, `/blogs/{id}/bookmark` |
| Comments, replies, comment reactions | `/comments/blogs/{blogId}`, `/comments/{id}`, `/comments/{id}/reactions` |
| Notifications | `GET /notifications`, `/notifications/read-all`, `/notifications/{id}/read` |
| Profile (me + public), avatar/cover upload | `/users/me`, `/users/{handle}`, `/users/{handle}/blogs`, `/assets/upload` |
| Follow / unfollow, followers, following, suggested | `/users/{id}/follow`, `/users/{handle}/followers`, `/following`, `/users/suggested` |
| Search, trending tags, tagged posts | `/search/blogs`, `/search/users`, `/tags/trending`, `/tags/{tag}/blogs` |

Every one of these is a typed RTK Query hook in `src/lib/store/api/blogifyApi.ts` — see that file for the exact list and cache-tag/invalidation setup.

## ⚠️ Known backend gaps (found while integrating — nothing to fix on the frontend, listed here for the backend)

### Blocking — auth isn't enforced or resolved yet
1. **`SecurityConfig` permits every request; there's no JWT verification configured.** No `oauth2ResourceServer`/JWKS integration despite Clerk issuing standard, verifiable RS256 JWTs (a working Spring config for this is documented further down).
2. **`CurrentUserResolver.requireCurrentUserId()` always throws `UnsupportedOperationException`** (→ HTTP 500), and **`resolveCurrentUserIdOrNull()` always returns `null`.** Practical effect right now:
   - Every endpoint that needs to know who's calling — create/update/delete blog, comment/reply/edit/delete comment, react to a blog or comment, bookmark/unbookmark, follow/unfollow, update my profile — returns **500**, regardless of whether a valid token is sent.
   - Every endpoint that *personalizes* a read (`myReaction`, `bookmarked`, `isFollowing`, `GET /users/me`) silently treats every caller as anonymous.
   - You can browse the public feed, search, and trending tags right now; you can't post, react, comment, follow, or edit your profile until this is implemented.
3. **Two service methods discard the access token they're given.** `BlogServiceImpl` and `CommentServiceImpl` call `currentUserResolver.requireCurrentUserId(null)` — a hardcoded `null` — instead of the `accessToken` parameter already passed in from their controllers. `FollowServiceImpl` / `UserServiceImpl` / `NotificationServiceImpl` thread it through correctly. Worth fixing both of these *and* implementing the resolver itself.

### Feature gaps — the frontend had UI for these; removed/disabled since there's nowhere for the data to go
4. **No video support.** `BlockType` has no `VIDEO` variant, `AssetType` has no video category, and the S3 upload's allowed content types are image-only (jpeg/png/webp/gif). I removed the video-block editor and its "Video" toolbar button from `/create` (was previously a client-only mock feature). Happy to wire it back in once `BlockType.VIDEO` + a video `AssetType` + a video content-type allowance exist.
5. **No "last active" / presence field.** The `Users` entity has nothing like `lastActiveAt`. I removed the "active in your network" bar that was previously on Home (mock-only feature with zero backing data on the real backend).
6. **No "liked posts" listing** — only bookmarks has a dedicated endpoint (`GET /blogs/bookmarks`), so the profile page is Posts/Saved/About now (dropped the separate "Liked" tab).

### Smaller / worth knowing about
7. **No unread-notification-count endpoint.** The sidebar/bottom-nav badge counts `isRead === false` over the most recent 50 notifications client-side — accurate for recent activity, not a true global count past that.
8. **Settings → Notifications/Privacy toggles are local-only.** There's no backend endpoint for these preferences, so they persist in the browser (Redux) only, not on the server.
9. **No per-user followers/following pages.** `/users/{handle}/followers` and `/following` work for *any* handle, but I only built the UI for *your own* lists (`/follow`) — would be a quick addition on the same endpoints.
10. **Pagination shape.** Spring Boot 3.3's default `Page<T>` JSON is `{ content: [...], page: { size, number, totalElements, totalPages } }` — no `last`/`first`/`pageable`. The frontend's `ApiPage<T>` type (`src/lib/api/types.ts`) matches this exactly; if `@EnableSpringDataWebSupport(pageSerializationMode = DIRECT)` is ever added, that shape changes and the frontend type needs updating too.
11. **Upload limits matched to current backend config**: 5MB max, `image/jpeg|png|webp|gif` only, per `application-local.yaml`'s `app.aws.s3` settings.

### Verified working / non-issues
- **Clerk's access token works fine with a Spring Boot resource server** — it's a standard RS256 JWT with a public JWKS endpoint. Minimal setup:
  ```yaml
  # application.yml
  spring:
    security:
      oauth2:
        resourceserver:
          jwt:
            jwk-set-uri: https://YOUR-CLERK-FRONTEND-API/.well-known/jwks.json
  ```
  ```java
  @Configuration
  @EnableWebSecurity
  public class SecurityConfig {
      @Bean
      SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
          http
              .authorizeHttpRequests(auth -> auth
                  .requestMatchers(HttpMethod.GET, "/api/v1/blogs/**", "/api/v1/search/**", "/api/v1/tags/**").permitAll()
                  .anyRequest().authenticated())
              .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
          return http.build();
      }
  }
  ```
  Add `spring-boot-starter-oauth2-resource-server`, implement `CurrentUserResolver` to read `jwt.getSubject()` (Clerk's user id) from the `Jwt` principal Spring Security injects, and map it to your internal `Users.id` — no Clerk SDK needed on the backend at all.
- All DTO shapes, enum values, and route paths in `src/lib/api/types.ts` / `src/lib/store/api/blogifyApi.ts` were checked field-by-field against the backend's controllers/DTOs/enums, including the `/users/{id}/follow` (uses the user's **UUID**, not handle) vs. `/users/{handle}` (uses **handle**) distinction.

## What's inside

- **Login** (`/login`) — email OTP and Google sign-in via Clerk, themed to match the app.
- **Home** (`/`) — real feed ("For you" / "Following" tabs), quick-create prompt, trending tags + suggested writers rail on large screens — all from the backend.
- **Follow** (`/follow`) — your real following/followers lists with client-side search and follow/unfollow.
- **Notifications** (`/notifications`) — real activity feed (follows, reactions, comments, replies, mentions), mark-one/mark-all-read.
- **Create** (`/create`) — full post editor: cover photo (upload — goes through `/assets/upload` — gallery, or paste-a-link), title/subtitle, tag chips, reorderable blocks (paragraph, heading, quote, photo), each photo uploaded for real before the post is published.
- **Blog detail** (`/blog/[id]`) — real post + reactions + bookmarking + comments.
- **Tagged posts** (`/tags/[tagName]`) — posts under a given tag, linked from trending tags and post tag chips.
- **Comments** — nested replies, per-comment reactions, live @mention search-and-autocomplete (calls `/search/users` as you type, tags are explicit picks, not guessed from text).
- **Profile** (`/profile` for yourself, `/u/[handle]` for anyone) — real bio/stats/posts/bookmarks, photo upload through the same canvas editor, floating back button on other people's profiles.
- **Settings** (`/settings`) — working light/dark theme switch, real account editing + photo upload, notification/privacy toggles (local-only — see gap #8 above), Danger Zone (real Clerk log out).
- **Global search** — real debounced search against `/search/blogs` and `/search/users`.
- **Canvas image editor** — crop/zoom/rotate/flip/brightness/contrast/saturation for avatar + cover photo, before the result is uploaded.
- **Back navigation** — shared `BackButton` on drill-in pages (post detail, another user's profile, settings, create, tagged posts).

### Chat / messaging — still disabled

Unchanged from before: the "Message" button on other people's profiles is commented out in `src/components/profile/profile-view.tsx`, not deleted.

## State & data layer

- **`src/lib/store/api/blogifyApi.ts`** — RTK Query slice, the single source of truth for all backend data. Components call its generated hooks directly; there's no separate "mock data" Redux slice anymore (those were retired once the real backend landed).
- **`src/lib/store/slices/settingsSlice.ts`** — the only remaining plain Redux slice: theme + local notification/privacy preferences (see gap #8).
- **`src/lib/api/types.ts`** — TypeScript types mirroring every backend DTO/enum field-for-field.

## Structure

```
src/
  app/
    login/[[...rest]]/      Clerk <SignIn /> page (outside the app shell)
    (app)/                  everything behind the login wall, wrapped in AppShell
      page.tsx, follow/, notifications/, profile/, create/, settings/,
      blog/[id]/, u/[handle]/, tags/[tagName]/
    api/backend/[...path]/  catch-all secure proxy to the real backend
  components/
    ui/                shadcn/ui primitives
    layout/             sidebar, mobile top bar, mobile bottom nav, app shell
    blog/                blog card, reaction bar, block renderer, composer prompt
    comments/            comment section, comment item, composer (live mention search), mention text
    editor/              cover/image pickers (real upload), canvas image editor, block editor, tag input, emoji popover
    profile/             profile view, edit-profile dialog
    settings/             appearance/account/notifications/privacy/danger-zone
    search/               global search dialog (real debounced search)
    shared/               user row, verified badge, back button, reaction icon config
    widgets/             trending tags, suggested writers
    providers/            Redux provider, theme sync
  lib/
    store/
      api/blogifyApi.ts     RTK Query — every backend endpoint
      slices/settingsSlice.ts
      index.ts, hooks.ts
    api/
      base-api.ts            server-only apiFetch() — auto-attaches accessToken cookie
      types.ts                TypeScript mirrors of every backend DTO/enum
    clerk-appearance.ts     Clerk component theming
    file-to-data-url.ts     client-side file read + data-URL→Blob helpers (canvas editor)
    use-element-size.ts     ResizeObserver hook (image editor)
    types.ts                local EditorBlock type for the /create draft state
    filters.ts, mentions.ts, format.ts, comment-utils.ts
  proxy.ts                  Clerk auth gate + accessToken/refreshToken cookie sync
```

## Design system

Three-color, theme-aware palette defined as CSS variables in `src/app/globals.css`:

- **Slate** — base background/text/borders
- **Indigo** — primary actions, links, active nav state
- **Amber** — single accent for reactions, unread dots, highlights

Responsive layout: bottom tab bar + top bar on mobile, icon-only sidebar at `md`, full labeled sidebar at `lg+`, with an extra widget rail on `xl+` screens on the home page.

## Notes

- Your Clerk session is real; the *data* (posts, follows, comments, etc.) is now entirely backend-driven — nothing resets on refresh anymore (that was a mock-data-era behavior).
- Until backend gap #1/#2 above are fixed, expect write actions (post, comment, react, follow, edit profile) to fail with a 500 from the backend — the frontend surfaces these as toasts ("Couldn't publish", "Couldn't save your changes", etc.) rather than crashing.
- Uploaded images go through `/assets/upload` for real (S3-backed) — the canvas editor's output is converted to a `Blob` and uploaded before any URL is saved.
