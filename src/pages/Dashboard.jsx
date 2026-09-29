import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAppState } from "../context/AppContext.jsx";
import { computePairwiseNet } from "../utils/balances.js";
import { formatINR, groupCategoryMeta } from "../utils/constants.js";
import { roundRupees } from "../utils/money.js";
import Clock from "../components/Clock.jsx";
import DuesList from "../components/DuesList.jsx";
import PaymentChart from "../components/PaymentChart.jsx";
import ActivityFeed from "../components/ActivityFeed.jsx";
import CategoryPieChart from "../components/CategoryPieChart.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { members, groups, expenses } = useAppState();
  const self = members.find((m) => m.isSelf);

  const stats = useMemo(() => {
    const pairs = computePairwiseNet(expenses);
    const youOwe = roundRupees(pairs.filter((p) => p.from === self.id).reduce((s, p) => s + p.amount, 0));
    const owedToYou = roundRupees(pairs.filter((p) => p.to === self.id).reduce((s, p) => s + p.amount, 0));
    const totalSpent = roundRupees(expenses.filter((e) => !e.isSettlement && e.type !== "loan").reduce((s, e) => s + e.amount, 0));
    return { youOwe, owedToYou, totalSpent };
  }, [expenses, self.id]);

  const hasPeople = members.length > 1;

  return (
    <div className="page dashboard">
      <div className="dashboard-banner">
        <div>
          <h2>Namaste, {user.name.split(" ")[0]} 👋</h2>
          <p>Here's where you stand with everyone.</p>
        </div>
        <Clock />
      </div>

      <div className="stat-grid">
        <div className="stat-card good">
          <span className="stat-icon">📥</span>
          <div>
            <div className="stat-value credit">{formatINR(stats.owedToYou)}</div>
            <div className="stat-label">You're owed</div>
          </div>
        </div>
        <div className={`stat-card ${stats.youOwe > 0 ? "warn" : ""}`}>
          <span className="stat-icon">📤</span>
          <div>
            <div className="stat-value debit">{formatINR(stats.youOwe)}</div>
            <div className="stat-label">You owe</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💸</span>
          <div>
            <div className="stat-value">{formatINR(stats.totalSpent)}</div>
            <div className="stat-label">Total spent together</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div>
            <div className="stat-value">{members.length - 1}</div>
            <div className="stat-label">People</div>
          </div>
        </div>
      </div>

      {!hasPeople ? (
        <div className="empty-state">
          <strong>Start by adding someone</strong>
          Add a friend, family member, or flatmate — then log your first shared expense. Groups are optional.
          <div style={{ marginTop: 16 }}>
            <Link className="primary-btn" to="/people">Add a person</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="section-head">
            <h3>Your dues</h3>
            <Link to="/settle" className="due-link">All dues →</Link>
          </div>
          <DuesList members={members} expenses={expenses} onlyMine emptyText="Log an expense and it will show up here." />

          <div className="paper-card">
            <h3>Spending by category</h3>
            <CategoryPieChart expenses={expenses} />
          </div>

          <div className="dashboard-grid">
            <div className="paper-card">
              <h3>Who's paid the most</h3>
              <PaymentChart members={members} expenses={expenses} />
            </div>
            <div className="paper-card">
              <h3>Recent activity</h3>
              <ActivityFeed members={members} expenses={expenses} />
            </div>
          </div>
        </>
      )}

      <div className="section-head">
        <h3>Groups <span className="optional-tag">optional</span></h3>
        <Link to="/groups" className="due-link">Manage groups →</Link>
      </div>
      {groups.length === 0 ? (
        <p className="muted">No groups yet — and that's fine. You can split with people directly, or create a group for a trip or flat.</p>
      ) : (
        <div className="group-card-grid">
          {groups.map((g) => {
            const cat = groupCategoryMeta(g.category);
            const count = expenses.filter((e) => e.groupId === g.id && !e.isSettlement).length;
            return (
              <Link to={`/groups/${g.id}`} className="group-card" key={g.id}>
                <span className="group-icon" style={{ background: cat.color + "22", color: cat.color }}>{cat.icon}</span>
                <div className="group-card-name">{g.name}</div>
                <div className="group-card-meta">{g.memberIds.length} people · {count} expense{count === 1 ? "" : "s"}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}