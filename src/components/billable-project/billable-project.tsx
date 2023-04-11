import { ChangeEvent, useState } from "react";

interface Project {
  id: number,
  name: string;
}

const existingProjects = [
   {id: 1, name: 'Internal'},
   {id: 2, name: 'Volvo'},
];

export default function BillableProject({onChange}: {onChange: (project: Project) => void}) {
  const [project, setProject] = useState<Project | undefined>(undefined)
  const [editingProject, setEditingProject] = useState(false);

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
      <div className="input-container">
        <label>Current Project: {project?.name ?? '-'}</label>
        <button onClick={handleStartButtonClicked} className='start-btn'>Edit</button>
      </div>
      { editingProject ? <>
        <select value={project?.id} onChange={selected => handleEditProject(selected)}>{(project == undefined ? [<option key={0}>Please Select</option>] : []).concat(existingProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>))}</select>  
      </> : ''}
    </>
  );
}