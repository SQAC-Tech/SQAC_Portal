import React from "react";
import AppShell from "../../components/common/layout/AppShell";
import MOMGenerator from "../mom/MOMGenerator";

const AdminMOMGenerator = () => (
  <AppShell main={false}>
    <div className="lg:pl-28">
      <MOMGenerator />
    </div>
  </AppShell>
);

export default AdminMOMGenerator;
