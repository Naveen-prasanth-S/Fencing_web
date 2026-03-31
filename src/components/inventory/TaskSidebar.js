function TaskSidebar({ taskItems, activeTask, onTaskChange }) {
  return (
    <aside className="left-menu">
      {taskItems.map((task) => (
        <button
          key={task.id}
          type="button"
          className={activeTask === task.id ? "active" : ""}
          onClick={() => onTaskChange(task.id)}
        >
          {task.label}
        </button>
      ))}
    </aside>
  );
}

export default TaskSidebar;
