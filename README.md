# Pianopet

Part homework tracker, part virtual pet dress-up game, Pianopet is a tool for students and teachers to keep on top of assignments and learning goals while providing a creative incentive for students to do their homework: an in-game currency with coins that can be redeemed to dress up their avatars or "pianopets" with clothes and accessories from a virtual marketplace. I built this app for a music teacher friend of mine, so there are a handful of actual kids using it!

Built with:
 - Node.js
 - Express
 - React
 - MongoDB using Mongoose
 - JWT for user authentication

<img src="https://ngw.dev/src/images/portfolio/pianopetpreview.png" alt="pianopet dashboard preview" />

## Try it out

You can demo the app at [this link](http://pianopet.herokuapp.com/demo). Note: Pianopet is hosted on Heroku's free tier and may initially take up to 30 seconds to load, depending on how much traffic it's gotten in the last half hour. Thanks for your patience!

## Overview

### General functionality

**Teacher end:**
- View all students' avatars and account information
- View homework dashboard for individual students
  - Create/read/update/delete homework assignments
  - Approve completed homework in order to "release" coins from completed assignments (mainly to prevent students from collecting rewards for homework they haven't actually completed)
  - Deposit virtual coins directly onto students' accounts
- Create/read/update/delete marketplace categories
- Create/read/update/delete three kinds of marketplace items: avatar colors, wallpapers/backgrounds, and wearables (i.e. clothes and accessories).
  - Set cost, status (active vs. inactive if you don't want it to appear in the marketplace just yet, want certain items to be limited-edition, etc.), and "new item" label to drum up hype for hot new arrivals
  - With wearables, use the drag-and-drop preview to set your uploaded image's size and position relative to the default avatar
  - With wearables (colors and wallpapers constitute their own default categories), pick one category for the item to appear under, and optionally set "occupied regions" from your other categories (e.g. if you have a "Head" item that also covers part of the avatar face and want to prevent "Face" items being worn on top of it, you can set that item to take up or "occupy" the "Face" category as well, while still appearing under "Head" in the marketplace)
- Create/read/update/delete badges
  - Configure badge image, label, and value
  - Award badges to students
- Edit your own account information
- Invite students to join using an invite link connected with your teacher account - once they sign up they'll automatically appear on your dashboard

**Student end:**
- View homework on your dashboard, check off assignments, redeem coins from completed assignments once approved by your teacher
- Redeem coins from badges
- Purchase items from the marketplace
- Dress up your avatar
- Edit your account information, to a somewhat limited extent (students are no longer allowed to change their username or password without teacher approval)

## Notes to self

- [ ] Actual image upload instead of image URL
- [ ] Better demo testing like with Habitat
- [ ] Teacher should be able to rearrange categories
- [ ] Way more options for homework assignments - # of coins per assignment, divide assignments into chunks and if so how many chunks, how many assignments per homework entry
- [ ] MAYBE redo whole thing in Next.js - better routing, SSR would be great - plus it would be easier to migrate to Vercel and not have to deal with Heroku wait times