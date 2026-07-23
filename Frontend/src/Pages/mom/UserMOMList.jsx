import React from "react";
import AppShell from "../../components/common/layout/AppShell";
import MOMList from "./MOMList";

// Member-facing MOM history — wrapped in AppShell so the sidebar stays visible.
const UserMOMList = () => (
  <AppShell main={false}>
    <div className="lg:pl-28">
      <MOMList embedded />
    </div>
  </AppShell>
);

export default UserMOMList;
