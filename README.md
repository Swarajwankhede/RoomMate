# RoomMate — Smart Shared Expense Manager (₹)

React + React Router mini-project. Split chai, rent, bills and trips with friends,
family, flatmates or colleagues — dues net out automatically.

## Run it
```bash
npm install
npm run dev      # then open the printed URL (usually http://localhost:5173)
```

## What it does
- **Exact paise maths.** All amounts are handled in integer paise: ₹199 between two people is ₹99.50 each,
  ₹100 between three is ₹33.34 + ₹33.33 + ₹33.33 (always adds up to the total).
- **Sidebar navigation** (collapses to a compact top bar on phones).
- **Register / Login** (localStorage). Each account gets its own private ledger.
  Passwords are salted + SHA-256 hashed. Demo-grade, browser-only auth.
- **Groups are optional.** Add an expense with a group, or split directly with people.
- **People** tagged Friend / Family / Roommate / Colleague, with optional WhatsApp number and UPI ID.
- **Smart deduction.** Dues are netted per pair of people. You buy coffee (₹100, split 2),
  they buy biscuits (₹40) → only "they owe you ₹30" remains. When adding an expense you choose:
  - *Deduct from dues* (with a live before → after preview), or
  - *Paid back right now* (no dues created).
- **Per-person ledger** (`/people/:personId`): the running balance, every entry that built it,
  and a settle form (full or partial, UPI or cash).
- **Ticket** generated for every expense and settlement (`/ticket/:expenseId`), printable.
- **Live IST date/time** in the dashboard's top-right, synced from a public time API.
- **Charts & feed:** who has paid the most overall, plus recent activity.
- **Real-life hooks:** WhatsApp reminder button, "Pay via UPI" deep link, shareable group split.

## Concepts covered
| Concept | Where |
|---|---|
| Components | `src/components/*` |
| Routing (`useParams`, `useSearchParams`, `useNavigate`, protected routes) | `App.jsx`, `pages/*` |
| Forms + validation | `MemberForm`, `GroupForm`, `ExpenseForm`, `SettleForm`, `Login`, `Register` |
| State management (`useReducer` + `useContext`) | `context/AppContext.jsx`, `context/AuthContext.jsx` |
| `useEffect` / `useState` / `useRef` / `useMemo` | `Clock`, `ActivityFeed`, `AppContext`, `ExpenseForm` |
| API integration | `api/datetime.js` (timeapi.io) |

## Folder structure
```
src/
├── api/datetime.js
├── context/        AuthContext.jsx, AppContext.jsx
├── utils/          auth.js, balances.js, constants.js, share.js, ticket.js, time.js
├── components/     Sidebar, Clock, MemberForm, GroupForm, ExpenseForm, SettleForm,
│                   DuesList, DueBreakdown, PaymentChart, ActivityFeed, Ticket
├── pages/          Login, Register, Dashboard, People, PersonDetail, Groups,
│                   GroupDetail, AddExpense, Settle, TicketPage
├── App.jsx, main.jsx, index.css
```

## Routes
`/login` · `/register` · `/` · `/people` · `/people/:personId` · `/groups` ·
`/groups/:groupId` · `/add-expense` (`?group=<id>` optional) · `/settle` · `/ticket/:expenseId`

## Known limitation
Data lives in the browser (localStorage), so it's single-device and the people you add are
contacts, not other logged-in users. For live multi-user sync, swap the reducer's persistence
for Firebase / Supabase.

## v4 changes
- **Styled section headers** for People / Groups / Settle (was plain text) — a `PageHeader` banner component.
- **Delete group** button, now in the group page's header (not buried at the bottom).
- **Flexible remove for people**: removing someone no longer requires clearing their expenses first — you get
  a warning that their name will show as "Someone" in old entries, then it's your call.
- **Add/remove people from an existing group** — a "Manage members" search box on the group page
  (`UPDATE_GROUP_MEMBERS` action).
- **Email a ticket**: each member can have an optional email; the ticket page shows an "Email this ticket"
  button per person who owes a share, opening a pre-filled email in their own mail app (`mailto:` — still a
  manual click to send, since this is frontend-only, no mail server).
- **Search-and-select people picker** (`PeoplePicker`) replaces manual checkbox deselection for both the
  expense split and group membership — type to filter, click to add, remove via the chip's ×.
- **Spending-by-category pie/donut chart** on the dashboard (`CategoryPieChart`), built with a CSS
  `conic-gradient` — each category's slice size is exactly its % of total spend.
