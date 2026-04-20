import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, Circle, Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Task } from "./TaskCalendar";

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

const serviceTypeColors: Record<string, string> = {
  development: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  support: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  consulting: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  maintenance: "bg-slate-500/10 text-slate-600 border-slate-500/20",
};

export function TaskList({ tasks, onTaskClick, onEditTask, onDeleteTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
        <p className="text-muted-foreground">Start logging time to see your tasks here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          onClick={() => onTaskClick?.(task)}
          className={cn(
            "group flex items-center gap-4 p-4 rounded-xl border border-border bg-card transition-all hover:shadow-card hover:-translate-y-0.5 cursor-pointer",
            "opacity-0 animate-fade-in"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Status Icon */}
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            task.completed ? "bg-success/10" : "bg-primary/10"
          )}>
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5 text-primary" />
            )}
          </div>

          {/* Task Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">
                {task.title || `${task.serviceType} Task`}
              </h3>
              <Badge 
                variant="outline" 
                className={cn("text-xs capitalize", serviceTypeColors[task.serviceType] || serviceTypeColors.development)}
              >
                {task.serviceType}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(task.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {task.startTime} - {task.endTime}
              </span>
              {task.project && (
                <span className="truncate">{task.project}</span>
              )}
            </div>
          </div>

          {/* Hours */}
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-foreground">{task.hours}h</p>
            <p className="text-xs text-muted-foreground">logged</p>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTask?.(task);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
  onClick={(e) => {
    e.stopPropagation();
    console.log("ID desde TaskList:", task.id, "tipo:", typeof task.id);
    onDeleteTask?.(String(task.id))
  }}
>
  <Trash2 className="h-3.5 w-3.5" />
  Delete
</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
