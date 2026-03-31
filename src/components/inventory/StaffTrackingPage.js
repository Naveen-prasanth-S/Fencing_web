import { useOutletContext } from "react-router-dom";
import StaffPanel from "./StaffPanel";

function StaffTrackingPage() {
  const { staffForm, staffLogs, handleStaffChange, handleAddStaffLog } = useOutletContext();

  return (
    <StaffPanel
      staffForm={staffForm}
      staffLogs={staffLogs}
      onStaffChange={handleStaffChange}
      onAddStaffLog={handleAddStaffLog}
    />
  );
}

export default StaffTrackingPage;
