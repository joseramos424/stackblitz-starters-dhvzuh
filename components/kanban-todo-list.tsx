'use client'

import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { PlusCircle, GripVertical, ChevronDown, AlertCircle, AlertTriangle, CheckCircle2, Trash2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type Priority = 'normal' | 'urgente' | 'inmediata'
type Status = 'inicio' | 'enmarcha' | 'acabado'

type Comment = {
  id: string
  content: string
  timestamp: number
}

type Task = {
  id: string
  content: string
  status: Status
  priority: Priority
  comments: Comment[]
}

type Column = {
  id: Status
  title: string
  tasks: Task[]
  color: string
}

const initialColumns: Column[] = [
  { id: 'inicio', title: 'Inicio', tasks: [], color: 'bg-blue-100' },
  { id: 'enmarcha', title: 'En Marcha', tasks: [], color: 'bg-yellow-100' },
  { id: 'acabado', title: 'Acabado', tasks: [], color: 'bg-red-100' },
]

const priorityColors: Record<Priority, string> = {
  normal: 'bg-green-100',
  urgente: 'bg-orange-100',
  inmediata: 'bg-red-100'
}

export function KanbanTodoListComponent() {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [newTask, setNewTask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result
    if (!destination) return

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)
    if (!sourceColumn || !destColumn) return

    const newColumns = columns.map(col => {
      if (col.id === source.droppableId) {
        const newTasks = Array.from(col.tasks)
        const [movedTask] = newTasks.splice(source.index, 1)
        movedTask.status = destColumn.id
        return { ...col, tasks: newTasks }
      }
      if (col.id === destination.droppableId) {
        const newTasks = Array.from(col.tasks)
        const movedTask = { ...sourceColumn.tasks[source.index], status: col.id }
        newTasks.splice(destination.index, 0, movedTask)
        return { ...col, tasks: newTasks }
      }
      return col
    })

    setColumns(newColumns)
  }

  const addTask = () => {
    if (!newTask.trim()) return
    const task: Task = {
      id: Date.now().toString(),
      content: newTask.trim(),
      status: 'inicio',
      priority: 'normal',
      comments: []
    }
    const newColumns = columns.map(col =>
      col.id === 'inicio' ? { ...col, tasks: [...col.tasks, task] } : col
    )
    setColumns(newColumns)
    setNewTask('')
  }

  const changeTaskStatus = (taskId: string, newStatus: Status) => {
    const newColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => task.id !== taskId)
    }))

    const taskToMove = columns.flatMap(col => col.tasks).find(task => task.id === taskId)
    if (taskToMove) {
      const updatedTask = { ...taskToMove, status: newStatus }
      newColumns.find(col => col.id === newStatus)?.tasks.push(updatedTask)
    }

    setColumns(newColumns)
  }

  const changeTaskPriority = (taskId: string, newPriority: Priority) => {
    const newColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.map(task =>
        task.id === taskId ? { ...task, priority: newPriority } : task
      )
    }))

    setColumns(newColumns)
  }

  const deleteTask = (taskId: string) => {
    const newColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => task.id !== taskId)
    }))
    setColumns(newColumns)
  }

  const addComment = () => {
    if (!selectedTask || !newComment.trim()) return
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment.trim(),
      timestamp: Date.now()
    }
    const newColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.map(task =>
        task.id === selectedTask.id
          ? { ...task, comments: [...task.comments, comment] }
          : task
      )
    }))
    setColumns(newColumns)
    setNewComment('')
    setSelectedTask(null)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Tareas</h1>
      <div className="flex mb-4">
        <Input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Añadir nueva tarea"
          className="mr-2"
        />
        <Button onClick={addTask}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Tarea
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4">
          {columns.map(column => (
            <div key={column.id} className="flex-1">
              <Card className={column.color}>
                <CardHeader>
                  <CardTitle>{column.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="min-h-[200px]"
                      >
                        {column.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-1 mb-2 rounded shadow flex items-center gap-1 ${priorityColors[task.priority]}`}
                              >
                                <GripVertical className="h-3 w-3 flex-shrink-0" />
                                <span className={`flex-grow text-sm ${task.status === 'acabado' ? 'line-through' : ''}`}>
                                  {task.content}
                                </span>
                                <Select
                                  value={task.status}
                                  onValueChange={(value: Status) => changeTaskStatus(task.id, value)}
                                >
                                  <SelectTrigger className="w-[60px] h-[24px] text-xs">
                                    <SelectValue placeholder="Est">
                                      {task.status === 'inicio' ? 'Ini' : task.status === 'enmarcha' ? 'EnM' : 'Aca'}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="inicio">Inicio</SelectItem>
                                    <SelectItem value="enmarcha">En Marcha</SelectItem>
                                    <SelectItem value="acabado">Acabado</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={task.priority}
                                  onValueChange={(value: Priority) => changeTaskPriority(task.id, value)}
                                >
                                  <SelectTrigger className="w-[60px] h-[24px] text-xs">
                                    <SelectValue placeholder="Pri">
                                      {task.priority.slice(0, 3)}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="urgente">Urgente</SelectItem>
                                    <SelectItem value="inmediata">Inmediata</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => setSelectedTask(task)}
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>Comentarios</DialogTitle>
                                      <DialogDescription>
                                        Añade o ve comentarios para esta tarea.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      {task.comments.map(comment => (
                                        <div key={comment.id} className="text-sm">
                                          <p>{comment.content}</p>
                                          <p className="text-xs text-gray-500">
                                            {new Date(comment.timestamp).toLocaleString()}
                                          </p>
                                        </div>
                                      ))}
                                      <Textarea
                                        placeholder="Añade un comentario"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                      />
                                      <Button onClick={addComment}>Añadir Comentario</Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                {task.status === 'acabado' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => deleteTask(task.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}