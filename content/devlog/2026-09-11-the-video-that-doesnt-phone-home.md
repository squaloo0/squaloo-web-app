---
title: "The video that doesn't phone home"
date: "2026-09-11"
summary: "We put a 60-second demo on our product page. It contacts YouTube only after you press play — because a page arguing that your data should stay in your building has no business handing you to Google before you've asked for anything."
author: "Squaloo"
status: "draft"
---

We just put a 60-second demo video on our product page. It took about forty minutes longer than pasting in an embed code, and the reason is the most Squaloo thing we've done all month.

## The default behavior nobody mentions

Here is what a standard YouTube embed does. You paste an `<iframe>`, and from then on every single person who opens that page — including the ones who never watch the video, never scroll to it, and leave after four seconds — has their browser reach out to Google's servers. It downloads the player. It runs Google's JavaScript on your page. It does this before the visitor has clicked anything, because the iframe is part of the document and the browser loads the document.

This is so normal that most of us stopped seeing it. It's the web's background radiation.

For most sites, fine. For ours, it was a problem — not a legal one, a **credibility** one.

## The contradiction

The page in question argues that industrial facilities shouldn't have to ship their data to someone else's cloud to get useful AI out of it. That's our whole thesis. Our product runs on a machine inside your building, with the network cable unplugged, and answers questions about your equipment without anything leaving the room.

Now imagine you read that pitch, find it interesting, and out of professional habit open your browser's network tab.

And you watch our page call Google before you've pressed a single button.

Nothing illegal happened. No promise was technically broken — the claim is about our *product*, not our *marketing site*, and any lawyer would tell you those are different things. But you'd have learned something real about us anyway: that we'll say one thing and ship the convenient thing, and that the gap between them is roughly the size of whatever's easiest that afternoon.

That's a bad thing to teach someone in the first ninety seconds.

## What we did instead

The fix is not clever. It's just deliberate.

1. **The thumbnail comes from our own server.** We downloaded it once and committed it. It's 14KB. No request to Google's image CDN.
2. **The player doesn't exist until you click.** What's on the page is an image and a button. Press it, and *then* the iframe gets created and the video loads and plays.
3. **Playback uses the no-cookie variant.** When the player does load, it's the version that holds off on cookies until you actually watch.

In React it's about fifteen lines — a piece of state that starts as `false`, a button that flips it to `true`, and a conditional that renders either a picture or a player.

```jsx
const [playing, setPlaying] = useState(false);

return playing
  ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} … />
  : <button onClick={() => setPlaying(true)}><img src={localPoster} … /></button>;
```

That's the whole trick. It's not novel — this pattern has a name, "facade," and people have been writing about it for years, mostly as a page-speed technique. We're using it for a different reason, but we'll take the speed too: for every visitor who never presses play, none of YouTube's code is downloaded at all.

## Then we checked

Writing the code isn't the same as the code working, and "I'm pretty sure it doesn't load anything" is not a claim we're allowed to make around here.

So we built the page and searched the actual delivered HTML for every mention of `youtube.com` and Google's image CDN.

Zero.

That's the part that matters. Not that we intended the right thing — that the shipped artifact can be inspected by a stranger and the claim survives. Anyone can open our page, open devtools, and confirm nothing goes to Google until they press play. The caption under the video says so in plain language, which is only a safe thing to write if you've checked.

## What we're not claiming

In the spirit of the thing:

- This is our **marketing site**, not our product. Different codebase, different rules, different stakes. Our product's offline guarantees are a separate and much stronger set of claims, tested in CI.
- **Once you press play, YouTube is YouTube.** We've moved the moment of contact from "page load" to "you asked for it." We have not invented private YouTube. Pressing play is consent; loading the page isn't.
- We still use plenty of ordinary infrastructure. We're not claiming monastic purity. We're claiming we thought about this one and picked the version that matches what we say.

If we'd written "no tracking on our site," that would be a bigger claim than we earned, and someone would eventually catch it — which is the exact failure mode this post is about.

## Why bother writing this up

Because it's small, and small is the point.

Anybody can hold a principle when it's load-bearing and expensive and everyone's watching. The interesting question is what you do when it costs forty minutes and *no one would ever have noticed*. We could have pasted the embed. Realistically, not one visitor in a hundred opens devtools on a startup's product page.

But the habit is the product. We're asking industrial customers to believe that when the demo is over and nobody's looking, the software on their floor still isn't sending their data anywhere. That belief doesn't come from a slide. It comes from an accumulated sense that these people apparently sweat this stuff when it doesn't matter, so they probably sweat it when it does.

A play button is a very small place to put a thesis. It's also a place where anyone can check it in ten seconds — which, if you mean it, is exactly where you want it.

---

*Squaloo builds Solomon, an offline-first AI teammate for industrial facilities. We publish our measurements, including the unflattering ones, [on the Measured page](/measured).*
