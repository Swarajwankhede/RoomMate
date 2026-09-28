import React from "react";
import { Link } from "react-router-dom";
import { useAppState } from "../context/AppContext.jsx";
import { groupCategoryMeta } from "../utils/constants.js";
import GroupForm from "../components/GroupForm.jsx";

export default function Groups() {
  const { groups } = useAppState();

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h2>Groups <span className="optional-tag">optional</span></h2>
          <p>
            Use a group when several people share costs over time (a flat, a trip, an office lunch club).
            For one-off splits, skip this and add the expense with people directly.
          </p>
        </div>
      </div>

      <div className="paper-card">
        <GroupForm />
      </div>

      {groups.length > 0 && (
        <div className="group-card-grid" style={{ marginTop: 24 }}>
          {groups.map((g) => {
            const cat = groupCategoryMeta(g.category);
            return (
              <Link to={`/groups/${g.id}`} className="group-card" key={g.id}>
                <span className="group-icon" style={{ background: cat.color + "22", color: cat.color }}>{cat.icon}</span>
                <div className="group-card-name">{g.name}</div>
                <div className="group-card-meta">{g.memberIds.length} people · {cat.label}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
