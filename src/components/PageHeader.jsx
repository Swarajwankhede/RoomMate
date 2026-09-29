import React from "react";

// Styled intro banner used at the top of People / Groups / Settle (and
// anywhere else that used to be a plain heading + paragraph).
export default function PageHeader({ icon, title, subtitle, tag, action }) {
  return (
    <div className="page-banner">
      <div className="page-banner-icon">{icon}</div>
      <div className="page-banner-text">
        <h2>
          {title} {tag && <span className="optional-tag">{tag}</span>}
        </h2>
        <p>{subtitle}</p>
      </div>
      {action && <div className="page-banner-action">{action}</div>}
    </div>
  );
}
