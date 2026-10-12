# Design plan

Status: draft, waiting for Maryna's approval. The signature moment is not picked yet (see the options below; the draft recommends one).

## Who it's for

Hiring managers and frontend developers who give it about 90 seconds, and friends who know the cats. In 90 seconds a visitor should see both cats, get a sense of who each one is, and do one thing that makes them smile.

## Palette

Every color below was sampled from photos of Olivka and Simba (median of the pixels in a region, measured with `sharp`). Where a sampled value was too dim to use on screen, it was lightened while keeping its hue, and the table says so.

| Name   | Hex       | Sampled from                                          | Role                                                             |
| ------ | --------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| Stripe | `#241d16` | darkest 10% of the tabby stripes on Olivka's forehead | text; the night band behind the hero                             |
| Chin   | `#f4f4f1` | Olivka's white chin (`#c2c3bd`), lightened            | page background                                                  |
| Olive  | `#475647` | median of Olivka's irises                             | links, focus ring, selected states                               |
| Ticked | `#6b5c4d` | Olivka's ticked coat, chest and legs                  | Olivka's section background (Chin text on it)                    |
| Golden | `#ceb6a1` | lightest fifth of Simba's face fur                    | Simba's section background (Stripe text on it)                   |
| Nose   | `#9c6669` | Simba's nose leather                                  | one small accent only: the noses in the hero drawing, never text |

Derived for the hero only: Olivka's eye `#a9b98f` and Simba's eye `#c9c5a0`. Both keep the hue of the sampled irises with more lightness, because the drawn eyes sit on Stripe and need to glow the way real eyes do in a dark room.

Contrast (WCAG 2.2):

| Pair             | Ratio  | Passes                                                                           |
| ---------------- | ------ | -------------------------------------------------------------------------------- |
| Stripe on Chin   | 15.1:1 | AA and AAA, body text                                                            |
| Olive on Chin    | 7.08:1 | AA and AAA, links                                                                |
| Chin on Ticked   | 5.84:1 | AA, body text in Olivka's section                                                |
| Stripe on Golden | 8.58:1 | AA and AAA, body text in Simba's section                                         |
| Golden on Stripe | 8.58:1 | AA and AAA, hero text                                                            |
| Olive on Golden  | 4.03:1 | large text and UI only, so links in Simba's section use Stripe with an underline |
| Nose on Chin     | 4.22:1 | not used for text                                                                |

There is no dark theme. The hero is already dark, and one well-tuned light page is better than two half-tuned ones. This can change later.

## Type

Two families, both self-hosted through Fontsource.

- **Caprasimo** (display). A soft, heavy serif in the Cooper tradition: round counters, blunt terminals. It is as round as a British Shorthair's face. It's used only for the site title, the cats' names, and section headings. It has a single weight, so hierarchy comes from size alone.
- **Atkinson Hyperlegible Next** (text and UI, variable 200–800). The Braille Institute designed it so similar letterforms (I/l/1, O/0) are easy to tell apart. The site is about craft, so the body face is chosen for readers, not for fashion. Weights in use: 400 body, 600 UI labels, 700 strong.

Fluid scale, 1.2 ratio at 360px growing to 1.25 at 1440px, base 16px → 18px:

| Token       | 360px  | 1440px | Use                                |
| ----------- | ------ | ------ | ---------------------------------- |
| `--step--1` | 13.3px | 14.4px | captions, photo credits, footnotes |
| `--step-0`  | 16px   | 18px   | body                               |
| `--step-1`  | 19.2px | 22.5px | lead paragraph, filter buttons     |
| `--step-2`  | 23px   | 28.1px | h3                                 |
| `--step-3`  | 27.6px | 35.2px | h2 (Photos, the game)              |
| `--step-4`  | 33.2px | 43.9px | not used yet                       |
| `--step-5`  | 39.8px | 54.9px | cat names in their sections        |
| `--step-6`  | 47.8px | 68.7px | site title                         |

Body line length is capped at 65ch. Line height is 1.5 for text and 1.05 for Caprasimo.

## Layout

One page, five parts. On narrow screens everything stacks in source order. The two cat sections are deliberately not mirror images of each other: Olivka's is compact, dark, and photo-led; Simba's is light, open, and its photo is larger and breaks out of the band.

```
 desktop, ~1280px wide                                          360px: same order, stacked
┌──────────────────────────────────────────────────────────┐
│ [Skip to content]                (visible only on focus) │
│ Olivka & Simba                    Olivka  Simba  Photos  │  header on Chin, small
├──────────────────────────────────────────────────────────┤
│██████████████████████ hero on Stripe ████████████████████│
│██                                                      ██│
│██      ◖ ▌◗  ◖ ▌◗                  ◖ ▌◗  ◖ ▌◗           ██│  two pairs of drawn eyes,
│██        Olivka                       Simba            ██│  in the cats' iris colors
│██                                                      ██│
│██   Olivka & Simba                                     ██│  h1, Caprasimo, --step-6
│██   Two golden British Shorthairs. TODO(Maryna) line.  ██│
│██   [ signature moment control, if it needs one ]      ██│
│██████████████████████████████████████████████████████████│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Olivka on Ticked ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓┌─────────────────┐                                    ▓▓│
│▓│                 │  Olivka                            ▓▓│  h2, --step-5
│▓│  photo, 4:5,    │  bio, 2–3 short paragraphs         ▓▓│
│▓│  flush left     │  What she's like: a sentence list  ▓▓│
│▓│                 │  Loves / habits as a <dl>          ▓▓│
│▓└─────────────────┘                                    ▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│░░░░░░░░░░░░░░░░░░░░░ Simba on Golden ░░░░░░░░░░░░░░░░┌────┴──────┐
│░░                                                    │           │  photo, 1:1, larger,
│░░   Simba                                            │  photo    │  overlaps the band above
│░░   bio, traits, loves, habits                       │           │
│░░   (text column sits lower than Olivka's)           └────┬──────┘
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├──────────────────────────────────────────────────────────┤
│ Photos                                                    │  h2 on Chin
│ All · Olivka · Simba · Both        (?cat=simba in the URL)│
│ ┌──────┐ ┌────┐ ┌────────┐ ┌──────┐                       │  grid keeps each photo's real
│ │      │ │    │ │        │ │      │                       │  aspect ratio, 4px gaps,
│ └──────┘ │    │ └────────┘ └──────┘                       │  no card frames, no shadows
│ ┌────────┐└────┘┌──────┐ ┌────┐                           │
│ └────────┘      └──────┘ └────┘                           │
├──────────────────────────────────────────────────────────┤
│ Phase 5 feature (A: "Who's that cat?" or B: a day in the  │
│ life), whichever Maryna picks                             │
├──────────────────────────────────────────────────────────┤
│ Made by Maryna in Warsaw? TODO(Maryna) · Source on GitHub │  footer, plain text links
│ · @murmuringcats on Instagram                             │
└──────────────────────────────────────────────────────────┘
```

Spacing uses one scale (`--space-3xs` to `--space-3xl`) that grows with the viewport the same way type does. Content width is 72rem with a gutter of at least 16px. Photos are the only things allowed to touch the viewport edge.

## Signature moment: three options

Pick one. Only that one gets built in Phase 4.

1. **Slow blink (recommended).** Press "Blink slowly at them" and the drawn eyes in the hero close and reopen slowly: Simba answers right away, Olivka a beat later. Among cats this means "I trust you".
2. **Boop.** Tap a cat's nose in their profile photo and the photo squashes toward your finger for a moment, while a quiet counter keeps this visit's boops per cat.
3. **Names in fur.** On first load, a crop of each cat's real coat slides through the letters of their name in the hero once, then settles. Olivka gets ticked tabby, Simba gets plain gold.

The recommendation is 1. It answers an action (it never plays by itself), it's specific to cats rather than to websites, and it degrades well: with reduced motion the eyes swap to closed and back with a short opacity fade and no movement. Option 2 depends on knowing where the nose is in every photo. Option 3 happens on load, so most visitors will scroll past it before they notice.

## Principles for this site

1. **Every color traces back to a pixel of a cat.** If a token can't name the photo region it came from, it doesn't go in `tokens.css`. That includes the background.
2. **Two characters, not two copies.** Anything shown once per cat (profile sections, filters, eyes in the hero) gets different proportions, ground colors, or timing per cat. Shared components take the differences as props from `cats.ts`, so the code stays shared even though the result doesn't.
3. **Loud once, quiet everywhere else.** The hero band and the signature moment are the only bold things. Below the hero: flat color, no shadows, no decorative gradients, nothing animates on scroll, and motion only ever answers a click, key, or swipe.
4. **Photos aren't cropped to fit the UI.** The UI fits the photos instead. The gallery keeps each photo's real aspect ratio, reserves its space before it loads, and never puts photos in rounded cards.

## Review against the brief

I reviewed the first draft against the "avoid" list and the quality floor. These are what I changed:

| First draft                                                                                      | Problem                                                                                             | Changed to                                                                                                                 |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Background lightened from Simba's chest fur (`#c7bca8` → about `#f6f1ea`), with Nose for buttons | That's the cream-plus-warm-accent combination the brief tells me to avoid.                          | Background from Olivka's chin, which is a cool, slightly green neutral. Nose is now used for decoration only.              |
| Nose pink for links and buttons                                                                  | 4.22:1 on the background fails AA for body text.                                                    | Olive (7.08:1). In Simba's section links use Stripe with an underline, because Olive on Golden is only 4.03:1.             |
| Two matching profile cards: photo on top, name, row of trait chips with emoji                    | Identical rounded cards are on the avoid list, and the cats come out as two copies of one template. | Two full-width bands with different grounds, proportions, and photo placement. Traits are written as sentences, not chips. |
| A small uppercase label like "MEET THE CATS" over the profile headings                           | ALL-CAPS eyebrow label.                                                                             | Removed. The cat's name is the heading.                                                                                    |
| Each section fades and slides up on scroll                                                       | On the avoid list, and it's motion nobody asked for.                                                | Nothing animates on scroll. Motion only answers an action, and the signature moment is the one bold exception.             |
| Gallery as a uniform grid of square crops with rounded corners                                   | Crops the photos to suit the UI, and looks like every template.                                     | The grid keeps real aspect ratios, with 4px gaps and square corners.                                                       |
| Footer links with "→" and social icons                                                           | Arrow-on-every-link default.                                                                        | Plain underlined text links.                                                                                               |
| A display serif from the usual shortlist (Fraunces, Playfair)                                    | These are the faces generated sites reach for first.                                                | Caprasimo, picked for the round shapes that match the cats. Atkinson Hyperlegible Next for text, picked for legibility.    |

## Open questions for Maryna

- Approve or change the palette, the type, and the layout.
- Pick the signature moment (1, 2 or 3).
- The hero line under the title. Your Instagram bio says "Professional snugglers. Maximum affection, minimal boundaries." Should the site use it?
- Is it OK to mention Warsaw in the footer, or should the location stay off the site?
- The reference photos so far are the two in the old `cat_website` project. For Phase 3 the gallery needs originals in `raw-photos/` (`olivka-*.jpg`, `simba-*.jpg`, `both-*.jpg`).
