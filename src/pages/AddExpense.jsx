import React from "react";
import ExpenseForm from "../components/ExpenseForm.jsx";

export default function AddExpense() {
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h2>Add an expense</h2>
          <p>Pick a group if you like — or just choose who's sharing. A ticket is generated when you save.</p>
        </div>
      </div>
      <div className="paper-card">
        <ExpenseForm />
      </div>
    </div>
  );
}
