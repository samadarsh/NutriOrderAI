# BiteWise — Pitch Script

> **Duration**: 2–3 minutes  
> **Format**: Live demo walkthrough using `/pitch` route or direct `/app` demo  
> **Audience**: Swiggy MCP Builders Challenge reviewers

---

## Opening (15 seconds)

> **"BiteWise is a food intelligence platform built on Swiggy MCP. It has two products: NutriOrder AI for health-aware meal ordering, and SmartPantry AI for household pantry and grocery planning."**

Navigate to `localhost:3000` → show the landing page hero.

---

## Step 1: Health Profile (20 seconds)

> **"Every recommendation starts from the user's health profile — fitness goal, daily calorie and protein targets, allergies, and dietary preferences."**

Show the health profile cards on `/pitch` Step 1 or the Profile section in `/app`.

**Key callout**: "This isn't a generic restaurant search. It's personalized from the user's body and goals."

---

## Step 2: Smart Meal Recommendations (30 seconds)

> **"When the user searches for a meal, BiteWise queries Swiggy Food MCP for real restaurant availability, then ranks results by nutrition fit, delivery time, cost, and taste."**

Show recommendation cards with:
- Match score and confidence percentage
- Per-meal macros (calories, protein)
- "Best Match" tag on top result
- Why-this-meal explanations

**Key callout**: "Every score is explainable. The user sees tradeoffs before ordering."

---

## Step 3: Pantry Awareness (30 seconds)

> **"Now switch to SmartPantry AI. The household assistant tracks pantry stock against restock thresholds. Out-of-stock items are auto-added to the grocery list."**

Show low-stock alerts:
- 🔴 Rice → OUT OF STOCK (auto-restocked)
- 🟡 Milk, Curd, Tomato → LOW

Show household insights:
- 3 family members with different dietary preferences
- Combined allergens (peanuts)
- Dietary conflict detection (veg vs non-veg)

**Key callout**: "The system knows the whole household, not just one person."

---

## Step 4: Recipe Intelligence (30 seconds)

> **"The 'What Can I Cook?' engine matches pantry stock against 10 recipe templates. It filters by dietary constraints — Jane is vegetarian, so non-veg recipes are skipped. Lemon Rice is skipped because of a peanut allergy."**

Show cook-today panel:
- Coverage bars (75%, 33%, etc.)
- Missing ingredient badges
- Skipped recipes with reasons

**Key callout**: "This is deterministic rule-based intelligence. No LLM hallucination. Testable and demo-safe."

---

## Step 5: Grocery Cart Preview (20 seconds)

> **"Unpurchased items are grouped by category with priority scoring. The Instamart preview shows estimated costs without placing any real order."**

Show grouped grocery list:
- Categories: Dairy, Staples, Eggs & Meat
- Priority badges: 🔴 Urgent, ⚪ Optional
- Cart preview with estimated totals

**Key callout**: "No real Instamart checkout yet. Preview only. Safety-gated by design."

---

## Closing (15 seconds)

> **"BiteWise coordinates food decisions for a person and a home through Swiggy MCP. It's one platform, two products, 52+ tests, and zero real orders placed until the user confirms."**

Show the `/pitch` final CTA or the landing page stats bar.

---

## Backup: If Backend Is Down

Navigate to `/pitch` → the fallback mode shows static sample data with an amber "Preview Mode" badge. The walkthrough still works with representative data.

---

## FAQ Prep

| Question | Answer |
|----------|--------|
| "Is this using real Swiggy data?" | "In mock mode, all MCP calls return realistic but synthetic data. In staging mode, it uses real Swiggy Food MCP endpoints." |
| "Why no real Instamart checkout?" | "Safety-first design. We preview the cart but don't call `checkout` until staging credentials and safety gates are confirmed." |
| "How are recommendations ranked?" | "Multi-factor scoring: nutrition fit, cost, delivery time, taste, and availability. Weights are configurable per user." |
| "Is the recipe engine using AI?" | "No. It's deterministic keyword matching and coverage scoring. Testable, reproducible, no API keys needed." |
