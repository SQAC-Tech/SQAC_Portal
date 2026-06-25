import React from "react";
import AppShell from "../../components/common/layout/AppShell";
import MOMList from "../mom/MOMList";

const AdminMOMList = () => (
  <AppShell main={false}>
    <div className="lg:pl-28">
      <MOMList />
    </div>
  </AppShell>
);

export default AdminMOMList;
