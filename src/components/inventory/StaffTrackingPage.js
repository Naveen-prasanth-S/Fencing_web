import { useOutletContext } from "react-router-dom";
import StaffPanel from "./StaffPanel";

function StaffTrackingPage() {
  const {
    staffForm,
    staffLogs,
    staffLogsLoading,
    handleStaffChange,
    handleAddStaffLog,
  } = useOutletContext();

  return (
    <StaffPanel
      staffForm={staffForm}
      staffLogs={staffLogs}
      loading={staffLogsLoading}
      onStaffChange={handleStaffChange}
      onAddStaffLog={handleAddStaffLog}
    />
  );
}

export default StaffTrackingPage;
