import { useState, useReducer, useEffect, useRef } from "react";

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  { id: 1, name: "Alex Rivera", username: "alexrivera", avatar: "AR", bio: "Designer & developer 🎨 Building beautiful things on the web.", followers: [2, 3], following: [2], posts: 12, color: "#6366f1" },
  { id: 2, name: "Zara Ahmed", username: "zaraahmed", avatar: "ZA", bio: "Photography | Travel | Coffee ☕ Capturing moments worldwide.", followers: [1], following: [1, 3], posts: 28, color: "#ec4899" },
  { id: 3, name: "Marcus Chen", username: "marcuschen", avatar: "MC", bio: "Full stack dev 🚀 Open source enthusiast. Building cool stuff.", followers: [2], following: [1], posts: 7, color: "#f59e0b" },
  { id: 4, name: "Demo User", username: "demouser", avatar: "DU", bio: "Hey there! I'm using ConnectHub 👋", followers: [], following: [], posts: 0, color: "#10b981" },
];

const INITIAL_POSTS = [
  { id: 1, userId: 1, content: "Just launched my new portfolio website! After months of work, it's finally live. Built with React and lots of ☕. Check it out and let me know what you think! 🚀", image: null, likes: [2, 3], comments: [{ id: 1, userId: 2, text: "Looks absolutely stunning! Love the animations 🔥", time: "2h ago" }, { id: 2, userId: 3, text: "Great work Alex! The dark mode is chef's kiss 👌", time: "1h ago" }], time: "3h ago", timestamp: Date.now() - 10800000 },
  { id: 2, userId: 2, content: "Golden hour in Lahore 🌅 Sometimes you just need to stop and appreciate how beautiful this city is. This moment felt like pure magic.", image: "🌅", likes: [1, 3], comments: [{ id: 1, userId: 1, text: "Breathtaking shot! Lahore is incredible ❤️", time: "5h ago" }], time: "6h ago", timestamp: Date.now() - 21600000 },
  { id: 3, userId: 3, content: "Hot take: TypeScript should be default in every new JS project. The number of bugs it's saved me from in the last month alone is insane. Fight me 😄 #WebDev #TypeScript", image: null, likes: [1], comments: [], time: "1d ago", timestamp: Date.now() - 86400000 },
  { id: 4, userId: 1, content: "Learning something new every single day. Today's lesson: you don't have to be perfect to start — you just have to start 💪 What are you learning this week?", image: null, likes: [2], comments: [{ id: 1, userId: 2, text: "This hit different today. Needed this reminder!", time: "2d ago" }], time: "2d ago", timestamp: Date.now() - 172800000 },
  { id: 5, userId: 2, content: "Made homemade ramen from scratch today 🍜 Spent 6 hours on the broth and it was absolutely worth every minute. Recipe in comments!", image: "🍜", likes: [1, 3], comments: [{ id: 1, userId: 3, text: "Please share the recipe!!!", time: "3d ago" }, { id: 2, userId: 1, text: "This looks INCREDIBLE", time: "3d ago" }], time: "3d ago", timestamp: Date.now() - 259200000 },
];

// ─── REDUCER ──────────────────────────────────────────────────────────────────
const init = {
  user: null,
  users: INITIAL_USERS,
  posts: INITIAL_POSTS,
  page: "home",
  profileId: null,
  notification: null,
  authMode: "login",
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN": {
      const u = state.users.find(u => u.username === action.username && action.password === "demo123");
      if (!u) return { ...state, notification: { type: "error", msg: "Invalid credentials. Try username: demouser, pass: demo123" } };
      return { ...state, user: u, page: "feed", notification: { type: "success", msg: `Welcome back, ${u.name.split(" ")[0]}! 👋` } };
    }
    case "REGISTER": {
      if (state.users.find(u => u.username === action.data.username)) return { ...state, notification: { type: "error", msg: "Username already taken." } };
      const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];
      const newUser = { id: Date.now(), name: action.data.name, username: action.data.username, avatar: action.data.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(), bio: "Hey there! I'm using ConnectHub 👋", followers: [], following: [], posts: 0, color: colors[Math.floor(Math.random() * colors.length)] };
      return { ...state, users: [...state.users, newUser], user: newUser, page: "feed", notification: { type: "success", msg: `Welcome to ConnectHub, ${newUser.name.split(" ")[0]}! 🎉` } };
    }
    case "LOGOUT": return { ...init, users: state.users, posts: state.posts, notification: { type: "info", msg: "Logged out. See you soon!" } };
    case "SET_PAGE": return { ...state, page: action.page, profileId: action.profileId || null };
    case "SET_AUTH": return { ...state, authMode: action.mode };
    case "CREATE_POST": {
      if (!action.content.trim()) return state;
      const post = { id: Date.now(), userId: state.user.id, content: action.content, image: action.image || null, likes: [], comments: [], time: "just now", timestamp: Date.now() };
      const updatedUsers = state.users.map(u => u.id === state.user.id ? { ...u, posts: u.posts + 1 } : u);
      return { ...state, posts: [post, ...state.posts], users: updatedUsers, user: { ...state.user, posts: state.user.posts + 1 }, notification: { type: "success", msg: "Post shared! ✨" } };
    }
    case "TOGGLE_LIKE": {
      const posts = state.posts.map(p => {
        if (p.id !== action.postId) return p;
        const liked = p.likes.includes(state.user.id);
        return { ...p, likes: liked ? p.likes.filter(id => id !== state.user.id) : [...p.likes, state.user.id] };
      });
      return { ...state, posts };
    }
    case "ADD_COMMENT": {
      if (!action.text.trim()) return state;
      const posts = state.posts.map(p => p.id !== action.postId ? p : { ...p, comments: [...p.comments, { id: Date.now(), userId: state.user.id, text: action.text, time: "just now" }] });
      return { ...state, posts };
    }
    case "TOGGLE_FOLLOW": {
      const targetId = action.userId;
      const isFollowing = state.user.following.includes(targetId);
      const updatedUser = { ...state.user, following: isFollowing ? state.user.following.filter(id => id !== targetId) : [...state.user.following, targetId] };
      const updatedUsers = state.users.map(u => {
        if (u.id === state.user.id) return updatedUser;
        if (u.id === targetId) return { ...u, followers: isFollowing ? u.followers.filter(id => id !== state.user.id) : [...u.followers, state.user.id] };
        return u;
      });
      return { ...state, user: updatedUser, users: updatedUsers, notification: { type: "success", msg: isFollowing ? "Unfollowed." : "Following! 🎉" } };
    }
    case "UPDATE_BIO": {
      const updatedUser = { ...state.user, bio: action.bio };
      const updatedUsers = state.users.map(u => u.id === state.user.id ? updatedUser : u);
      return { ...state, user: updatedUser, users: updatedUsers, notification: { type: "success", msg: "Profile updated! ✅" } };
    }
    case "DELETE_POST": {
      const posts = state.posts.filter(p => p.id !== action.postId);
      const updatedUser = { ...state.user, posts: state.user.posts - 1 };
      const updatedUsers = state.users.map(u => u.id === state.user.id ? updatedUser : u);
      return { ...state, posts, user: updatedUser, users: updatedUsers, notification: { type: "info", msg: "Post deleted." } };
    }
    case "CLEAR_NOTIF": return { ...state, notification: null };
    default: return state;
  }
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0f0f13;--surface:#16161d;--surface2:#1e1e28;--surface3:#252533;
  --border:#2a2a3a;--text:#f0eef8;--muted:#8884a0;--accent:#7c6af7;
  --accent2:#c471ed;--green:#22c55e;--red:#ef4444;--yellow:#f59e0b;
  --radius:14px;--radius-sm:8px;
}
body{font-family:'Sora',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.app{display:flex;flex-direction:column;min-height:100vh}

/* NOTIFICATION */
.notif{position:fixed;top:1rem;right:1rem;z-index:999;padding:.75rem 1.25rem;border-radius:var(--radius-sm);font-size:.85rem;font-weight:500;animation:slideDown .3s ease;max-width:300px;box-shadow:0 8px 32px rgba(0,0,0,.4)}
.notif-success{background:linear-gradient(135deg,#22c55e,#16a34a);color:white}
.notif-error{background:linear-gradient(135deg,#ef4444,#dc2626);color:white}
.notif-info{background:linear-gradient(135deg,#7c6af7,#5b4fcf);color:white}
@keyframes slideDown{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}

/* NAV */
nav{background:rgba(15,15,19,.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 1.5rem;height:58px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.nav-logo{font-family:'Crimson Pro',serif;font-size:1.5rem;font-weight:600;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;cursor:pointer;letter-spacing:-.02em}
.nav-actions{display:flex;align-items:center;gap:.5rem}
.nav-btn{background:none;border:none;color:var(--muted);cursor:pointer;padding:.45rem .85rem;border-radius:var(--radius-sm);font-size:.82rem;font-family:'Sora',sans-serif;font-weight:500;transition:all .15s;display:flex;align-items:center;gap:.4rem}
.nav-btn:hover{background:var(--surface2);color:var(--text)}
.nav-btn.active{color:var(--accent)}
.nav-avatar{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:white;cursor:pointer;flex-shrink:0}

/* LAYOUT */
.layout{display:grid;grid-template-columns:240px 1fr 280px;gap:1.5rem;max-width:1100px;margin:0 auto;padding:1.5rem;width:100%}
.sidebar-left{position:sticky;top:74px;height:fit-content}
.sidebar-right{position:sticky;top:74px;height:fit-content}
.main-feed{min-width:0}

/* SIDEBAR */
.sidebar-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1rem;margin-bottom:1rem}
.sidebar-title{font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-weight:600;margin-bottom:.75rem}
.sidebar-nav-btn{display:flex;align-items:center;gap:.75rem;width:100%;background:none;border:none;color:var(--muted);cursor:pointer;padding:.55rem .75rem;border-radius:var(--radius-sm);font-size:.88rem;font-family:'Sora',sans-serif;font-weight:500;transition:all .15s;text-align:left}
.sidebar-nav-btn:hover,.sidebar-nav-btn.active{background:var(--surface2);color:var(--text)}
.sidebar-nav-btn.active{color:var(--accent)}
.sidebar-nav-btn .icon{font-size:1rem;width:20px;text-align:center}
.user-mini{display:flex;align-items:center;gap:.75rem;padding:.5rem 0}
.user-mini-info{flex:1;min-width:0}
.user-mini-name{font-size:.85rem;font-weight:600;truncate:ellipsis;white-space:nowrap;overflow:hidden}
.user-mini-user{font-size:.75rem;color:var(--muted)}
.follow-btn-sm{background:var(--accent);border:none;color:white;padding:.3rem .7rem;border-radius:50px;font-size:.72rem;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;transition:background .15s;flex-shrink:0}
.follow-btn-sm:hover{background:#6457e8}
.follow-btn-sm.following{background:var(--surface3);color:var(--muted)}

/* POST COMPOSER */
.composer{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem;margin-bottom:1.25rem}
.composer-top{display:flex;gap:.875rem;align-items:flex-start}
.composer-textarea{flex:1;background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:.75rem 1rem;font-size:.9rem;font-family:'Sora',sans-serif;color:var(--text);resize:none;outline:none;min-height:80px;transition:border .15s;line-height:1.55}
.composer-textarea:focus{border-color:var(--accent)}
.composer-textarea::placeholder{color:var(--muted)}
.composer-actions{display:flex;justify-content:space-between;align-items:center;margin-top:.875rem;padding-top:.875rem;border-top:1px solid var(--border)}
.composer-emojis{display:flex;gap:.25rem}
.emoji-btn{background:none;border:none;cursor:pointer;font-size:1.1rem;padding:.25rem;border-radius:6px;transition:transform .15s}
.emoji-btn:hover{transform:scale(1.3)}
.post-btn{background:linear-gradient(135deg,var(--accent),var(--accent2));border:none;color:white;padding:.55rem 1.4rem;border-radius:50px;font-size:.85rem;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;transition:opacity .15s}
.post-btn:hover{opacity:.85}
.post-btn:disabled{opacity:.4;cursor:not-allowed}

/* POST CARD */
.post-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem;margin-bottom:1rem;transition:border-color .2s}
.post-card:hover{border-color:var(--surface3)}
.post-header{display:flex;align-items:center;gap:.875rem;margin-bottom:.875rem}
.post-user-info{flex:1}
.post-name{font-weight:600;font-size:.92rem;cursor:pointer}
.post-name:hover{color:var(--accent)}
.post-meta{font-size:.76rem;color:var(--muted);margin-top:.1rem}
.post-menu{position:relative}
.menu-btn{background:none;border:none;color:var(--muted);cursor:pointer;padding:.35rem;border-radius:6px;font-size:1rem;transition:background .15s}
.menu-btn:hover{background:var(--surface2);color:var(--text)}
.dropdown{position:absolute;right:0;top:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:.35rem;min-width:130px;z-index:50;box-shadow:0 8px 24px rgba(0,0,0,.4)}
.dropdown-item{display:flex;align-items:center;gap:.5rem;width:100%;background:none;border:none;color:var(--text);cursor:pointer;padding:.5rem .75rem;border-radius:6px;font-size:.82rem;font-family:'Sora',sans-serif;transition:background .15s}
.dropdown-item:hover{background:var(--surface3)}
.dropdown-item.danger{color:var(--red)}
.post-image{background:var(--surface2);border-radius:var(--radius-sm);height:160px;display:flex;align-items:center;justify-content:center;font-size:4rem;margin-bottom:.875rem;border:1px solid var(--border)}
.post-content{font-size:.9rem;line-height:1.6;color:#ddd9f0;margin-bottom:1rem;white-space:pre-wrap}
.post-actions{display:flex;gap:1.25rem;padding-top:.75rem;border-top:1px solid var(--border)}
.action-btn{background:none;border:none;color:var(--muted);cursor:pointer;display:flex;align-items:center;gap:.4rem;font-size:.82rem;font-family:'Sora',sans-serif;font-weight:500;padding:.4rem .6rem;border-radius:var(--radius-sm);transition:all .15s}
.action-btn:hover{background:var(--surface2);color:var(--text)}
.action-btn.liked{color:#ef4444}
.action-btn.liked:hover{color:#ef4444}
.like-count{font-weight:600}

/* COMMENTS */
.comments-section{margin-top:.875rem;padding-top:.875rem;border-top:1px solid var(--border)}
.comment{display:flex;gap:.65rem;margin-bottom:.75rem;align-items:flex-start}
.comment-bubble{background:var(--surface2);border-radius:var(--radius-sm);padding:.55rem .85rem;flex:1}
.comment-author{font-size:.78rem;font-weight:600;margin-bottom:.2rem;color:var(--accent)}
.comment-text{font-size:.85rem;line-height:1.5;color:#ccc8e8}
.comment-time{font-size:.7rem;color:var(--muted);margin-top:.15rem}
.comment-input-row{display:flex;gap:.65rem;margin-top:.65rem}
.comment-input{flex:1;background:var(--surface2);border:1.5px solid var(--border);border-radius:50px;padding:.5rem 1rem;font-size:.82rem;font-family:'Sora',sans-serif;color:var(--text);outline:none;transition:border .15s}
.comment-input:focus{border-color:var(--accent)}
.comment-input::placeholder{color:var(--muted)}
.comment-submit{background:var(--accent);border:none;color:white;padding:.5rem 1rem;border-radius:50px;font-size:.78rem;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;transition:background .15s}
.comment-submit:hover{background:#6457e8}

/* AVATAR */
.avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;flex-shrink:0;cursor:pointer}
.avatar-sm{width:36px;height:36px;font-size:.78rem}
.avatar-md{width:44px;height:44px;font-size:.9rem}
.avatar-lg{width:80px;height:80px;font-size:1.4rem}
.avatar-xl{width:100px;height:100px;font-size:1.75rem}

/* PROFILE PAGE */
.profile-header{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:1.25rem}
.profile-cover{height:140px;background:linear-gradient(135deg,var(--accent),var(--accent2));opacity:.6}
.profile-info{padding:0 1.5rem 1.5rem}
.profile-avatar-wrap{margin-top:-50px;margin-bottom:.875rem}
.profile-name{font-size:1.3rem;font-weight:700;margin-bottom:.2rem}
.profile-username{font-size:.85rem;color:var(--muted);margin-bottom:.65rem}
.profile-bio{font-size:.88rem;color:#ccc8e8;line-height:1.55;margin-bottom:1rem}
.profile-stats{display:flex;gap:2rem;margin-bottom:1rem}
.stat{text-align:center}
.stat-num{font-size:1.2rem;font-weight:700}
.stat-label{font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.follow-btn{border:none;padding:.6rem 1.5rem;border-radius:50px;font-size:.85rem;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;transition:all .15s}
.follow-btn-follow{background:linear-gradient(135deg,var(--accent),var(--accent2));color:white}
.follow-btn-following{background:var(--surface2);color:var(--muted);border:1.5px solid var(--border)}
.follow-btn-following:hover{color:var(--red);border-color:var(--red)}
.edit-bio-area{width:100%;background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:.65rem .9rem;font-size:.88rem;font-family:'Sora',sans-serif;color:var(--text);resize:none;outline:none;transition:border .15s;margin-bottom:.65rem}
.edit-bio-area:focus{border-color:var(--accent)}
.save-btn{background:var(--accent);border:none;color:white;padding:.45rem 1.1rem;border-radius:var(--radius-sm);font-size:.82rem;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;margin-right:.5rem}
.cancel-btn{background:none;border:1.5px solid var(--border);color:var(--muted);padding:.45rem 1.1rem;border-radius:var(--radius-sm);font-size:.82rem;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif}

/* AUTH */
.auth-wrap{min-height:calc(100vh - 58px);display:flex;align-items:center;justify-content:center;padding:2rem;background:radial-gradient(ellipse at 50% 0%,rgba(124,106,247,.15) 0%,transparent 60%)}
.auth-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:2.5rem;width:100%;max-width:400px;box-shadow:0 24px 64px rgba(0,0,0,.5)}
.auth-logo{font-family:'Crimson Pro',serif;font-size:2rem;font-weight:600;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.3rem}
.auth-title{font-size:1.2rem;font-weight:700;margin-bottom:.3rem}
.auth-sub{font-size:.85rem;color:var(--muted);margin-bottom:2rem}
.form-group{margin-bottom:1rem}
.form-label{font-size:.78rem;font-weight:600;color:var(--muted);display:block;margin-bottom:.4rem;text-transform:uppercase;letter-spacing:.05em}
.form-input{width:100%;background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:.65rem 1rem;font-size:.9rem;font-family:'Sora',sans-serif;color:var(--text);outline:none;transition:border .15s}
.form-input:focus{border-color:var(--accent)}
.form-input::placeholder{color:var(--muted)}
.auth-btn{width:100%;background:linear-gradient(135deg,var(--accent),var(--accent2));border:none;color:white;padding:.8rem;border-radius:var(--radius-sm);font-size:.95rem;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;margin-top:.5rem;transition:opacity .15s}
.auth-btn:hover{opacity:.85}
.auth-switch{text-align:center;margin-top:1.25rem;font-size:.85rem;color:var(--muted)}
.auth-link{color:var(--accent);cursor:pointer;font-weight:600}
.demo-hint{background:var(--surface2);border-radius:var(--radius-sm);padding:.65rem .9rem;font-size:.78rem;color:var(--muted);margin-top:1rem;border-left:3px solid var(--accent)}

/* EXPLORE */
.explore-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.explore-user-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem;text-align:center;transition:border-color .2s}
.explore-user-card:hover{border-color:var(--accent)}
.explore-name{font-weight:600;font-size:.92rem;margin:.65rem 0 .25rem;cursor:pointer}
.explore-name:hover{color:var(--accent)}
.explore-user{font-size:.78rem;color:var(--muted);margin-bottom:.5rem}
.explore-bio{font-size:.8rem;color:#aaa8c0;line-height:1.45;margin-bottom:.875rem;min-height:36px}
.explore-stats{display:flex;justify-content:center;gap:1.5rem;margin-bottom:.875rem}
.explore-stat{font-size:.78rem;color:var(--muted);text-align:center}
.explore-stat strong{display:block;font-size:.92rem;color:var(--text);font-weight:700}

/* EMPTY STATE */
.empty{text-align:center;padding:4rem 2rem;color:var(--muted)}
.empty-icon{font-size:3rem;margin-bottom:1rem;opacity:.5}
.empty-title{font-weight:600;font-size:1rem;margin-bottom:.4rem;color:var(--text)}
.empty-sub{font-size:.85rem}

/* SECTION TITLE */
.section-title{font-size:1.1rem;font-weight:700;margin-bottom:1.25rem;color:var(--text)}
.section-title span{background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}

/* TABS */
.tabs{display:flex;gap:.25rem;margin-bottom:1.25rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:.25rem}
.tab{flex:1;background:none;border:none;color:var(--muted);cursor:pointer;padding:.5rem;border-radius:6px;font-size:.82rem;font-family:'Sora',sans-serif;font-weight:500;transition:all .15s}
.tab.active{background:var(--surface3);color:var(--text)}

/* SCROLLBAR */
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Avatar({ user, size = "sm", onClick }) {
  const cls = `avatar avatar-${size}`;
  return <div className={cls} style={{ background: user?.color || "#7c6af7" }} onClick={onClick}>{user?.avatar || "?"}</div>;
}

function Notification({ notif, dispatch }) {
  useEffect(() => { if (notif) { const t = setTimeout(() => dispatch({ type: "CLEAR_NOTIF" }), 3500); return () => clearTimeout(t); } }, [notif]);
  if (!notif) return null;
  return <div className={`notif notif-${notif.type}`}>{notif.msg}</div>;
}

// ─── POST CARD ────────────────────────────────────────────────────────────────
function PostCard({ post, state, dispatch }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const author = state.users.find(u => u.id === post.userId);
  const liked = state.user && post.likes.includes(state.user.id);
  const isOwner = state.user && post.userId === state.user.id;
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="post-card">
      <div className="post-header">
        <Avatar user={author} size="md" onClick={() => dispatch({ type: "SET_PAGE", page: "profile", profileId: author?.id })} />
        <div className="post-user-info">
          <div className="post-name" onClick={() => dispatch({ type: "SET_PAGE", page: "profile", profileId: author?.id })}>{author?.name}</div>
          <div className="post-meta">@{author?.username} · {post.time}</div>
        </div>
        {isOwner && (
          <div className="post-menu" ref={menuRef}>
            <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>•••</button>
            {showMenu && (
              <div className="dropdown">
                <button className="dropdown-item danger" onClick={() => { dispatch({ type: "DELETE_POST", postId: post.id }); setShowMenu(false); }}>🗑 Delete Post</button>
              </div>
            )}
          </div>
        )}
      </div>
      {post.image && <div className="post-image">{post.image}</div>}
      <div className="post-content">{post.content}</div>
      <div className="post-actions">
        <button className={`action-btn ${liked ? "liked" : ""}`} onClick={() => state.user && dispatch({ type: "TOGGLE_LIKE", postId: post.id })}>
          {liked ? "❤️" : "🤍"} <span className="like-count">{post.likes.length}</span>
        </button>
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          💬 {post.comments.length}
        </button>
        <button className="action-btn">🔗 Share</button>
      </div>
      {showComments && (
        <div className="comments-section">
          {post.comments.map(c => {
            const cu = state.users.find(u => u.id === c.userId);
            return (
              <div key={c.id} className="comment">
                <Avatar user={cu} size="sm" />
                <div className="comment-bubble">
                  <div className="comment-author">{cu?.name}</div>
                  <div className="comment-text">{c.text}</div>
                  <div className="comment-time">{c.time}</div>
                </div>
              </div>
            );
          })}
          {post.comments.length === 0 && <div style={{ fontSize: ".8rem", color: "var(--muted)", padding: ".5rem 0" }}>No comments yet. Be first!</div>}
          {state.user && (
            <div className="comment-input-row">
              <Avatar user={state.user} size="sm" />
              <input className="comment-input" placeholder="Write a comment…" value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { dispatch({ type: "ADD_COMMENT", postId: post.id, text: commentText }); setCommentText(""); } }} />
              <button className="comment-submit" onClick={() => { dispatch({ type: "ADD_COMMENT", postId: post.id, text: commentText }); setCommentText(""); }}>Post</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── COMPOSER ─────────────────────────────────────────────────────────────────
function Composer({ state, dispatch }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const emojis = ["🚀", "🎨", "💡", "🌅", "☕", "🔥", "💻", "🎉"];
  if (!state.user) return null;
  return (
    <div className="composer">
      <div className="composer-top">
        <Avatar user={state.user} size="md" />
        <textarea className="composer-textarea" placeholder={`What's on your mind, ${state.user.name.split(" ")[0]}?`} value={text} onChange={e => setText(e.target.value)} rows={3} />
      </div>
      <div className="composer-actions">
        <div className="composer-emojis">
          {emojis.map(e => <button key={e} className="emoji-btn" onClick={() => setImage(e)}>{e}</button>)}
          {image && <button className="emoji-btn" style={{ fontSize: ".7rem", color: "var(--muted)" }} onClick={() => setImage(null)}>✕ img</button>}
        </div>
        <button className="post-btn" disabled={!text.trim()} onClick={() => { dispatch({ type: "CREATE_POST", content: text, image }); setText(""); setImage(null); }}>Share Post</button>
      </div>
      {image && <div style={{ marginTop: ".75rem", background: "var(--surface2)", borderRadius: "var(--radius-sm)", padding: ".65rem", fontSize: ".8rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: ".5rem" }}><span style={{ fontSize: "1.5rem" }}>{image}</span> Image selected</div>}
    </div>
  );
}

// ─── SIDEBAR LEFT ─────────────────────────────────────────────────────────────
function SidebarLeft({ state, dispatch }) {
  const navItems = [
    { icon: "🏠", label: "Feed", page: "feed" },
    { icon: "🔍", label: "Explore", page: "explore" },
    { icon: "👤", label: "My Profile", page: "profile", profileId: state.user?.id },
  ];
  return (
    <div className="sidebar-left">
      {state.user && (
        <div className="sidebar-card">
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
            <Avatar user={state.user} size="md" onClick={() => dispatch({ type: "SET_PAGE", page: "profile", profileId: state.user.id })} />
            <div>
              <div style={{ fontWeight: 600, fontSize: ".9rem" }}>{state.user.name}</div>
              <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>@{state.user.username}</div>
            </div>
          </div>
          {navItems.map(item => (
            <button key={item.page + item.label} className={`sidebar-nav-btn ${state.page === item.page && (item.profileId ? state.profileId === state.user?.id : true) ? "active" : ""}`} onClick={() => dispatch({ type: "SET_PAGE", page: item.page, profileId: item.profileId })}>
              <span className="icon">{item.icon}</span> {item.label}
            </button>
          ))}
          <button className="sidebar-nav-btn" onClick={() => dispatch({ type: "LOGOUT" })} style={{ marginTop: ".25rem" }}>
            <span className="icon">🚪</span> Logout
          </button>
        </div>
      )}
      <div className="sidebar-card">
        <div className="sidebar-title">Quick Stats</div>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div><div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{state.user?.posts || 0}</div><div style={{ fontSize: ".7rem", color: "var(--muted)" }}>Posts</div></div>
          <div><div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{state.user?.following?.length || 0}</div><div style={{ fontSize: ".7rem", color: "var(--muted)" }}>Following</div></div>
          <div><div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{state.user ? state.users.find(u => u.id === state.user.id)?.followers?.length || 0 : 0}</div><div style={{ fontSize: ".7rem", color: "var(--muted)" }}>Followers</div></div>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR RIGHT ────────────────────────────────────────────────────────────
function SidebarRight({ state, dispatch }) {
  const suggestions = state.user
    ? state.users.filter(u => u.id !== state.user.id && !state.user.following.includes(u.id)).slice(0, 4)
    : state.users.slice(0, 4);

  return (
    <div className="sidebar-right">
      <div className="sidebar-card">
        <div className="sidebar-title">Who to Follow</div>
        {suggestions.length === 0 ? <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>You're following everyone! 🎉</div> : suggestions.map(u => (
          <div key={u.id} className="user-mini">
            <Avatar user={u} size="sm" onClick={() => dispatch({ type: "SET_PAGE", page: "profile", profileId: u.id })} />
            <div className="user-mini-info">
              <div className="user-mini-name" onClick={() => dispatch({ type: "SET_PAGE", page: "profile", profileId: u.id })}>{u.name}</div>
              <div className="user-mini-user">@{u.username}</div>
            </div>
            {state.user && (
              <button className={`follow-btn-sm ${state.user.following.includes(u.id) ? "following" : ""}`} onClick={() => dispatch({ type: "TOGGLE_FOLLOW", userId: u.id })}>
                {state.user.following.includes(u.id) ? "✓" : "Follow"}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="sidebar-card">
        <div className="sidebar-title">Trending Topics</div>
        {["#WebDev", "#ReactJS", "#OpenSource", "#Design", "#TypeScript"].map((tag, i) => (
          <div key={tag} style={{ display: "flex", justifyContent: "space-between", padding: ".4rem 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
            <span style={{ fontSize: ".85rem", color: "var(--accent)", fontWeight: 500 }}>{tag}</span>
            <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>{Math.floor(Math.random() * 900 + 100)} posts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FEED PAGE ────────────────────────────────────────────────────────────────
function FeedPage({ state, dispatch }) {
  const [tab, setTab] = useState("for-you");
  const feedPosts = tab === "following" && state.user
    ? state.posts.filter(p => state.user.following.includes(p.userId) || p.userId === state.user.id)
    : state.posts;

  return (
    <div className="main-feed">
      <Composer state={state} dispatch={dispatch} />
      {state.user && (
        <div className="tabs">
          <button className={`tab ${tab === "for-you" ? "active" : ""}`} onClick={() => setTab("for-you")}>✨ For You</button>
          <button className={`tab ${tab === "following" ? "active" : ""}`} onClick={() => setTab("following")}>👥 Following</button>
        </div>
      )}
      {feedPosts.length === 0 ? (
        <div className="empty"><div className="empty-icon">📭</div><div className="empty-title">No posts yet</div><div className="empty-sub">Follow people to see their posts here</div></div>
      ) : feedPosts.map(post => <PostCard key={post.id} post={post} state={state} dispatch={dispatch} />)}
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ state, dispatch }) {
  const profileUser = state.users.find(u => u.id === state.profileId) || state.user;
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profileUser?.bio || "");
  const isOwn = state.user && profileUser?.id === state.user.id;
  const isFollowing = state.user && state.user.following.includes(profileUser?.id);
  const userPosts = state.posts.filter(p => p.userId === profileUser?.id);

  if (!profileUser) return <div className="empty"><div className="empty-icon">👤</div><div className="empty-title">User not found</div></div>;

  return (
    <div className="main-feed">
      <div className="profile-header">
        <div className="profile-cover" style={{ background: `linear-gradient(135deg,${profileUser.color},${profileUser.color}88)`, opacity: 1 }} />
        <div className="profile-info">
          <div className="profile-avatar-wrap">
            <Avatar user={profileUser} size="xl" />
          </div>
          <div className="profile-name">{profileUser.name}</div>
          <div className="profile-username">@{profileUser.username}</div>
          {editingBio ? (
            <>
              <textarea className="edit-bio-area" value={bioText} onChange={e => setBioText(e.target.value)} rows={3} />
              <button className="save-btn" onClick={() => { dispatch({ type: "UPDATE_BIO", bio: bioText }); setEditingBio(false); }}>Save</button>
              <button className="cancel-btn" onClick={() => setEditingBio(false)}>Cancel</button>
            </>
          ) : (
            <div className="profile-bio">{profileUser.bio}</div>
          )}
          <div className="profile-stats">
            <div className="stat"><div className="stat-num">{userPosts.length}</div><div className="stat-label">Posts</div></div>
            <div className="stat"><div className="stat-num">{state.users.find(u => u.id === profileUser.id)?.followers?.length || 0}</div><div className="stat-label">Followers</div></div>
            <div className="stat"><div className="stat-num">{profileUser.following?.length || 0}</div><div className="stat-label">Following</div></div>
          </div>
          {isOwn ? (
            <button className="follow-btn follow-btn-following" onClick={() => setEditingBio(true)}>✏️ Edit Profile</button>
          ) : state.user && (
            <button className={`follow-btn ${isFollowing ? "follow-btn-following" : "follow-btn-follow"}`} onClick={() => dispatch({ type: "TOGGLE_FOLLOW", userId: profileUser.id })}>
              {isFollowing ? "✓ Following" : "Follow"}
            </button>
          )}
        </div>
      </div>
      <div className="section-title"><span>Posts</span></div>
      {userPosts.length === 0 ? (
        <div className="empty"><div className="empty-icon">📝</div><div className="empty-title">No posts yet</div><div className="empty-sub">{isOwn ? "Share your first post above!" : "This user hasn't posted yet."}</div></div>
      ) : userPosts.map(post => <PostCard key={post.id} post={post} state={state} dispatch={dispatch} />)}
    </div>
  );
}

// ─── EXPLORE PAGE ─────────────────────────────────────────────────────────────
function ExplorePage({ state, dispatch }) {
  const others = state.users.filter(u => !state.user || u.id !== state.user.id);
  return (
    <div className="main-feed">
      <div className="section-title"><span>Explore</span> People</div>
      <div className="explore-grid">
        {others.map(u => (
          <div key={u.id} className="explore-user-card">
            <Avatar user={u} size="lg" onClick={() => dispatch({ type: "SET_PAGE", page: "profile", profileId: u.id })} />
            <div className="explore-name" onClick={() => dispatch({ type: "SET_PAGE", page: "profile", profileId: u.id })}>{u.name}</div>
            <div className="explore-user">@{u.username}</div>
            <div className="explore-bio">{u.bio}</div>
            <div className="explore-stats">
              <div className="explore-stat"><strong>{state.posts.filter(p => p.userId === u.id).length}</strong>posts</div>
              <div className="explore-stat"><strong>{u.followers.length}</strong>followers</div>
              <div className="explore-stat"><strong>{u.following.length}</strong>following</div>
            </div>
            {state.user && (
              <button className={`follow-btn ${state.user.following.includes(u.id) ? "follow-btn-following" : "follow-btn-follow"}`} onClick={() => dispatch({ type: "TOGGLE_FOLLOW", userId: u.id })}>
                {state.user.following.includes(u.id) ? "✓ Following" : "Follow"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ state, dispatch }) {
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const isLogin = state.authMode === "login";

  const submit = () => {
    if (isLogin) dispatch({ type: "LOGIN", username: form.username, password: form.password });
    else dispatch({ type: "REGISTER", data: form });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">ConnectHub</div>
        <div className="auth-title">{isLogin ? "Welcome back 👋" : "Join ConnectHub 🚀"}</div>
        <div className="auth-sub">{isLogin ? "Sign in to your account" : "Create your account today"}</div>
        {!isLogin && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder={isLogin ? "Enter username" : "Choose a username"} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <button className="auth-btn" onClick={submit}>{isLogin ? "Sign In" : "Create Account"}</button>
        <p className="auth-switch">
          {isLogin ? "New here? " : "Already have an account? "}
          <span className="auth-link" onClick={() => dispatch({ type: "SET_AUTH", mode: isLogin ? "register" : "login" })}>
            {isLogin ? "Create account" : "Sign in"}
          </span>
        </p>
        {isLogin && <div className="demo-hint">💡 Demo: username <strong>demouser</strong> · password <strong>demo123</strong></div>}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, init);

  if (!state.user) return (
    <div className="app">
      <style>{css}</style>
      <Notification notif={state.notification} dispatch={dispatch} />
      <nav>
        <div className="nav-logo">ConnectHub</div>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => dispatch({ type: "SET_AUTH", mode: "login" })}>Login</button>
          <button className="nav-btn" style={{ background: "linear-gradient(135deg,var(--accent),var(--accent2))", color: "white", borderRadius: "8px" }} onClick={() => dispatch({ type: "SET_AUTH", mode: "register" })}>Sign Up</button>
        </div>
      </nav>
      <AuthPage state={state} dispatch={dispatch} />
    </div>
  );

  const renderPage = () => {
    switch (state.page) {
      case "profile": return <ProfilePage state={state} dispatch={dispatch} />;
      case "explore": return <ExplorePage state={state} dispatch={dispatch} />;
      default: return <FeedPage state={state} dispatch={dispatch} />;
    }
  };

  return (
    <div className="app">
      <style>{css}</style>
      <Notification notif={state.notification} dispatch={dispatch} />
      <nav>
        <div className="nav-logo" onClick={() => dispatch({ type: "SET_PAGE", page: "feed" })}>ConnectHub</div>
        <div className="nav-actions">
          <button className={`nav-btn ${state.page === "feed" ? "active" : ""}`} onClick={() => dispatch({ type: "SET_PAGE", page: "feed" })}>🏠 Feed</button>
          <button className={`nav-btn ${state.page === "explore" ? "active" : ""}`} onClick={() => dispatch({ type: "SET_PAGE", page: "explore" })}>🔍 Explore</button>
          <Avatar user={state.user} size="sm" onClick={() => dispatch({ type: "SET_PAGE", page: "profile", profileId: state.user.id })} />
        </div>
      </nav>
      <div className="layout">
        <SidebarLeft state={state} dispatch={dispatch} />
        {renderPage()}
        <SidebarRight state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}
