import React from "react";
import AppShell from "../../components/common/layout/AppShell";
import MOMGenerator from "./MOMGenerator";

// Member-facing MOM creation — same AppShell (navbar + sidebar) as the admin
// route, so the sidebar stays visible for members too.
const UserMOMGenerator = () => (
  <AppShell main={false}>
    <div className="lg:pl-28">
      <MOMGenerator embedded />
    </div>
  </AppShell>
);

export default UserMOMGenerator;
