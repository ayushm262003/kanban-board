import React, { useState, useEffect } from 'react';
import 'styled-jsx';
import './KanbanBoard.css';
import TodoIcon from './icons_FEtask/To-do.svg';
import InProgressIcon from './icons_FEtask/in-progress.svg';
import DoneIcon from './icons_FEtask/Done.svg';
import CanceledIcon from './icons_FEtask/Cancelled.svg';
import HighPriorityIcon from './icons_FEtask/Img - High Priority.svg';
import MediumPriorityIcon from './icons_FEtask/Img - Medium Priority.svg';
import LowPriorityIcon from './icons_FEtask/Img - Low Priority.svg';
import NoPriorityIcon from './icons_FEtask/No-priority.svg';
import UrgentPriorityColorIcon from './icons_FEtask/SVG - Urgent Priority colour.svg';
import UrgentPriorityGreyIcon from './icons_FEtask/SVG - Urgent Priority grey.svg';
import AddIcon from './icons_FEtask/add.svg';
import MoreOptionsIcon from './icons_FEtask/3 dot menu.svg';
import DisplayIcon from './icons_FEtask/Display.svg';
import BacklogIcon from './icons_FEtask/Backlog.svg';
import DownIcon from './icons_FEtask/down.svg';

interface Task {
  id: string;
  title: string;
  tag: string[];
  userId: string;
  status: string;
  priority: number;
}

interface User {
  id: string;
  name: string;
  available: boolean;
}

const statusIcons: { [key: string]: string } = {
  'Todo': TodoIcon,
  'In Progress': InProgressIcon,
  'Done': DoneIcon,
  'Canceled': CanceledIcon,
  'Backlog': BacklogIcon,
};

const priorityIcons: { [key: number]: string } = {
  4: UrgentPriorityColorIcon,
  3: HighPriorityIcon,
  2: MediumPriorityIcon,
  1: LowPriorityIcon,
  0: NoPriorityIcon
};

const priorityLabels: { [key: number]: string } = {
  4: 'Urgent',
  3: 'High',
  2: 'Medium',
  1: 'Low',
  0: 'No Priority'
};

export default function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [grouping, setGrouping] = useState<'status' | 'user' | 'priority'>('status');
    const [ordering, setOrdering] = useState<'priority' | 'title'>('priority');
    const [isDisplayOpen, setIsDisplayOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          return response.json();
        })
        .then(data => {
          setTasks(data.tickets);
          setUsers(data.users);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }, []);
  
    // Grouping Tasks based on the selected grouping type
    const getGroupedTasks = () => {
      const grouped: Record<string, Task[]> = {};
      tasks.forEach(task => {
        const groupKey = grouping === 'status' ? task.status : (grouping === 'user' ? task.userId : task.priority.toString());
        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push(task);
      });
  
      // Sorting Tasks within each group
      Object.keys(grouped).forEach(key => {
        grouped[key].sort((a, b) =>
          ordering === 'priority' ? b.priority - a.priority : a.title.localeCompare(b.title)
        );
      });
  
      return grouped;
    };
  
    const groupedTasks = getGroupedTasks();
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    if (error) {
      return <div>Error: {error}</div>;
    }
  
    return (
      <div className="kanban-board">
        <div className="header">
          <div className="display-dropdown">
            <button onClick={() => setIsDisplayOpen(!isDisplayOpen)} className="display-button">
              <img src={DisplayIcon} alt="Display" className="icon" /> Display
              <img src={DownIcon} alt="Dropdown" className="chevron" />
            </button>
            {isDisplayOpen && (
              <div className="dropdown-content">
                <div>
                  <label>Grouping</label>
                  <select value={grouping} onChange={(e) => setGrouping(e.target.value as 'status' | 'user' | 'priority')}>
                    <option value="status">Status</option>
                    <option value="user">User</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
                <div>
                  <label>Ordering</label>
                  <select value={ordering} onChange={(e) => setOrdering(e.target.value as 'priority' | 'title')}>
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="board">
          {Object.entries(groupedTasks).map(([groupKey, statusTasks]) => {
            const uniqueUserIds = Array.from(new Set(statusTasks.map(task => task.userId)));
            const userNames = uniqueUserIds.map(id => users.find(u => u.id === id)?.name).filter(Boolean);
            const uniquePriorities = Array.from(new Set(statusTasks.map(task => task.priority)));
  
            return (
              <div key={groupKey} className="column">
                <div className="column-header">
                  <img src={statusIcons[groupKey] || BacklogIcon} alt={`${groupKey} icon`} className="status-icon" />
                  <span className="status-name">
                    {grouping === 'status' && groupKey}
                    {grouping === 'user' && users.find(u => u.id === groupKey)?.name}
                    {grouping === 'priority' && priorityLabels[parseInt(groupKey, 10)]}
                  </span>
  
                  <span className="task-count">{statusTasks.length}</span>
                  <button className="add-task">
                    <img src={AddIcon} alt="Add task" />
                  </button>
                  <button className="more-options">
                    <img src={MoreOptionsIcon} alt="More options" />
                  </button>
                </div>
  
                {/* Display Unique Priority Labels (Only labels, no corresponding numbers) */}
                {grouping === 'priority' && uniquePriorities.length > 0 && (
                  <div className="priority-labels">
                    {uniquePriorities.map(priority => (
                      <div key={priority} className="priority-item">
                        {priorityLabels[priority]}
                      </div>
                    ))}
                  </div>
                )}
  
                {/* Display Unique User Names (Only names, no IDs) */}
                {grouping === 'user' && userNames.length > 0 && (
                  <div className="user-labels">
                    {userNames.map(name => (
                      <div key={name} className="user-item">{name}</div>
                    ))}
                  </div>
                )}
  
                {/* Task Cards */}
                {statusTasks.map(task => {
                  const iconSrc = (task.priority in priorityIcons) ? priorityIcons[task.priority] : NoPriorityIcon;
  
                  return (
                    <div key={task.id} className="task-card">
                      <div className="task-header">
                        <span className="task-id">{task.id}</span>
                        <span className="user-avatar">{users.find(u => u.id === task.userId)?.name[0] || '?'}</span>
                      </div>
                      <div className="task-title">{task.title}</div>
                      <div className="task-tags">
                        {task.tag.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                      <div className="task-priority">
                        <div className="priority-container">
                          <img 
                            src={iconSrc} 
                            alt="Priority icon" 
                            className="priority-icon" 
                          />
                          <span className="priority-label">
                            {priorityLabels[task.priority]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  