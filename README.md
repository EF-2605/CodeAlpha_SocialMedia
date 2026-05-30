# ConnectHub — Mini Social Media Platform

A full-stack mini social media application built for the **CodeAlpha Full Stack Development Internship — Task 2**.

---

## About The Project

**ConnectHub** is a feature-rich social media platform with user profiles, posts, comments, likes, and a follow system. Built with a dark, modern aesthetic using React.js with a fully structured backend-ready architecture.

Task 2 Requirement: User profiles, posts & comments, like/follow system, full stack with database for users, posts, comments, followers.

---

## Features

### User Profiles
- Registration and login system
- Custom profile pages with cover, avatar, bio
- Edit profile bio
- Follower and following counts
- Personal post history

### Posts & Comments
- Create posts with text and emoji images
- Delete your own posts
- Comment on any post (press Enter or click Post)
- Nested comment display with author info

### Like & Follow System
- Like / unlike any post
- Follow / unfollow users
- Following feed tab (only see posts from people you follow)
- Who to Follow suggestions sidebar
- Explore page with all users

### Feed & Discovery
- For You feed (all posts)
- Following feed (filtered)
- Explore page with user cards
- Trending topics sidebar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, CSS3, JavaScript ES6+ |
| State Management | React useReducer |
| Build Tool | Vite 5 |
| Backend Ready | Node.js / Express.js |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/EF-2605/CodeAlpha_SocialMedia.git
cd CodeAlpha_SocialMedia

# Install dependencies
npm install

# Start development server
npm run dev

# Open: http://localhost:5173
```

---

## Demo Credentials

```
Username: demouser
Password: demo123
```

Other demo accounts (password: demo123):
- alexrivera
- zaraahmed
- marcuschen

---

## Project Structure

```
CodeAlpha_SocialMedia/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
└── src/
    ├── main.jsx        (React entry point)
    └── App.jsx         (Full application)
                        Components: Navbar, Feed, PostCard,
                        Composer, Profile, Explore, Auth,
                        SidebarLeft, SidebarRight
```

---

## App Pages

| Page | Description |
|---|---|
| Feed | Posts with For You / Following tabs |
| Profile | User profile with bio, stats, posts |
| Explore | Discover and follow other users |
| Login | Sign in with credentials |
| Register | Create new account |

---

## Backend Integration

```javascript
// Get posts feed
const posts = await fetch('/api/posts').then(r => r.json());

// Create post
await fetch('/api/posts', {
  method: 'POST',
  body: JSON.stringify({ content, image, userId })
});

// Follow user
await fetch(`/api/users/${userId}/follow`, { method: 'POST' });

// Like post
await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
```

Recommended: Node.js + Express.js + MongoDB

---

## Internship Details

| Detail | Info |
|---|---|
| Organization | CodeAlpha |
| Program | Full Stack Development Internship |
| Task | Task 2 — Social Media Platform |
| Frontend | React.js, CSS3, JavaScript |
| Backend | Node.js / Express.js |

---

## Author

[Eshaal Fatima]
Full Stack Development Intern at CodeAlpha
LinkedIn: https://www.linkedin.com/in/eshaal-fatima-882906370/
GitHub: https://github.com/EF-2605

---

Built with love for CodeAlpha Full Stack Development Internship
