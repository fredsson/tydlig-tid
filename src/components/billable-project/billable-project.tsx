import { ChangeEvent, useEffect, useState } from "react";

import styles from './billable-porject.module.css';

interface Project {
  id: number,
  name: string;
}

const existingProjects = [
   {id: 1, name: 'Internal'},
   {id: 2, name: 'Volvo'},
];

interface BillableProjectProps {
  value: Project | undefined;
  onChange: (project: Project) => void;
}

export default function BillableProject({value, onChange}: BillableProjectProps) {
  const [project, setProject] = useState<Project | undefined>(undefined)
  const [editingProject, setEditingProject] = useState(false);

  useEffect(() => {
    setProject(value);
  }, [value]);

  const handleStartButtonClicked = () => {
    setEditingProject(true);
  };

  const handleEditProject = (ev: ChangeEvent<HTMLSelectElement>) => {
    const selectedId = +ev.target.value;
    const selected = existingProjects.find(p => p.id === selectedId);
    if (!selected) {
      return;
    }
    setProject(selected);
    onChange(selected);
    setEditingProject(false);
  };

  return (
    <>
      <div className={styles['project__row']}>
        <label>Current Project: {project?.name ?? '-'}</label>
        <button onClick={handleStartButtonClicked} className={styles['project__edit-btn']}>Edit</button>
      </div>
      { editingProject ? <>
        <select value={project?.id} onChange={selected => handleEditProject(selected)}>{(project == undefined ? [<option key={0}>Please Select</option>] : []).concat(existingProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>))}</select>  
      </> : ''}
    </>
  );
}
