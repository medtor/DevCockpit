import React, { useState } from 'react';
import {
  FileText,
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Pin,
  CheckCircle2,
  Circle,
  Tag,
  Search,
  Check,
  ListTodo,
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { NoteItem, TodoItem, Priority } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { CodeViewer } from '../../components/ui/CodeViewer';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToastStore } from '../../store/useToastStore';

export const NotesTodosView: React.FC = () => {
  const {
    notes,
    todos,
    addNote,
    updateNote,
    deleteNote,
    addTodo,
    updateTodo,
    deleteTodo,
  } = useDataStore();
  const { showToast } = useToastStore();

  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'notes'>('tasks');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Active Note for Editor
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);

  // Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('DevDesk');
  const [notePinned, setNotePinned] = useState(false);

  // Todo Modal State
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [todoTitle, setTodoTitle] = useState('');
  const [todoDescription, setTodoDescription] = useState('');
  const [todoPriority, setTodoPriority] = useState<Priority>('medium');
  const [todoDueDate, setTodoDueDate] = useState('');
  const [todoTags, setTodoTags] = useState('Development');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0] || null;

  // Note Handlers
  const handleOpenAddNote = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('# Architecture Notes\n\n- [ ] Task 1\n- [ ] Task 2');
    setNoteTags('Architecture, Notes');
    setNotePinned(false);
    setIsNoteModalOpen(true);
  };

  const handleOpenEditNote = (n: NoteItem) => {
    setEditingNoteId(n.id);
    setNoteTitle(n.title);
    setNoteContent(n.content);
    setNoteTags((n.tags || []).join(', '));
    setNotePinned(n.isPinned);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      showToast('error', 'Note title is required');
      return;
    }

    const tags = noteTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingNoteId) {
      updateNote(editingNoteId, {
        title: noteTitle,
        content: noteContent,
        tags,
        isPinned: notePinned,
      });
      showToast('success', 'Note updated');
    } else {
      addNote({
        title: noteTitle,
        content: noteContent,
        tags,
        isPinned: notePinned,
      });
      showToast('success', 'Note created');
    }
    setIsNoteModalOpen(false);
  };

  // Todo Handlers
  const handleOpenAddTodo = () => {
    setEditingTodoId(null);
    setTodoTitle('');
    setTodoDescription('');
    setTodoPriority('medium');
    setTodoDueDate('');
    setTodoTags('Tasks');
    setSubtasks([]);
    setSubtaskInput('');
    setIsTodoModalOpen(true);
  };

  const handleOpenEditTodo = (t: TodoItem) => {
    setEditingTodoId(t.id);
    setTodoTitle(t.title);
    setTodoDescription(t.description || '');
    setTodoPriority(t.priority);
    setTodoDueDate(t.dueDate || '');
    setTodoTags((t.tags || []).join(', '));
    setSubtasks(t.subtasks || []);
    setSubtaskInput('');
    setIsTodoModalOpen(true);
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `st-${Date.now()}`, title: subtaskInput.trim(), completed: false },
    ]);
    setSubtaskInput('');
  };

  const handleToggleSubtaskInModal = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtaskInModal = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTitle.trim()) {
      showToast('error', 'Task title is required');
      return;
    }

    const tags = todoTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingTodoId) {
      updateTodo(editingTodoId, {
        title: todoTitle,
        description: todoDescription,
        priority: todoPriority,
        dueDate: todoDueDate || undefined,
        tags,
        subtasks,
      });
      showToast('success', 'Task updated');
    } else {
      addTodo({
        title: todoTitle,
        description: todoDescription,
        priority: todoPriority,
        dueDate: todoDueDate || undefined,
        tags,
        completed: false,
        subtasks,
      });
      showToast('success', 'Task created');
    }
    setIsTodoModalOpen(false);
  };

  const handleToggleTodo = (t: TodoItem) => {
    updateTodo(t.id, { completed: !t.completed });
    if (!t.completed) {
      showToast('success', 'Task completed!');
    }
  };

  const handleToggleSubtask = (todoId: string, subtaskId: string) => {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;
    const updatedSubtasks = (todo.subtasks || []).map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    updateTodo(todoId, { subtasks: updatedSubtasks });
  };

  const filteredTodos = todos.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
      (t.tags || []).some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      (n.tags || []).some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-start">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-rose-500" />
            Engineering Tasks & Markdown Notes
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Track development roadmap items, subtasks, checklists, and scratchpad documentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'tasks' ? (
            <Button onClick={handleOpenAddTodo}>
              <Plus className="h-4 w-4 -ms-0.5 me-1.5" />
              New Task
            </Button>
          ) : (
            <Button onClick={handleOpenAddNote}>
              <Plus className="h-4 w-4 -ms-0.5 me-1.5" />
              New Note
            </Button>
          )}
        </div>
      </div>

      <Tabs
        activeTab={activeSubTab}
        onChange={(tab) => setActiveSubTab(tab as any)}
        tabs={[
          {
            id: 'tasks',
            label: 'Task Roadmap',
            count: todos.filter((t) => !t.completed).length,
            icon: <ListTodo className="h-4 w-4" />,
          },
          {
            id: 'notes',
            label: 'Markdown Notes',
            count: notes.length,
            icon: <FileText className="h-4 w-4" />,
          },
        ]}
      />

      {/* TASKS VIEW */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:max-w-xs">
              <Input
                placeholder="Search tasks, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Priority:</span>
              <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5 text-xs">
                {['all', 'high', 'medium', 'low'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriorityFilter(p)}
                    className={`px-2.5 py-1 rounded-md uppercase font-medium transition-colors ${
                      priorityFilter === p
                        ? 'bg-indigo-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredTodos.length > 0 ? (
            <div className="space-y-2.5">
              {filteredTodos.map((todo) => {
                const subtaskTotal = (todo.subtasks || []).length;
                const subtaskDone = (todo.subtasks || []).filter((s) => s.completed).length;

                return (
                  <Card
                    key={todo.id}
                    className={`p-4 transition-all ${
                      todo.completed
                        ? 'opacity-60 bg-zinc-50 dark:bg-zinc-900/40'
                        : 'bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleTodo(todo)}
                        className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                          todo.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-500'
                        }`}
                      >
                        {todo.completed && <Check className="h-3.5 w-3.5" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4
                              className={`text-xs font-bold ${
                                todo.completed
                                  ? 'line-through text-zinc-500'
                                  : 'text-zinc-900 dark:text-zinc-100'
                              }`}
                            >
                              {todo.title}
                            </h4>
                            {todo.description && (
                              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                                {todo.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge
                              variant={
                                todo.priority === 'high'
                                  ? 'error'
                                  : todo.priority === 'medium'
                                  ? 'warning'
                                  : 'neutral'
                              }
                              size="sm"
                            >
                              {todo.priority}
                            </Badge>
                            <button
                              type="button"
                              onClick={() => handleOpenEditTodo(todo)}
                              className="p-1 text-zinc-400 hover:text-zinc-200"
                              title="Edit"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTodo(todo.id)}
                              className="p-1 text-zinc-400 hover:text-rose-400"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Subtasks Progress */}
                        {subtaskTotal > 0 && (
                          <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-zinc-400">
                              <span>
                                Checklist: {subtaskDone}/{subtaskTotal}
                              </span>
                              <span>{Math.round((subtaskDone / subtaskTotal) * 100)}%</span>
                            </div>
                            <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 transition-all duration-300"
                                style={{ width: `${(subtaskDone / subtaskTotal) * 100}%` }}
                              />
                            </div>
                            <div className="space-y-1 pt-1">
                              {(todo.subtasks || []).map((st) => (
                                <div
                                  key={st.id}
                                  onClick={() => handleToggleSubtask(todo.id, st.id)}
                                  className="flex items-center gap-2 text-xs cursor-pointer text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                                >
                                  <div
                                    className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${
                                      st.completed
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'border-zinc-400 dark:border-zinc-600'
                                    }`}
                                  >
                                    {st.completed && <Check className="h-2.5 w-2.5" />}
                                  </div>
                                  <span
                                    className={st.completed ? 'line-through text-zinc-400' : ''}
                                  >
                                    {st.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(todo.tags || []).map((t) => (
                              <span key={t} className="text-zinc-500">
                                #{t}
                              </span>
                            ))}
                          </div>

                          {todo.dueDate && (
                            <div className="flex items-center gap-1 text-zinc-400">
                              <Calendar className="h-3 w-3" />
                              <span>{todo.dueDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<CheckSquare className="h-6 w-6" />}
              title="No Tasks Found"
              description="Keep your engineering tasks, releases, and milestones organized."
              actionLabel="Add Task"
              onAction={handleOpenAddTodo}
            />
          )}
        </div>
      )}

      {/* NOTES VIEW */}
      {activeSubTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Notes Selector */}
          <div className="lg:col-span-5 space-y-3">
            <Input
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startIcon={<Search className="h-4 w-4" />}
            />

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => {
                  const isSelected = activeNote?.id === note.id;
                  return (
                    <div
                      key={note.id}
                      onClick={() => setActiveNoteId(note.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-start ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {note.isPinned && (
                              <Pin className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {note.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                            {note.content.replace(/[#*`_]/g, '')}
                          </p>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditNote(note)}
                            className="p-1 text-zinc-400 hover:text-zinc-200"
                            title="Edit"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteNote(note.id)}
                            className="p-1 text-zinc-400 hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                        <div className="flex items-center gap-1 flex-wrap">
                          {(note.tags || []).map((t) => (
                            <span key={t}>#{t}</span>
                          ))}
                        </div>
                        <span>
                          {new Date(note.updatedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  icon={<FileText className="h-6 w-6" />}
                  title="No Notes"
                  description="Jot down meeting summaries and architectural drafts."
                  actionLabel="Add Note"
                  onAction={handleOpenAddNote}
                />
              )}
            </div>
          </div>

          {/* Note Reader / Markdown Preview */}
          <div className="lg:col-span-7">
            {activeNote ? (
              <Card className="p-5 space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {activeNote.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                      <span>Updated {new Date(activeNote.updatedAt).toLocaleString()}</span>
                      {(activeNote.tags || []).map((t) => (
                        <Badge key={t} variant="neutral" size="sm">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button size="sm" variant="outline" onClick={() => handleOpenEditNote(activeNote)}>
                    <Edit2 className="h-3.5 w-3.5 -ms-0.5 me-1" />
                    Edit Note
                  </Button>
                </div>

                <CodeViewer
                  code={activeNote.content}
                  language="markdown"
                  maxHeight="420px"
                  showLineNumbers
                />
              </Card>
            ) : (
              <Card className="p-12 text-center text-zinc-400">
                Select or create a note to view content.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={editingNoteId ? 'Edit Note' : 'Create Note'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveNote} className="space-y-4">
          <Input
            label="Title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            required
          />

          <Textarea
            label="Markdown Content"
            rows={10}
            className="font-mono text-xs"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            required
          />

          <Input
            label="Tags (comma-separated)"
            value={noteTags}
            onChange={(e) => setNoteTags(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Note</Button>
          </div>
        </form>
      </Modal>

      {/* Todo Modal */}
      <Modal
        isOpen={isTodoModalOpen}
        onClose={() => setIsTodoModalOpen(false)}
        title={editingTodoId ? 'Edit Task' : 'New Task'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTodo} className="space-y-4">
          <Input
            label="Task Title"
            value={todoTitle}
            onChange={(e) => setTodoTitle(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            rows={2}
            value={todoDescription}
            onChange={(e) => setTodoDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Priority</label>
              <Select
                value={todoPriority}
                onChange={(e) => setTodoPriority(e.target.value as Priority)}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High Priority' },
                ]}
              />
            </div>
            <Input
              label="Due Date"
              type="date"
              value={todoDueDate}
              onChange={(e) => setTodoDueDate(e.target.value)}
            />
          </div>

          {/* Subtasks Section */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-400">Checklist / Subtasks</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add subtask item..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddSubtask}>
                Add
              </Button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1 max-h-36 overflow-y-auto p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 text-xs py-1 px-1.5 hover:bg-zinc-900 rounded"
                  >
                    <div
                      onClick={() => handleToggleSubtaskInModal(st.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <div
                        className={`h-3 w-3 rounded border flex items-center justify-center ${
                          st.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-zinc-600'
                        }`}
                      >
                        {st.completed && <Check className="h-2 w-2" />}
                      </div>
                      <span className={st.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                        {st.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtaskInModal(st.id)}
                      className="text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Tags (comma-separated)"
            value={todoTags}
            onChange={(e) => setTodoTags(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsTodoModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
