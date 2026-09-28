import React from "react";
import { useAppState } from "../context/AppContext.jsx";
import DuesList from "../components/DuesList.jsx";

export default function Settle() {
  const { members, expenses } = useAppState();

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h2>Settle up</h2>
          <p>
            Dues are netted between each pair of people, so if you bought them coffee and they bought you
            biscuits, only the difference is left to pay.
          </p>
        </div>
      </div>
      <DuesList members={members} expenses={expenses} />
    </div>
  );
}
