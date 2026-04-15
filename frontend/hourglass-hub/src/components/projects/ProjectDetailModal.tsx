import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  DollarSign,
  Download,
  FileText,
  BarChart3,
  CheckCircle2,
  Circle,
  User,
  Users,
  Plus,
  Trash2,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks, useDeleteTask, type Task } from "@/hooks/useTasks";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { toast } from "sonner";

interface TeamMember {
  name: string;
  avatar: string;
  role?: string;
}

// Task interface is now imported from hook

interface Project {
  id: string;
  name: string;
  client: string;
  status: "active" | "completed" | "on-hold" | "planning" | "In Progress" | "Not Started" | "Cancelled";
  progress: number;
  hoursConsumed: number;
  hoursPool: number;
  endDate: string;
  startDate?: string;
  rate?: number;
  teamLead: TeamMember;
  team: TeamMember[];
  // tasks removed from here as they are fetched separately
}

interface ProjectDetailModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: "Active", class: "bg-success/10 text-success border-success/20" },
  completed: { label: "Completed", class: "bg-primary/10 text-primary border-primary/20" },
  "on-hold": { label: "On Hold", class: "bg-warning/10 text-warning border-warning/20" },
  planning: { label: "Planning", class: "bg-muted text-muted-foreground border-border" },
  // Supabase Enum Values
  "Not Started": { label: "Not Started", class: "bg-muted text-muted-foreground border-border" },
  "In Progress": { label: "In Progress", class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  "Completed": { label: "Completed", class: "bg-green-500/10 text-green-500 border-green-500/20" },
  "On Hold": { label: "On Hold", class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  "Cancelled": { label: "Cancelled", class: "bg-red-500/10 text-red-500 border-red-500/20" },
  // Fallback
  default: { label: "Unknown", class: "bg-slate-100 text-slate-500 border-slate-200" }
};

const taskStatusConfig: Record<string, { label: string; icon: any; class: string }> = {
  'Completed': { label: "Completada", icon: CheckCircle2, class: "text-green-500" },
  'In Progress': { label: "En Progreso", icon: Clock, class: "text-blue-500" },
  'Pending': { label: "Pendiente", icon: Circle, class: "text-gray-400" },
  'On Hold': { label: "En Espera", icon: Circle, class: "text-yellow-500" },
  'Cancelled': { label: "Cancelada", icon: Circle, class: "text-red-500" },
  // Fallback
  default: { label: "Desconocido", icon: Circle, class: "text-gray-400" }
};

// Mock tasks data
// Mock tasks data removed

export function ProjectDetailModal({ project, open, onOpenChange }: ProjectDetailModalProps) {
  if (!project) return null;

  const { data: tasks = [], isLoading: loadingTasks } = useTasks(project.id);
  const deleteTask = useDeleteTask();

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Calcular horas consumidas reales basadas en tareas
  // Si project.hoursConsumed viene de DB (que podría ser una suma calculada), la usamos
  // De lo contrario, sumamos la duración de las tareas
  const realHoursConsumed = tasks.reduce((acc, t) => acc + ((t.duration_in_minutes || 0) / 60), 0);
  const displayHoursConsumed = realHoursConsumed || project.hoursConsumed; // Preferimos el cálculo real si hay tareas

  const hoursPercentage = Math.round((displayHoursConsumed / project.hoursPool) * 100);
  const statusInfo = statusConfig[project.status] || statusConfig.default;

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskFormOpen(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("¿Estás seguro de eliminar esta tarea?")) return;
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success("Tarea eliminada");
    } catch (e) {
      toast.error("Error al eliminar tarea");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col bg-card border-border">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {project.name}
              </DialogTitle>
              <p className="text-muted-foreground">{project.client}</p>
            </div>
            <Badge
              variant="outline"
              className={cn("shrink-0", statusInfo.class)}
            >
              {statusInfo.label}
            </Badge>
          </div>
        </DialogHeader>

        {/* Hours Progress Section */}
        <div className="rounded-xl bg-muted/50 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Hours Pool Progress</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {displayHoursConsumed.toFixed(1)}h / {project.hoursPool}h
            </span>
          </div>
          <Progress value={hoursPercentage} className="h-3 bg-muted" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{hoursPercentage}% consumido</span>
            <span>{(project.hoursPool - displayHoursConsumed).toFixed(1)}h restantes</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="details" className="data-[state=active]:bg-card data-[state=active]:text-primary">
              Details
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-card data-[state=active]:text-primary">
              Tareas ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-card data-[state=active]:text-primary">
              Reportes
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* Details Tab */}
            <TabsContent value="details" className="m-0 space-y-6">
              {/* Project Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">Hourly Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    ${project.rate || 85}/hr
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Total Budget</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    ${((project.rate || 85) * project.hoursPool).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Project Timeline
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p className="font-medium text-foreground">
                      {new Date(project.startDate || "2024-01-15").toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">End Date</p>
                    <p className="font-medium text-foreground">
                      {new Date(project.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Squad */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Technician Squad
                </h4>

                {/* Team Lead */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Project Leader</p>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage src={project.teamLead.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {project.teamLead.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{project.teamLead.name}</p>
                      <p className="text-xs text-muted-foreground">Team Lead</p>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Team Members</p>
                  <div className="grid grid-cols-2 gap-3">
                    {project.team.map((member, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            {member.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">Technician</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="m-0 space-y-3">
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={handleCreateTask} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Tarea
                </Button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No hay tareas registradas en este proyecto.</p>
                </div>
              ) : (
                tasks.map((task, index) => {
                  const statusData = taskStatusConfig[task.status] || taskStatusConfig.default;
                  const StatusIcon = statusData.icon;
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "group flex items-center gap-4 p-4 rounded-xl border border-border bg-card transition-all hover:shadow-card",
                        "opacity-0 animate-fade-in"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <StatusIcon className={cn("h-5 w-5 shrink-0", statusData.class)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">{task.description || "Sin descripción"}</p>
                          <Badge variant="secondary" className="text-[10px] h-5">{task.services?.name}</Badge>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.technician?.full_name || "Sin asignar"}
                          </span>
                          <span>•</span>
                          <span>{task.duration_in_minutes ? (task.duration_in_minutes / 60).toFixed(1) : 0}h registradas</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", statusData.class)}
                        >
                          {statusData.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(task.start_time).toLocaleDateString("es-ES", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTask(task)}>
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="m-0 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Simple PDF Report</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Download a clean summary of project hours, tasks completed, and team performance.
                    </p>
                  </div>
                  <Button className="gap-2 shrink-0">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Graphic Report</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Detailed visual report with charts showing time distribution, progress trends, and analytics.
                    </p>
                  </div>
                  <Button variant="outline" className="gap-2 shrink-0">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="rounded-xl bg-muted/50 p-4">
                <h4 className="font-medium text-foreground mb-2">Report Preview</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
                    <p className="text-xs text-muted-foreground">Total Tasks</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-2xl font-bold text-success">
                      {tasks.filter(t => t.status === "Completed").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-2xl font-bold text-primary">
                      {displayHoursConsumed.toFixed(1)}h
                    </p>
                    <p className="text-xs text-muted-foreground">Horas Registradas</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Task Form Modal */}
        <TaskFormModal
          open={taskFormOpen}
          onOpenChange={setTaskFormOpen}
          task={editingTask}
          projectId={project.id}
        />
      </DialogContent>
    </Dialog>
  );
}