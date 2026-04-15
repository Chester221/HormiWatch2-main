import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, FolderKanban, User } from "lucide-react";

interface Activity {
  id: string;
  type: "task" | "project" | "user" | "time";
  message: string;
  user: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "task",
    message: "Completed task 'API Integration' in Project Alpha",
    user: "Maria Garcia",
    time: "2 min ago",
  },
  {
    id: "2",
    type: "time",
    message: "Logged 4 hours on 'Frontend Development'",
    user: "Carlos Rodriguez",
    time: "15 min ago",
  },
  {
    id: "3",
    type: "project",
    message: "New project 'E-commerce Platform' created",
    user: "John Doe",
    time: "1 hour ago",
  },
  {
    id: "4",
    type: "user",
    message: "New team member 'Sofia Martinez' added",
    user: "Admin",
    time: "3 hours ago",
  },
  {
    id: "5",
    type: "task",
    message: "Started working on 'Database Schema Design'",
    user: "Miguel Torres",
    time: "5 hours ago",
  },
];

const iconMap = {
  task: CheckCircle2,
  project: FolderKanban,
  user: User,
  time: Clock,
};

const colorMap = {
  task: "bg-success/10 text-success",
  project: "bg-primary/10 text-primary",
  user: "bg-warning/10 text-warning",
  time: "bg-accent text-accent-foreground",
};

export function ActivityFeed() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.type];
          return (
            <div 
              key={activity.id} 
              className={cn(
                "flex gap-4 rounded-xl p-3 transition-colors hover:bg-muted/50",
                "opacity-0 animate-fade-in"
              )}
              style={{ animationDelay: `${500 + index * 100}ms` }}
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colorMap[activity.type])}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2">{activity.message}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{activity.user}</span>
                  <span>•</span>
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}