import React from "react";
import { useAppState } from "../context/AppContext.jsx";
import DuesList from "../components/DuesList.jsx";
import PageHeader from "../components/PageHeader.jsx";

export default function Settle() {
  const { members, expenses } = useAppState();

  return (
    <div className="page">
      <PageHeader
        icon="🤝"
        title="Settle up"
        subtitle="Dues are netted between each pair of people, so if you bought them coffee and they bought you biscuits, only the difference is left to pay."
      />
      <DuesList members={members} expenses={expenses} />
    </div>
  );
}
