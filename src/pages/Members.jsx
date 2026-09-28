import React from "react";
import { useAppDispatch, useAppState } from "../context/AppContext.jsx";
import MemberForm from "../components/MemberForm.jsx";
import { relationMeta } from "../utils/constants.js";

export default function Members() {
  const { members } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h2>People</h2>
          <p>Everyone you split expenses with — friends, family, flatmates, colleagues.</p>
        </div>
      </div>

      <div className="paper-card">
        <MemberForm />
      </div>

      {members.length > 0 && (
        <div className="member-list">
          {members.map((m) => {
            const relation = relationMeta(m.relation);
            return (
              <div className="member-row" key={m.id}>
                <div className="name-row">
                  <span className="avatar-dot" style={{ background: m.color }} />
                  <span>{m.name}</span>
                  <span className="relation-chip" style={{ color: relation.color, borderColor: relation.color }}>
                    {relation.label}
                  </span>
                </div>
                <button className="delete-btn" onClick={() => dispatch({ type: "REMOVE_MEMBER", id: m.id })}>
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}